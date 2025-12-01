'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating "wanted" ads for vehicles.
 *
 * The flow takes a description and an optional image of the desired vehicle and generates a draft ad.
 * - generateWantedAd - A function that generates a "wanted" ad.
 * - GenerateWantedAdInput - The input type for the generateWantedAd function.
 * - GenerateWantedAdOutput - The return type for the generateWantedAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateWantedAdInputSchema = z.object({
  description: z.string().describe('A description of the desired item or vehicle.'),
  photoDataUri: z.optional(z.string()).describe(
    "An optional reference photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type GenerateWantedAdInput = z.infer<typeof GenerateWantedAdInputSchema>;

const GenerateWantedAdOutputSchema = z.object({
  title: z.string().describe('A clear and concise title for the wanted ad.'),
  adText: z.string().describe('The generated ad text for the wanted item or vehicle.'),
});
export type GenerateWantedAdOutput = z.infer<typeof GenerateWantedAdOutputSchema>;


export async function generateWantedAd(input: GenerateWantedAdInput): Promise<GenerateWantedAdOutput> {
  return generateWantedAdFlow(input);
}

const generateWantedAdPrompt = ai.definePrompt({
  name: 'generateWantedAdPrompt',
  input: {schema: GenerateWantedAdInputSchema},
  output: {schema: GenerateWantedAdOutputSchema},
  prompt: `You are an expert at writing "wanted" ads for vehicles or other items.
  Based on the user's description and optional reference image, generate a clear, concise title and a full ad text.

  {{#if photoDataUri}}
  Use the provided image as a visual example of what the user is looking for.
  Image: {{media url=photoDataUri}}
  {{/if}}

  Description of desired item: {{{description}}}
  
  Generate a title and the ad text.`,
});

const generateWantedAdFlow = ai.defineFlow(
  {
    name: 'generateWantedAdFlow',
    inputSchema: GenerateWantedAdInputSchema,
    outputSchema: GenerateWantedAdOutputSchema,
  },
  async input => {
    const {output} = await generateWantedAdPrompt(input);
    return output!;
  }
);
