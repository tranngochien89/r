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
  status: "Open" | "Closed" | "On hold";
  applications: number;
  deadline: string;
};

export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';

export const STAGES: CandidateStage[] = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  jobId: string;
  jobTitle: string;
  stage: CandidateStage;
  skills: string[];
  lastContact: string;
};

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
