
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  useStorage,
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
import type { Ad } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Helper function to serialize Firestore Timestamps
const serializeTimestamps = (data: any) => {
  if (!data) return data;
  const serializedData = { ...data };
  for (const key in serializedData) {
    if (serializedData[key] instanceof Timestamp) {
      serializedData[key] = serializedData[key].toDate().toISOString();
    }
  }
  return serializedData;
};


export function useFirestoreAds() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const [loading, setLoading] = useState(true);

  // Firestore collection hook for the logged-in user's ads
  const userAdsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/ads`);
  }, [firestore, user]);

  const {
    data: rawAds, // Rename to indicate it's raw data from the hook
    isLoading: firestoreLoading,
    error: firestoreError,
  } = useCollection<Ad>(userAdsCollection);

  const ads = useMemoFirebase(() => {
    if (!rawAds) return null;
    return rawAds.map(serializeTimestamps);
  }, [rawAds]);


  useEffect(() => {
    setLoading(isUserLoading || firestoreLoading);
  }, [isUserLoading, firestoreLoading]);

  const setAd = useCallback(
    async (ad: Ad): Promise<Ad> => {
      if (!user || !firestore || !storage) {
        throw new Error('User must be logged in and services available to save an ad.');
      }
      setLoading(true);

      const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
      
      const imageUrls: string[] = [];
      if (ad.images && ad.images.length > 0) {
        for (const image of ad.images) {
          if (image.startsWith('data:')) {
            // This is a new base64 image, upload it
            const storageRef = ref(storage, `users/${user.uid}/ads/${ad.id}/${uuidv4()}.jpeg`);
            const snapshot = await uploadString(storageRef, image, 'data_url');
            const downloadURL = await getDownloadURL(snapshot.ref);
            imageUrls.push(downloadURL);
          } else {
            // This is an existing URL, keep it
            imageUrls.push(image);
          }
        }
      }
      
      const adToSave: Partial<Ad> & { userId: string; updatedAt: any; createdAt?: any; } = {
        id: ad.id,
        title: ad.title,
        content: ad.content,
        type: ad.type,
        userId: user.uid,
        updatedAt: serverTimestamp(),
        images: imageUrls, 
      };
      
      const docSnap = await getDoc(adRef);
      if (!docSnap.exists()) {
        adToSave.createdAt = serverTimestamp();
      }

      try {
        await setDoc(adRef, adToSave, { merge: true });
        
        const finalAd: Ad = {
            ...ad,
            images: imageUrls,
            id: ad.id,
            userId: user.uid,
        };

        setLoading(false);
        return finalAd;
      } catch (e: any) {
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/ads/${ad.id}`,
          operation: 'write',
          requestResourceData: adToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
      }
    },
    [user, firestore, storage]
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
          const rawData = { id: docSnap.id, ...docSnap.data() };
          return serializeTimestamps(rawData) as Ad;
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
