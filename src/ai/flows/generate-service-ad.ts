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
  description: z.optional(z.string()).describe('An optional text description of the service being offered.'),
  photoDataUris: z.optional(z.array(z.string())).describe(
    "Optional photos related to the service, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
}).refine(data => data.description || (data.photoDataUris && data.photoDataUris.length > 0), {
    message: "Either a description or at least one photo must be provided.",
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

  Based on the user's optional description and optional images, generate a compelling, descriptive title and a full ad text formatted in Markdown.
  At least one input, either an image or a description, will be provided. If only images are provided, analyze them to determine the service.
  The generated ad should be professional, clear, and highlight the key benefits and value of the service.
  
  {{#if photoDataUris}}
  Use the provided images as a visual reference for the service being offered.
  Images:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  {{/if}}

  {{#if description}}
  User's service description: {{{description}}}
  {{/if}}
  
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
