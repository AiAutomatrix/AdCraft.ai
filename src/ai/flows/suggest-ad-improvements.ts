
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
  adType: z
    .enum(['sale', 'wanted', 'item', 'service', 'real-estate'])
    .describe('The type of ad (sale, wanted, item, service, or real-estate).'),
});
export type SuggestAdImprovementsInput = z.infer<
  typeof SuggestAdImprovementsInputSchema
>;

const SuggestAdImprovementsOutputSchema = z.object({
  improvedAdCopy: z.string().describe('The improved ad copy, formatted in valid Markdown.'),
  suggestions: z.array(z.string()).describe('A list of specific, actionable suggestions for improving the ad copy.'),
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
  prompt: `You are an expert ad copywriter. Given the following ad copy and ad type, suggest improvements to make it more effective.
The improved ad copy must be persuasive, grammatically correct, and formatted in valid Markdown. It should highlight key selling points or desired characteristics.

Ad Type: {{adType}}
Ad Copy: {{{adCopy}}}

Provide an improved ad copy and a list of specific suggestions for improvement.
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
