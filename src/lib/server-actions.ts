
'use server';

import { generateAdFromImage, GenerateAdFromImageInput } from '@/ai/flows/generate-ad-from-image';
import { generateItemAdFromImage, GenerateItemAdFromImageInput } from '@/ai/flows/generate-item-ad-from-image';
import { generateServiceAd, GenerateServiceAdInput } from '@/ai/flows/generate-service-ad';
import { generateWantedAd, GenerateWantedAdInput } from '@/ai/flows/generate-wanted-ad';
import { suggestAdImprovements, SuggestAdImprovementsInput } from '@/ai/flows/suggest-ad-improvements';
import { generateSaleAdFromText, GenerateSaleAdFromTextInput } from '@/ai/flows/generate-sale-ad-from-text';
import { textToSpeech, TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { generateRealEstateAd, GenerateRealEstateAdInput } from '@/ai/flows/generate-real-estate-ad';
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
    return { id: adDoc.id, ...adDoc.data() } as Ad;
  } catch (error) {
    console.error(`[getAdData] Failed to fetch ad "${adId}":`, error);
    // Re-throwing the error is important so the caller knows the operation failed.
    throw new Error(`Failed to retrieve ad data: ${(error as Error).message}`);
  }
}


// Action to generate a vehicle sale ad from an image
export async function generateAdFromImageAction(input: GenerateAdFromImageInput) {
  try {
    const result = await generateAdFromImage(input);
    return result;
  } catch (error) {
    console.error('Error in generateAdFromImageAction:', error);
    return { error: 'Failed to generate ad from image. The AI model might be unavailable.' };
  }
}

// Action to generate an item for sale ad from an image
export async function generateItemAdFromImageAction(input: GenerateItemAdFromImageInput) {
  try {
    const result = await generateItemAdFromImage(input);
    return result;
  } catch (error) {
    console.error('Error in generateItemAdFromImageAction:', error);
    return { error: 'Failed to generate ad from image. The AI model might be unavailable.' };
  }
}

// Action to generate a service ad from a text description
export async function generateServiceAdAction(input: GenerateServiceAdInput) {
  try {
    const result = await generateServiceAd(input);
    return result;
  } catch (error) {
    console.error('Error in generateServiceAdAction:', error);
    return { error: 'Failed to generate service ad. The AI model might be unavailable.' };
  }
}


// Action to generate a vehicle sale ad from a text description
export async function generateSaleAdFromTextAction(input: GenerateSaleAdFromTextInput) {
  try {
    const result = await generateSaleAdFromText(input);
    return result;
  } catch (error) {
    console.error('Error in generateSaleAdFromTextAction:', error);
    return { error: 'Failed to generate sale ad. The AI model might be unavailable.' };
  }
}

// Action to generate a wanted ad from text
export async function generateWantedAdAction(input: GenerateWantedAdInput) {
  try {
    const result = await generateWantedAd(input);
    return result;
  } catch (error) {
    console.error('Error in generateWantedAdAction:', error);
    return { error: 'Failed to generate wanted ad. The AI model might be unavailable.' };
  }
}

// Action to suggest improvements for an existing ad
export async function suggestAdImprovementsAction(input: SuggestAdImprovementsInput) {
  try {
    const result = await suggestAdImprovements(input);
    return result;
  } catch (error) {
    console.error('Error in suggestAdImprovementsAction:', error);
    return { error: 'Failed to get suggestions. The AI model might be unavailable.' };
  }
}

export async function textToSpeechAction(input: TextToSpeechInput) {
  try {
    const result = await textToSpeech(input);
    return result;
  } catch (error) {
    console.error('Error in textToSpeechAction:', error);
    return { error: 'Failed to generate audio. The AI model might be unavailable.' };
  }
}

// Action to generate a real estate ad
export async function generateRealEstateAdAction(input: GenerateRealEstateAdInput) {
    try {
      const result = await generateRealEstateAd(input);
      return result;
    } catch (error) {
      console.error('Error in generateRealEstateAdAction:', error);
      return { error: 'Failed to generate real estate ad. The AI model might be unavailable.' };
    }
}
