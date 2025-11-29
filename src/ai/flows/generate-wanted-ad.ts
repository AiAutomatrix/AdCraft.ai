'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating "wanted" ads for vehicles.
 *
 * The flow takes a description of the desired vehicle and generates a draft ad.
 * @fileOverview Defines the generateWantedAd flow for creating vehicle wanted ads based on a description.
 * - generateWantedAd - A function that generates a "wanted" ad for a vehicle.
 * - GenerateWantedAdInput - The input type for the generateWantedAd function.
 * - GenerateWantedAdOutput - The return type for the generateWantedAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWantedAdInputSchema = z.string().describe('A description of the desired vehicle.');
export type GenerateWantedAdInput = z.infer<typeof GenerateWantedAdInputSchema>;

const GenerateWantedAdOutputSchema = z.string().describe('A draft of a "wanted" ad for the vehicle.');
export type GenerateWantedAdOutput = z.infer<typeof GenerateWantedAdOutputSchema>;

/**
 * Generates a draft "wanted" ad for a vehicle based on the provided description.
 * @param input - The description of the desired vehicle.
 * @returns A draft of a "wanted" ad for the vehicle.
 */
export async function generateWantedAd(input: GenerateWantedAdInput): Promise<GenerateWantedAdOutput> {
  return generateWantedAdFlow(input);
}

const generateWantedAdPrompt = ai.definePrompt({
  name: 'generateWantedAdPrompt',
  input: {schema: GenerateWantedAdInputSchema},
  output: {schema: GenerateWantedAdOutputSchema},
  prompt: `You are an expert at writing "wanted" ads for vehicles.
  Based on the description of the desired vehicle, generate a draft ad.
  Description: {{{$input}}}`, // Changed to use {{$input}} as schema is just a string
});

const generateWantedAdFlow = ai.defineFlow(
  {
    name: 'generateWantedAdFlow',
    inputSchema: GenerateWantedAdInputSchema,
    outputSchema: GenerateWantedAdOutputSchema,
  },
  async input => {
    const {text} = await generateWantedAdPrompt(input);
    return text!;
  }
);
