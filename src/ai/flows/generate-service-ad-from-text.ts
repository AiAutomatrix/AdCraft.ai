'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating ads for services from a text description.
 *
 * - generateServiceAdFromText - A function that takes a description of a service and generates a draft ad.
 * - GenerateServiceAdFromTextInput - The input type for the function.
 * - GenerateServiceAdFromTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateServiceAdFromTextInputSchema = z.string().describe('A text description of the service being offered.');

export type GenerateServiceAdFromTextInput = z.infer<typeof GenerateServiceAdFromTextInputSchema>;

const GenerateServiceAdFromTextOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the service ad.'),
  adText: z.string().describe('The generated ad text, formatted in Markdown.'),
});

export type GenerateServiceAdFromTextOutput = z.infer<typeof GenerateServiceAdFromTextOutputSchema>;

export async function generateServiceAdFromText(
  input: GenerateServiceAdFromTextInput
): Promise<GenerateServiceAdFromTextOutput> {
  return generateServiceAdFromTextFlow(input);
}

const generateServiceAdPrompt = ai.definePrompt({
  name: 'generateServiceAdFromTextPrompt',
  input: {schema: GenerateServiceAdFromTextInputSchema},
  output: {schema: GenerateServiceAdFromTextOutputSchema},
  prompt: `You are an expert in creating compelling advertisements for services.

  Based on the user's description of a service they want to offer, generate a compelling, descriptive title and a full ad text formatted in Markdown.
  The generated ad should be professional, clear, and highlight the key benefits and value of the service.

  User's service description: {{{$input}}}
  
  Generate a title and the ad text.`,
});

const generateServiceAdFromTextFlow = ai.defineFlow(
  {
    name: 'generateServiceAdFromTextFlow',
    inputSchema: GenerateServiceAdFromTextInputSchema,
    outputSchema: GenerateServiceAdFromTextOutputSchema,
  },
  async input => {
    const {output} = await generateServiceAdPrompt(input);
    return output!;
  }
);
