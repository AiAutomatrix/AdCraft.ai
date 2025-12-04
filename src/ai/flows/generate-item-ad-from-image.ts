'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating item ads from images.
 *
 * - generateItemAdFromImage - A function that takes an image of an item and generates a draft ad.
 * - GenerateItemAdFromImageInput - The input type for the function.
 * - GenerateItemAdFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemAdFromImageInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "Photos of the item, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateItemAdFromImageInput = z.infer<typeof GenerateItemAdFromImageInputSchema>;

const GenerateItemAdFromImageOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the ad.'),
  adText: z.string().describe('The generated ad text.'),
});

export type GenerateItemAdFromImageOutput = z.infer<typeof GenerateItemAdFromImageOutputSchema>;

export async function generateItemAdFromImage(
  input: GenerateItemAdFromImageInput
): Promise<GenerateItemAdFromImageOutput> {
  return generateItemAdFromImageFlow(input);
}

const generateAdPrompt = ai.definePrompt({
  name: 'generateItemAdPrompt',
  input: {schema: GenerateItemAdFromImageInputSchema},
  output: {schema: GenerateItemAdFromImageOutputSchema},
  prompt: `You are an expert in creating compelling advertisements for items for sale.

  Based on the images provided, generate a compelling, descriptive title and a full ad text.
  The generated ad should be concise, attention-grabbing, and highlight the key features of the item shown.

  Here are the images of the item:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  `,
});

const generateItemAdFromImageFlow = ai.defineFlow(
  {
    name: 'generateItemAdFromImageFlow',
    inputSchema: GenerateItemAdFromImageInputSchema,
    outputSchema: GenerateItemAdFromImageOutputSchema,
  },
  async input => {
    const {output} = await generateAdPrompt(input);
    return output!;
  }
);
