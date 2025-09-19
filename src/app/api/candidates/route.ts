import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Candidate, AppData, JobPosting } from '@/lib/types';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.json');

async function readDb(): Promise<AppData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      await writeDb({ jobs: [], candidates: [] }); // Create file if not exists
      return { jobs: [], candidates: [] };
    }
    throw error;
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
}

async function writeDb(data: AppData): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const candidateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  jobId: z.string({ required_error: 'Please select a job.' }),
  skills: z.array(z.string()),
  experience: z.string().optional(),
  jobTitle: z.string(),
  stage: z.enum(['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected']),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = await readDb();
    let candidates = db.candidates || [];

    // Sorting and filtering can be added here
    
    return NextResponse.json({ data: candidates.sort((a,b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to retrieve candidates.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = candidateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = await readDb();
    const newCandidate: Candidate = {
      id: `CAND-${uuidv4()}`,
      avatar: `https://picsum.photos/seed/${uuidv4()}/40/40`,
      lastContact: new Date().toISOString(),
      interactions: [],
      ...validation.data,
    };
    
    if (!db.candidates) {
      db.candidates = [];
    }

    db.candidates.push(newCandidate);
    await writeDb(db);

    return NextResponse.json({ data: newCandidate, error: null }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to create candidate.' }, { status: 500 });
  }
}
