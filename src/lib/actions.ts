'use server';

import { generateAdFromImage, GenerateAdFromImageInput } from '@/ai/flows/generate-ad-from-image';
import { generateWantedAd } from '@/ai/flows/generate-wanted-ad';
import { suggestAdImprovements, SuggestAdImprovementsInput } from '@/ai/flows/suggest-ad-improvements';

// Action to generate an ad from an image
export async function generateAdFromImageAction(input: GenerateAdFromImageInput) {
  try {
    const result = await generateAdFromImage(input);
    return result;
  } catch (error) {
    console.error('Error in generateAdFromImageAction:', error);
    return { error: 'Failed to generate ad from image. The AI model might be unavailable.' };
  }
}

// Action to generate a wanted ad from text
export async function generateWantedAdAction(description: string) {
  try {
    const result = await generateWantedAd(description);
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
