'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  doc,
  setDoc,
  collection,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirebaseStorage } from './use-firebase-storage';
import type { Ad } from '@/lib/types';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// A custom hook to manage ads, either in local storage or Firestore
export function useAdStorage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { uploadImages, deleteImage } = useFirebaseStorage();

  // Local state for ads
  const [localAds, setLocalAds] = useState<Ad[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  // Firestore collection hook for logged-in users
  const userAdsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/ads`);
  }, [firestore, user]);

  const {
    data: firestoreAds,
    isLoading: firestoreLoading,
    error: firestoreError,
  } = useCollection<Ad>(firestore ? userAdsCollection : null);

  // Load from local storage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      try {
        const saved = localStorage.getItem('saved-ads');
        if (saved) {
          setLocalAds(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse ads from localStorage', e);
      }
    }
  }, [user]);

  // Migrate local ads to Firestore when user logs in
  useEffect(() => {
    if (user && firestore && localAds.length > 0) {
      const migrate = async () => {
        setIsMigrating(true);
        const batch = writeBatch(firestore);
        for (const ad of localAds) {
          const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
          const imageUrls = await uploadImages(ad.images || []);
          const adToSave: Omit<Ad, 'createdAt'> & { createdAt: any; updatedAt: any; userId: string; } = {
            ...ad,
            userId: user.uid,
            images: imageUrls,
            createdAt: ad.createdAt,
            updatedAt: serverTimestamp(),
          };
          batch.set(adRef, adToSave);
        }
        await batch.commit();
        localStorage.removeItem('saved-ads');
        setLocalAds([]);
        setIsMigrating(false);
      };
      migrate();
    }
  }, [user, firestore, localAds, uploadImages]);

  const ads = useMemo(() => {
    return user ? firestoreAds : localAds;
  }, [user, firestoreAds, localAds]);
  
  const loading = isUserLoading || firestoreLoading || isMigrating;

  const setAd = useCallback(
    async (ad: Ad): Promise<Ad> => {
      if (user && firestore) {
        // Handle images: upload new ones, keep existing URLs
        const imageUrls = await uploadImages(ad.images || []);
        
        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        const adToSave: Partial<Ad> = {
          ...ad,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          images: imageUrls,
        };
  
        // Use a non-blocking update
        setDocumentNonBlocking(adRef, adToSave, { merge: true });
        
        // Return the ad with the final URLs for UI update
        return { ...ad, images: imageUrls, userId: user.uid };
  
      } else {
        // Local storage logic remains the same
        const adToSave: Ad = { ...ad, updatedAt: new Date().toISOString() };
        setLocalAds((prevAds) => {
          const existingIndex = prevAds.findIndex((a) => a.id === ad.id);
          let newAds;
          if (existingIndex > -1) {
            newAds = [...prevAds];
            newAds[existingIndex] = adToSave;
          } else {
            newAds = [...prevAds, adToSave];
          }
          localStorage.setItem('saved-ads', JSON.stringify(newAds));
          return newAds;
        });
        return adToSave;
      }
    },
    [user, firestore, uploadImages]
  );
  
  const deleteAd = useCallback(
    async (ad: Ad) => {
      if (user && firestore) {
        // Delete images from Storage first
        if (ad.images && ad.images.length > 0) {
          for (const imageUrl of ad.images) {
            // Only try to delete if it's a Firebase Storage URL
            if (imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
              try {
                // We don't await this to make deletion feel faster
                deleteImage(imageUrl);
              } catch (error) {
                console.error(`Failed to delete image ${imageUrl}:`, error);
              }
            }
          }
        }
        // Then delete the Firestore document
        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        deleteDocumentNonBlocking(adRef);
      } else {
        setLocalAds((prevAds) => {
          const newAds = prevAds.filter((a) => a.id !== ad.id);
          localStorage.setItem('saved-ads', JSON.stringify(newAds));
          return newAds;
        });
      }
    },
    [user, firestore, deleteImage]
  );

  return { ads, setAd, deleteAd, loading, error: firestoreError };
}
