'use server';

import { generateAdFromImage, GenerateAdFromImageInput } from '@/ai/flows/generate-ad-from-image';
import { generateWantedAd } from '@/ai/flows/generate-wanted-ad';
import { suggestAdImprovements, SuggestAdImprovementsInput } from '@/ai/flows/suggest-ad-improvements';
import { generateAdTitle, GenerateAdTitleInput } from '@/ai/flows/generate-ad-title';
import { generateSaleAdFromText, GenerateSaleAdFromTextInput } from '@/ai/flows/generate-sale-ad-from-text';

// Action to generate a sale ad from an image
export async function generateAdFromImageAction(input: GenerateAdFromImageInput) {
  try {
    const result = await generateAdFromImage(input);
    return result;
  } catch (error) {
    console.error('Error in generateAdFromImageAction:', error);
    return { error: 'Failed to generate ad from image. The AI model might be unavailable.' };
  }
}

// Action to generate a sale ad from a text description
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

// Action to generate an ad title from content
export async function generateAdTitleAction(input: GenerateAdTitleInput) {
    try {
      const result = await generateAdTitle(input);
      return { title: result };
    } catch (error) {
      console.error('Error in generateAdTitleAction:', error);
      return { error: 'Failed to generate ad title. The AI model might be unavailable.' };
    }
}
