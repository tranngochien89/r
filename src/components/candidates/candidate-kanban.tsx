'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Candidate, CandidateStage, STAGES } from '@/lib/types';
import AddCandidateDialog from './add-candidate-dialog';
import CandidateCard from './candidate-card';

interface CandidateKanbanProps {
  initialCandidates: Candidate[];
}

export default function CandidateKanban({ initialCandidates }: CandidateKanbanProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpdateCandidateStage = (candidateId: string, newStage: CandidateStage) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
  };
  
  const handleAddCandidate = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Candidate Pipeline</h1>
        <AddCandidateDialog 
          onCandidateAdded={handleAddCandidate}
        />
      </div>
      <ScrollArea className="flex-grow">
        <div className="flex gap-6 pb-4">
          {STAGES.map((stage) => {
            const stageCandidates = candidates.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="w-80 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{stage}</h3>
                  <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {stageCandidates.length}
                  </span>
                </div>
                <div className="space-y-4 h-full bg-muted/50 rounded-lg p-2">
                  {stageCandidates.length > 0 ? (
                    stageCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onStageChange={handleUpdateCandidateStage}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center text-sm text-muted-foreground h-24 rounded-lg border-2 border-dashed border-gray-300">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
