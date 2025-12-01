'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating ads for services from a text description and an optional image.
 *
 * - generateServiceAd - A function that takes a description and optional photo of a service and generates a draft ad.
 * - GenerateServiceAdInput - The input type for the function.
 * - GenerateServiceAdOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateServiceAdInputSchema = z.object({
  description: z.string().describe('A text description of the service being offered.'),
  photoDataUri: z.optional(z.string()).describe(
    "An optional photo related to the service, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});


export type GenerateServiceAdInput = z.infer<typeof GenerateServiceAdInputSchema>;

const GenerateServiceAdOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the service ad.'),
  adText: z.string().describe('The generated ad text, formatted in Markdown.'),
});

export type GenerateServiceAdOutput = z.infer<typeof GenerateServiceAdOutputSchema>;

export async function generateServiceAd(
  input: GenerateServiceAdInput
): Promise<GenerateServiceAdOutput> {
  return generateServiceAdFlow(input);
}

const generateServiceAdPrompt = ai.definePrompt({
  name: 'generateServiceAdPrompt',
  input: {schema: GenerateServiceAdInputSchema},
  output: {schema: GenerateServiceAdOutputSchema},
  prompt: `You are an expert in creating compelling advertisements for services.

  Based on the user's description and optional image, generate a compelling, descriptive title and a full ad text formatted in Markdown.
  The generated ad should be professional, clear, and highlight the key benefits and value of the service.
  
  {{#if photoDataUri}}
  Use the provided image as a visual reference for the service being offered.
  Image: {{media url=photoDataUri}}
  {{/if}}

  User's service description: {{{description}}}
  
  Generate a title and the ad text.`,
});

const generateServiceAdFlow = ai.defineFlow(
  {
    name: 'generateServiceAdFlow',
    inputSchema: GenerateServiceAdInputSchema,
    outputSchema: GenerateServiceAdOutputSchema,
  },
  async input => {
    const {output} = await generateServiceAdPrompt(input);
    return output!;
  }
);
