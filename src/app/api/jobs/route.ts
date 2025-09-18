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

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Retrieve a list of job postings
 *     description: Retrieve a list of all job postings, with optional filtering by status, location, or skills.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Closed, On hold, Draft]
 *         description: Filter jobs by status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter jobs by location (case-insensitive search)
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter jobs by skills (comma-separated list)
 *     responses:
 *       200:
 *         description: A list of job postings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobPosting'
 *       500:
 *         description: Failed to retrieve jobs.
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     JobPosting:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The job ID.
 *           example: JOB-001
 *         title:
 *           type: string
 *           description: The job title.
 *           example: Senior Frontend Developer
 *         department:
 *           type: string
 *           example: Engineering
 *         location:
 *           type: string
 *           example: Ho Chi Minh City, Vietnam
 *         salary:
 *           type: string
 *           example: 30,000,000 - 50,000,000 VND
 *         status:
 *           type: string
 *           enum: [Open, Closed, On hold, Draft]
 *           example: Open
 *         applications:
 *           type: integer
 *           example: 25
 *         deadline:
 *           type: string
 *           format: date-time
 *           example: 2025-10-30T17:00:00.000Z
 *         description:
 *           type: string
 *           example: We are seeking an experienced Frontend Developer...
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["JavaScript", "React", "Next.js"]
 *         postedDate:
 *           type: string
 *           format: date-time
 *           example: 2025-09-01T10:00:00.000Z
 *     NewJob:
 *       type: object
 *       required:
 *         - title
 *         - department
 *         - location
 *         - salary
 *         - description
 *         - skills
 *         - status
 *         - deadline
 *       properties:
 *         title:
 *           type: string
 *         department:
 *           type: string
 *         location:
 *           type: string
 *         salary:
 *           type: string
 *         description:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [Open, Closed, On hold, Draft]
 *         deadline:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     description: Creates a new job posting. Requires authentication.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewJob'
 *     responses:
 *       201:
 *         description: Job created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Failed to create job.
 */
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
