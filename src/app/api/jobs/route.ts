import { NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { JobPosting } from '@/lib/types';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.json');

async function readDb(): Promise<{ jobs: JobPosting[] }> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty structure
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

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  salary: z.string().min(1, 'Salary is required'),
  description: z.string().min(1, 'Description is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  status: z.enum(['Open', 'Closed', 'On hold', 'Draft']),
  deadline: z.string().datetime(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const skills = searchParams.get('skills')?.split(',');

    const db = await readDb();
    let jobs = db.jobs;

    if (status) {
      jobs = jobs.filter(job => job.status.toLowerCase() === status.toLowerCase());
    }
    if (location) {
      jobs = jobs.filter(job => job.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (skills) {
      jobs = jobs.filter(job => skills.every(skill => job.skills.some(s => s.toLowerCase() === skill.toLowerCase())));
    }

    return NextResponse.json({ data: jobs.sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to retrieve jobs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // In a real app, you'd add authentication and authorization checks here
  // For example, using JWT and checking user roles.

  try {
    const body = await request.json();
    const validation = jobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = await readDb();
    const newJob: JobPosting = {
      id: `JOB-${uuidv4()}`,
      applications: 0,
      postedDate: new Date().toISOString(),
      ...validation.data,
    };

    db.jobs.push(newJob);
    await writeDb(db);

    return NextResponse.json({ data: newJob, error: null }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: null, error: 'Failed to create job.' }, { status: 500 });
  }
}
