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
  serverTimestamp
} from 'firebase/firestore';
import type { Ad } from '@/lib/types';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// A custom hook to manage ads, either in local storage or Firestore
export function useAdStorage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

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
  } = useCollection(userAdsCollection);

  // Load from local storage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const saved = localStorage.getItem('saved-ads');
      if (saved) {
        try {
          setLocalAds(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse ads from localStorage', e);
        }
      }
    }
  }, [user]);

  // Migrate local ads to Firestore when user logs in
  useEffect(() => {
    if (user && firestore && localAds.length > 0) {
      setIsMigrating(true);
      const migrate = async () => {
        const batch = writeBatch(firestore);
        localAds.forEach((ad) => {
          const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
          batch.set(adRef, {...ad, migrated: true, createdAt: ad.createdAt || serverTimestamp() });
        });
        await batch.commit();
        localStorage.removeItem('saved-ads');
        setLocalAds([]);
        setIsMigrating(false);
      };
      migrate();
    }
  }, [user, firestore, localAds]);

  const ads = useMemo(() => {
    return user ? firestoreAds : localAds;
  }, [user, firestoreAds, localAds]);
  
  const loading = isUserLoading || firestoreLoading || isMigrating;

  const setAd = useCallback(
    (ad: Ad) => {
      if (user && firestore) {
        const adRef = doc(firestore, `users/${user.uid}/ads`, ad.id);
        setDocumentNonBlocking(adRef, ad, { merge: true });
      } else {
        setLocalAds((prevAds) => {
          const existing = prevAds.find((a) => a.id === ad.id);
          let newAds;
          if (existing) {
            newAds = prevAds.map((a) => (a.id === ad.id ? ad : a));
          } else {
            newAds = [...prevAds, ad];
          }
          localStorage.setItem('saved-ads', JSON.stringify(newAds));
          return newAds;
        });
      }
    },
    [user, firestore]
  );
  
  const setAds = useCallback(
    (newAds: Ad[] | ((prevAds: Ad[]) => Ad[])) => {
      if (user && firestore) {
        // Not optimized for batch updates, prefer setAd or deleteAd
      } else {
        const adsToSet = typeof newAds === 'function' ? newAds(localAds) : newAds;
        localStorage.setItem('saved-ads', JSON.stringify(adsToSet));
        setLocalAds(adsToSet);
      }
    },
    [user, firestore, localAds]
  );
  

  const deleteAd = useCallback(
    (id: string) => {
      if (user && firestore) {
        const adRef = doc(firestore, `users/${user.uid}/ads`, id);
        deleteDocumentNonBlocking(adRef);
      } else {
        setLocalAds((prevAds) => {
          const newAds = prevAds.filter((ad) => ad.id !== id);
          localStorage.setItem('saved-ads', JSON.stringify(newAds));
          return newAds;
        });
      }
    },
    [user, firestore]
  );

  return { ads, setAd, setAds, deleteAd, loading, error: firestoreError };
}
