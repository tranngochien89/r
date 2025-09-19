import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import type { AppData } from '@/lib/types';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.json');

async function readDb(): Promise<AppData> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
     if (isErrnoException(error) && error.code === 'ENOENT') {
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

const candidateUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobId: z.string().optional(),
  jobTitle: z.string().optional(),
  stage: z.enum(['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected']).optional(),
  skills: z.array(z.string()).optional(),
  lastContact: z.string().date().optional(),
  interactions: z.array(z.object({
    id: z.string(),
    type: z.enum(['note', 'email', 'call']),
    content: z.string(),
    date: z.string().datetime(),
    author: z.string(),
  })).optional(),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await readDb();
    const candidate = db.candidates.find(c => c.id === params.id);

    if (!candidate) {
      return NextResponse.json({ data: null, error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ data: candidate, error: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to retrieve candidate.' }, { status: 500 });
  }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // In a real app, add authentication/authorization checks
  try {
    const body = await request.json();
    const validation = candidateUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = await readDb();
    const candidateIndex = db.candidates.findIndex(c => c.id === params.id);

    if (candidateIndex === -1) {
      return NextResponse.json({ data: null, error: 'Candidate not found' }, { status: 404 });
    }

    const updatedCandidate = { ...db.candidates[candidateIndex], ...validation.data };
    db.candidates[candidateIndex] = updatedCandidate;
    await writeDb(db);

    return NextResponse.json({ data: updatedCandidate, error: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to update candidate.' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // In a real app, add authentication/authorization checks
  try {
    const db = await readDb();
    const candidateIndex = db.candidates.findIndex(c => c.id === params.id);

    if (candidateIndex === -1) {
      return NextResponse.json({ data: null, error: 'Candidate not found' }, { status: 404 });
    }

    db.candidates.splice(candidateIndex, 1);
    await writeDb(db);

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to delete candidate.' }, { status: 500 });
  }
}
