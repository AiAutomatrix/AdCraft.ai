
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
    // A collection group query on a single field can be problematic.
    // A more robust way is to find the ad's parent user first.
    // This is less efficient but avoids the FAILED_PRECONDITION issue without manual index creation.
    const usersSnapshot = await firestore.collection('users').get();
    
    let adDoc;
    for (const userDoc of usersSnapshot.docs) {
      const potentialAdRef = firestore.collection('users').doc(userDoc.id).collection('ads').doc(adId);
      const potentialAdSnap = await potentialAdRef.get();
      if (potentialAdSnap.exists) {
        adDoc = potentialAdSnap;
        break;
      }
    }

    if (!adDoc) {
      console.warn(`[getAdData] Ad with ID "${adId}" not found in any user's collection.`);
      return null;
    }

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
