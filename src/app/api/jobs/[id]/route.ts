import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import type { JobPosting } from '@/lib/types';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.json');

async function readDb(): Promise<{ jobs: JobPosting[] }> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
     if (isErrnoException(error) && error.code === 'ENOENT') {
      return { jobs: [] };
    }
    throw error;
  }
}
function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
}


async function writeDb(data: { jobs: JobPosting[] }): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const jobUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  department: z.string().min(1, 'Department is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  salary: z.string().min(1, 'Salary is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required').optional(),
  status: z.enum(['Open', 'Closed', 'On hold', 'Draft']).optional(),
  deadline: z.string().datetime().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await readDb();
    const job = db.jobs.find(j => j.id === params.id);

    if (!job) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ data: job, error: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to retrieve job.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // In a real app, add authentication/authorization checks
  try {
    const body = await request.json();
    const validation = jobUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = await readDb();
    const jobIndex = db.jobs.findIndex(j => j.id === params.id);

    if (jobIndex === -1) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 });
    }

    const updatedJob = { ...db.jobs[jobIndex], ...validation.data };
    db.jobs[jobIndex] = updatedJob;
    await writeDb(db);

    return NextResponse.json({ data: updatedJob, error: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to update job.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // In a real app, add authentication/authorization checks
  try {
    const db = await readDb();
    const jobIndex = db.jobs.findIndex(j => j.id === params.id);

    if (jobIndex === -1) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 });
    }

    db.jobs.splice(jobIndex, 1);
    await writeDb(db);

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to delete job.' }, { status: 500 });
  }
}
