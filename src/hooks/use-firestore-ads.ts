'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'firebase/firestore';
import type { Ad } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirebaseStorage } from './use-firebase-storage';

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
        // Handle image upload before saving the document
        const uploadedImageUrls = await uploadImages(ad.images || []);

        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        const adToSave: Partial<Ad> = {
          ...ad,
          images: uploadedImageUrls, // Use the URLs from storage
          userId: user.uid,
          updatedAt: serverTimestamp(),
        };
        
        // Only set createdAt if it's a new ad (doesn't have one yet)
        if (!ad.createdAt) {
          adToSave.createdAt = serverTimestamp();
        }

        await setDoc(adRef, adToSave, { merge: true });

        const finalAd = { ...ad, images: uploadedImageUrls, userId: user.uid };
        setLoading(false);
        return finalAd;
      } catch (e: any) {
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/ads/${ad.id}`,
          operation: 'write',
          requestResourceData: ad,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e; // Re-throw for component-level error handling if needed
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
        throw new Error('User must be logged in to delete an ad.');
      }
      
      const adToDelete = ads?.find(ad => ad.id === adId);

      // First, delete images from Firebase Storage if they exist
      if (adToDelete?.images) {
        for (const imageUrl of adToDelete.images) {
          try {
            await deleteImage(imageUrl);
          } catch (error) {
            // Log error but don't block deletion of Firestore doc
            console.error(`Failed to delete image ${imageUrl}:`, error);
          }
        }
      }

      // Then, delete the Firestore document
      const adRef = doc(firestore, `users/${user.uid}/ads`, adId);
      try {
        await deleteDoc(adRef);
      } catch (error) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: adRef.path,
            operation: 'delete',
          })
        )
        throw error;
      }
    },
    [user, firestore, deleteImage, ads]
  );

  return { ads, getAd, setAd, deleteAd, loading, error: firestoreError };
}
