
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating real estate ads.
 *
 * - generateRealEstateAd - A function that takes image data URIs of a property
 *   and generates a draft real estate advertisement.
 * - GenerateRealEstateAdInput - The input type for the function.
 * - GenerateRealEstateAdOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRealEstateAdInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "A list of photos of the property, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateRealEstateAdInput = z.infer<typeof GenerateRealEstateAdInputSchema>;

const GenerateRealEstateAdOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the real estate ad.'),
  adText: z.string().describe('The generated ad text for the property, formatted in Markdown.'),
});

export type GenerateRealEstateAdOutput = z.infer<typeof GenerateRealEstateAdOutputSchema>;

export async function generateRealEstateAd(
  input: GenerateRealEstateAdInput
): Promise<GenerateRealEstateAdOutput> {
  return generateRealEstateAdFlow(input);
}

const generateAdPrompt = ai.definePrompt({
  name: 'generateRealEstateAdPrompt',
  input: {schema: GenerateRealEstateAdInputSchema},
  output: {schema: GenerateRealEstateAdOutputSchema},
  prompt: `You are an expert real estate agent specializing in writing compelling property listings.

  Based on the provided images, generate a captivating title and a full ad text.
  The ad text should be formatted in Markdown, highlighting key features like bedrooms, bathrooms, square footage, location, and unique amenities visible in the photos.
  Analyze the style (e.g., modern, colonial, ranch) and condition of the property to create a persuasive and attractive listing.

  Here are the images of the property:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  `,
});

const generateRealEstateAdFlow = ai.defineFlow(
  {
    name: 'generateRealEstateAdFlow',
    inputSchema: GenerateRealEstateAdInputSchema,
    outputSchema: GenerateRealEstateAdOutputSchema,
  },
  async input => {
    const {output} = await generateAdPrompt(input);
    return output!;
  }
);
