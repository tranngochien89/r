import CandidateKanban from '@/components/candidates/candidate-kanban';
import { MOCK_CANDIDATES } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="h-full">
      <CandidateKanban initialCandidates={MOCK_CANDIDATES} />
    </div>
  );
}
