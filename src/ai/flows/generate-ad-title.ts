'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a high-impact ad title from the ad's content.
 *
 * - generateAdTitle - A function that takes the ad content and generates a compelling title.
 * - GenerateAdTitleInput - The input type for the generateAdTitle function.
 * - GenerateAdTitleOutput - The return type for the generateAdTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdTitleInputSchema = z.object({
    adContent: z.string().describe('The full content of the advertisement.'),
    adType: z.enum(['sell', 'want', 'item', 'service']).describe('The type of ad (sell, want, item, or service).'),
});

export type GenerateAdTitleInput = z.infer<typeof GenerateAdTitleInputSchema>;

const GenerateAdTitleOutputSchema = z.string().describe('The generated high-impact ad title.');

export type GenerateAdTitleOutput = z.infer<typeof GenerateAdTitleOutputSchema>;


export async function generateAdTitle(
    input: GenerateAdTitleInput
  ): Promise<GenerateAdTitleOutput> {
    return generateAdTitleFlow(input);
}
  
const generateTitlePrompt = ai.definePrompt({
    name: 'generateTitlePrompt',
    input: {schema: GenerateAdTitleInputSchema},
    output: {schema: GenerateAdTitleOutputSchema},
    prompt: `You are an expert copywriter who specializes in creating high-impact, converting titles for online ads. 
    Based on the ad content, generate a short, compelling, and descriptive title for the ad.

    The title should be attention-grabbing and include key highlights mentioned in the ad content.
    Do not just summarize; create a title that sells, clearly states the want, or describes the service/item.

    Ad Type: {{{adType}}}
    Ad Content: {{{adContent}}}
    
    Generate only the title text.`,
});

const generateAdTitleFlow = ai.defineFlow(
    {
      name: 'generateAdTitleFlow',
      inputSchema: GenerateAdTitleInputSchema,
      outputSchema: GenerateAdTitleOutputSchema,
    },
    async input => {
      console.log('Server: Received input for title generation:', input);
      const {text} = await generateTitlePrompt(input);
      return text!;
    }
);
