'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a high-impact vehicle ad title from the ad's content.
 *
 * - generateAdTitle - A function that takes the ad content and generates a compelling title.
 * - GenerateAdTitleInput - The input type for the generateAdTitle function.
 * - GenerateAdTitleOutput - The return type for the generateAdTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdTitleInputSchema = z.object({
    adContent: z.string().describe('The full content of the vehicle advertisement.'),
    adType: z.enum(['sell', 'want']).describe('The type of ad (sell or want).'),
    images: z.array(z.string()).optional().describe(
      "A list of data URIs of vehicle images. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
    prompt: `You are an expert copywriter who specializes in creating high-impact, converting vehicle titles. 
    Based on the ad content, generate a short, compelling, and descriptive title for the ad.

    The title should be attention-grabbing and include key vehicle highlights mentioned in the ad content.
    Do not just summarize; create a title that sells or clearly states the want.

    Ad Type: {{{adType}}}
    Ad Content: {{{adContent}}}

    {{#if images}}
    The user has also provided images, analyze them for more context.
    Images:
    {{#each images}}
    - {{media url=this}}
    {{/each}}
    {{/if}}
    
    Generate only the title text.`,
});

const generateAdTitleFlow = ai.defineFlow(
    {
      name: 'generateAdTitleFlow',
      inputSchema: GenerateAdTitleInputSchema,
      outputSchema: GenerateAdTitleOutputSchema,
    },
    async input => {
      const {text} = await generateTitlePrompt(input);
      return text!;
    }
);
