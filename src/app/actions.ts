
'use server';

import { extractCandidateData } from '@/ai/flows/extract-candidate-data';
import { z } from 'zod';

const actionSchema = z.object({
  cvDataUri: z.string().refine(val => val.startsWith('data:'), {
    message: 'CV data must be a valid data URI',
  }),
});

export async function extractCandidateInfo(formData: { cvDataUri: string }) {
  try {
    const validatedData = actionSchema.safeParse(formData);

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.flatten().fieldErrors };
    }

    const result = await extractCandidateData({
      cvDataUri: validatedData.data.cvDataUri,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred while processing the CV.' };
  }
}
