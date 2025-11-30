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
  serverTimestamp,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { useFirebaseStorage } from './use-firebase-storage';
import type { Ad } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useFirestoreAds() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { uploadImages, deleteImage } = useFirebaseStorage();
  const [loading, setLoading] = useState(true);

  // Firestore collection hook for the logged-in user's ads
  const userAdsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/ads`);
  }, [firestore, user]);

  const {
    data: ads,
    isLoading: firestoreLoading,
    error: firestoreError,
  } = useCollection<Ad>(userAdsCollection);

  useEffect(() => {
    setLoading(isUserLoading || firestoreLoading);
  }, [isUserLoading, firestoreLoading]);

  const setAd = useCallback(
    async (ad: Ad): Promise<Ad> => {
      if (!user || !firestore) {
        throw new Error('User must be logged in to save an ad.');
      }
      setLoading(true);

      try {
        // Upload any new images (data URIs) and get their storage URLs
        const imageUrls = await uploadImages(ad.images || []);

        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        const adToSave: Partial<Ad> = {
          ...ad,
          userId: user.uid,
          updatedAt: serverTimestamp(),
          images: imageUrls,
        };
        
        if (!ad.createdAt) {
          adToSave.createdAt = serverTimestamp();
        }

        // Use a standard, awaited setDoc to ensure creation/update
        await setDoc(adRef, adToSave, { merge: true });

        const finalAd = { ...ad, images: imageUrls, userId: user.uid };
        setLoading(false);
        return finalAd;
      } catch (e: any) {
        setLoading(false);
        // Re-throw or handle the error as appropriate
        throw new FirestorePermissionError({
          path: `users/${user.uid}/ads/${ad.id}`,
          operation: 'write',
          requestResourceData: ad,
        });
      }
    },
    [user, firestore, uploadImages]
  );
  
  const getAd = useCallback(
    async (adId: string): Promise<Ad | null> => {
      if (!user || !firestore) {
        console.error('User not authenticated or Firestore not available.');
        return null;
      }
      setLoading(true);
      try {
        const adRef = doc(firestore, `users/${user.uid}/ads`, adId);
        const docSnap = await getDoc(adRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Ad;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, firestore]
  );

  const deleteAd = useCallback(
    async (adId: string) => {
      if (!user || !firestore) {
        console.error('User must be logged in to delete an ad.');
        return;
      }

      // Find the ad in the current state to get image URLs
      const adData = ads?.find(a => a.id === adId);

      // Delete images from Storage first
      if (adData && adData.images && adData.images.length > 0) {
        for (const imageUrl of adData.images) {
          // Only try to delete if it's a Firebase Storage URL
          if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              // We don't await this to make deletion feel faster, but we catch errors
              deleteImage(imageUrl).catch(err => console.error(`Failed to delete image ${imageUrl}:`, err));
            } catch (error) {
              console.error(`Failed to initiate image deletion for ${imageUrl}:`, error);
            }
          }
        }
      }
      
      // Then delete the Firestore document
      const adRef = doc(firestore, `users/${user.uid}/ads`, adId);
      deleteDoc(adRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: adRef.path,
            operation: 'delete',
          })
        )
      });
    },
    [user, firestore, deleteImage, ads]
  );

  return { ads, getAd, setAd, deleteAd, loading, error: firestoreError };
}
