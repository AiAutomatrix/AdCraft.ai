'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating vehicle "for sale" ads from a text description.
 *
 * - generateSaleAdFromText - A function that takes a description of a vehicle and generates a draft ad.
 * - GenerateSaleAdFromTextInput - The input type for the generateSaleAdFromText function.
 * - GenerateSaleAdFromTextOutput - The return type for the generateSaleAdFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSaleAdFromTextInputSchema = z.string().describe('A text description of the vehicle for sale.');

export type GenerateSaleAdFromTextInput = z.infer<typeof GenerateSaleAdFromTextInputSchema>;

const GenerateSaleAdFromTextOutputSchema = z.object({
  title: z.string().describe('A compelling and descriptive title for the sale ad.'),
  adText: z.string().describe('The generated ad text, formatted in Markdown.'),
});

export type GenerateSaleAdFromTextOutput = z.infer<typeof GenerateSaleAdFromTextOutputSchema>;

export async function generateSaleAdFromText(
  input: GenerateSaleAdFromTextInput
): Promise<GenerateSaleAdFromTextOutput> {
  return generateSaleAdFromTextFlow(input);
}

const generateSaleAdPrompt = ai.definePrompt({
  name: 'generateSaleAdFromTextPrompt',
  input: {schema: GenerateSaleAdFromTextInputSchema},
  output: {schema: GenerateSaleAdFromTextOutputSchema},
  prompt: `You are an expert in creating compelling vehicle advertisements.

  Based on the user's description of a vehicle they want to sell, generate a compelling, descriptive title and a full ad text formatted in Markdown.
  The generated ad should be concise, attention-grabbing, and highlight the key features and benefits of the vehicle.

  User's vehicle description: {{{$input}}}
  
  Generate a title and the ad text.`,
});

const generateSaleAdFromTextFlow = ai.defineFlow(
  {
    name: 'generateSaleAdFromTextFlow',
    inputSchema: GenerateSaleAdFromTextInputSchema,
    outputSchema: GenerateSaleAdFromTextOutputSchema,
  },
  async input => {
    const {output} = await generateSaleAdPrompt(input);
    return output!;
  }
);
