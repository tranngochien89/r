'use server';

/**
 * @fileOverview Automatically extracts key information from candidate CVs.
 *
 * - extractCandidateData - A function that handles the extraction process.
 * - ExtractCandidateDataInput - The input type for the extractCandidateData function.
 * - ExtractCandidateDataOutput - The return type for the extractCandidateData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCandidateDataInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "The candidate's CV, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractCandidateDataInput = z.infer<typeof ExtractCandidateDataInputSchema>;

const ExtractCandidateDataOutputSchema = z.object({
  name: z.string().describe("The candidate's full name."),
  email: z.string().email().describe("The candidate's email address."),
  phone: z.string().describe("The candidate's phone number.").optional(),
  skills: z.array(z.string()).describe("A list of the candidate's skills."),
  experience: z.string().describe("A summary of the candidate's work experience."),
});
export type ExtractCandidateDataOutput = z.infer<typeof ExtractCandidateDataOutputSchema>;

export async function extractCandidateData(input: ExtractCandidateDataInput): Promise<ExtractCandidateDataOutput> {
  return extractCandidateDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractCandidateDataPrompt',
  input: {schema: ExtractCandidateDataInputSchema},
  output: {schema: ExtractCandidateDataOutputSchema},
  prompt: `You are an expert HR assistant specializing in extracting information from resumes.  Extract name, email, phone number, skills, and experience from the following resume. If the phone number is not available, leave blank. Do not make up information.

Resume: {{media url=cvDataUri}}`,
});

const extractCandidateDataFlow = ai.defineFlow(
  {
    name: 'extractCandidateDataFlow',
    inputSchema: ExtractCandidateDataInputSchema,
    outputSchema: ExtractCandidateDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
