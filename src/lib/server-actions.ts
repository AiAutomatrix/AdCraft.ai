
'use server';

import { firestore } from '@/lib/firebase-admin';
import type { Ad } from '@/lib/types';


/**
 * Fetches a single ad document from Firestore using the Admin SDK.
 * This is safe to use on the server.
 * @param adId The ID of the ad to fetch.
 * @returns The ad data or null if not found.
 */
export async function getAdData(adId: string): Promise<Ad | null> {
  try {
    const adsSnapshot = await firestore.collectionGroup('ads').where('id', '==', adId).limit(1).get();

    if (adsSnapshot.empty) {
      console.warn(`[getAdData] Ad with ID "${adId}" not found.`);
      return null;
    }

    const adDoc = adsSnapshot.docs[0];
    const adData = adDoc.data();
    // Manually convert Firestore Timestamps to ISO strings
    const convertedData = {
        ...adData,
        createdAt: adData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: adData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
    };
    
    return { id: adDoc.id, ...convertedData } as Ad;

  } catch (error) {
    console.error(`[getAdData] Failed to fetch ad "${adId}":`, error);
    // Re-throwing the error is important so the caller knows the operation failed.
    throw new Error(`Failed to retrieve ad data: ${(error as Error).message}`);
  }
}
