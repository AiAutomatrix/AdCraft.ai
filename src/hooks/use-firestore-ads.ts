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

export function useFirestoreAds() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
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
        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        
        // Create an object with only the text data for Firestore
        const adToSave: Omit<Ad, 'images'> & { userId: string; updatedAt: any; createdAt?: any; } = {
          id: ad.id,
          title: ad.title,
          content: ad.content,
          type: ad.type,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        };
        
        if (!ad.createdAt) {
          adToSave.createdAt = serverTimestamp();
        }

        await setDoc(adRef, adToSave, { merge: true });

        const finalAd = { ...ad, userId: user.uid };
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
        throw e;
      }
    },
    [user, firestore]
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
      
      // Delete the Firestore document
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
    [user, firestore]
  );

  return { ads, getAd, setAd, deleteAd, loading, error: firestoreError };
}
