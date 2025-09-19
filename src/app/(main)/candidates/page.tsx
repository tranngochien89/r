import { redirect } from 'next/navigation';

export default function CandidatesPage() {
  // Redirect to dashboard as it serves as the main candidate pipeline view
  redirect('/dashboard');
}
