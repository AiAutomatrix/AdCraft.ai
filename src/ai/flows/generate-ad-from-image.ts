'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating vehicle ads from images.
 *
 * - generateAdFromImage - A function that takes an image of a vehicle and user intent
 *   (sale vs. wanted) and generates a draft ad.
 * - GenerateAdFromImageInput - The input type for the generateAdFromImage function.
 * - GenerateAdFromImageOutput - The return type for the generateAdFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdFromImageInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "A list of photos of the vehicle, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  adType: z.enum(['sell', 'want']).describe('The type of ad to generate (sell or want).'),
});

export type GenerateAdFromImageInput = z.infer<typeof GenerateAdFromImageInputSchema>;

const GenerateAdFromImageOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the ad.'),
  adText: z.string().describe('The generated ad text, formatted in Markdown.'),
});

export type GenerateAdFromImageOutput = z.infer<typeof GenerateAdFromImageOutputSchema>;

export async function generateAdFromImage(
  input: GenerateAdFromImageInput
): Promise<GenerateAdFromImageOutput> {
  return generateAdFromImageFlow(input);
}

const generateAdPrompt = ai.definePrompt({
  name: 'generateAdPrompt',
  input: {schema: GenerateAdFromImageInputSchema},
  output: {schema: GenerateAdFromImageOutputSchema},
  prompt: `You are an expert in creating compelling vehicle advertisements.

  Analyse Details Based on the provided images and whether the user wants to sell or buy a vehicle, generate a compelling, descriptive title and a full ad text formatted in valid Markdown with proper spacing.
  The generated ad should be concise,car dealership quality, attention-grabbing, and highlight the key features and benefits of the vehicle. 

  The ad should be tailored to the following ad type: {{{adType}}}
  Here are the images of the vehicle:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  `,
});

const generateAdFromImageFlow = ai.defineFlow(
  {
    name: 'generateAdFromImageFlow',
    inputSchema: GenerateAdFromImageInputSchema,
    outputSchema: GenerateAdFromImageOutputSchema,
  },
  async input => {
    const {output} = await generateAdPrompt(input);
    return output!;
  }
);
