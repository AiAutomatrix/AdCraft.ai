'use server';

/**
 * @fileOverview Suggests improvements to ad copy to attract more potential buyers.
 *
 * - suggestAdImprovements - A function that suggests improvements to ad copy.
 * - SuggestAdImprovementsInput - The input type for the suggestAdImprovements function.
 * - SuggestAdImprovementsOutput - The return type for the suggestAdImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAdImprovementsInputSchema = z.object({
  adCopy: z.string().describe('The current ad copy to improve.'),
  vehicleDescription: z.string().describe('Description of the vehicle.'),
  adType: z.enum(['sale', 'wanted']).describe('The type of ad (sale or wanted).'),
});
export type SuggestAdImprovementsInput = z.infer<
  typeof SuggestAdImprovementsInputSchema
>;

const SuggestAdImprovementsOutputSchema = z.object({
  improvedAdCopy: z.string().describe('The improved ad copy.'),
  suggestions: z.array(z.string()).describe('A list of suggestions for the ad copy.'),
});
export type SuggestAdImprovementsOutput = z.infer<
  typeof SuggestAdImprovementsOutputSchema
>;

export async function suggestAdImprovements(
  input: SuggestAdImprovementsInput
): Promise<SuggestAdImprovementsOutput> {
  return suggestAdImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdImprovementsPrompt',
  input: {schema: SuggestAdImprovementsInputSchema},
  output: {schema: SuggestAdImprovementsOutputSchema},
  prompt: `You are an expert ad copywriter specializing in vehicle advertisements. Given the following ad copy, vehicle description and ad type, suggest improvements to the ad copy to attract more potential buyers. The improved ad copy should be persuasive, grammatically correct, and highlight key selling points or desired characteristics.

Ad Type: {{adType}}
Vehicle Description: {{{vehicleDescription}}}
Ad Copy: {{{adCopy}}}

Provide an improved ad copy and a list of specific suggestions for improvement.

Output in the following JSON format:
{
  "improvedAdCopy": "",
  "suggestions": [""]
}
`,
});

const suggestAdImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestAdImprovementsFlow',
    inputSchema: SuggestAdImprovementsInputSchema,
    outputSchema: SuggestAdImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

