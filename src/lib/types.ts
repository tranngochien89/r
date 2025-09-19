import type { LucideIcon } from "lucide-react";

export type User = {
  name: string;
  email: string;
  avatar: string;
};

export type JobPosting = {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: "Open" | "Closed" | "On hold" | "Draft";
  applications: number;
  deadline: string;
  description: string;
  skills: string[];
  postedDate: string;
};

export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';

export const STAGES: CandidateStage[] = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired'];

export type Interaction = {
  id: string;
  type: 'note' | 'email' | 'call';
  content: string;
  date: string; // ISO 8601
  author: string;
}

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  jobId: string;
  jobTitle: string;
  stage: CandidateStage | 'Rejected';
  skills: string[];
  lastContact: string; // ISO 8601 Date
  experience?: string;
  interactions: Interaction[];
};

export type AppData = {
  jobs: JobPosting[];
  candidates: Candidate[];
}

export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
  label?: string;
}

export type ExtractedCandidateData = {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: string;
}
