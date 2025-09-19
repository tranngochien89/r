'use client';

import { useEffect, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Candidate, CandidateStage, JobPosting, STAGES } from '@/lib/types';
import AddCandidateDialog from './add-candidate-dialog';
import CandidateCard from './candidate-card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CandidateKanban() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [candidatesRes, jobsRes] = await Promise.all([
          fetch('/api/candidates'),
          fetch('/api/jobs')
        ]);
        
        if (!candidatesRes.ok || !jobsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const candidatesData = await candidatesRes.json();
        const jobsData = await jobsRes.json();
        
        setCandidates(candidatesData.data || []);
        setJobs(jobsData.data || []);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Could not fetch data.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  

  const handleUpdateCandidateStage = async (candidateId: string, newStage: CandidateStage) => {
    const originalCandidates = [...candidates];
    
    // Optimistic update
    setCandidates((prevCandidates) =>
      prevCandidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );

    try {
        const response = await fetch(`/api/candidates/${candidateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: newStage }),
        });

        if (!response.ok) {
            throw new Error('Failed to update candidate stage.');
        }

        const updatedCandidate = await response.json();
        setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate.data : c));

    } catch (error) {
        // Revert on error
        setCandidates(originalCandidates);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Could not update candidate.',
        });
    }
  };
  
  const handleAddCandidate = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Candidate Pipeline</h1>
        <AddCandidateDialog 
          onCandidateAdded={handleAddCandidate}
          jobs={jobs}
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
                <div className="space-y-4 h-full bg-muted/50 rounded-lg p-2 min-h-[100px]">
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
