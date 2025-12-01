'use server';

import { generateAdFromImage, GenerateAdFromImageInput } from '@/ai/flows/generate-ad-from-image';
import { generateItemAdFromImage, GenerateItemAdFromImageInput } from '@/ai/flows/generate-item-ad-from-image';
import { generateServiceAdFromText, GenerateServiceAdFromTextInput } from '@/ai/flows/generate-service-ad-from-text';
import { generateWantedAd } from '@/ai/flows/generate-wanted-ad';
import { suggestAdImprovements, SuggestAdImprovementsInput } from '@/ai/flows/suggest-ad-improvements';
import { generateSaleAdFromText, GenerateSaleAdFromTextInput } from '@/ai/flows/generate-sale-ad-from-text';

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
export async function generateServiceAdFromTextAction(input: GenerateServiceAdFromTextInput) {
  try {
    const result = await generateServiceAdFromText(input);
    return result;
  } catch (error) {
    console.error('Error in generateServiceAdFromTextAction:', error);
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
export async function generateWantedAdAction(description: string) {
  try {
    const result = await generateWantedAd(description);
    return {title: `Wanted: ${description.substring(0, 40)}...`, content: result, type: 'wanted'};
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
