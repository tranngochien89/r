'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddCandidateForm from './add-candidate-form';
import type { Candidate } from '@/lib/types';

interface AddCandidateDialogProps {
  onCandidateAdded: (candidate: Candidate) => void;
}

export default function AddCandidateDialog({ onCandidateAdded }: AddCandidateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (newCandidate: Omit<Candidate, 'id' | 'avatar' | 'lastContact' >) => {
    const candidateWithId: Candidate = {
      ...newCandidate,
      id: `CAND-${Date.now()}`,
      avatar: `https://picsum.photos/seed/${Date.now()}/40/40`,
      lastContact: new Date().toISOString().split('T')[0],
    };
    onCandidateAdded(candidateWithId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Upload a CV to automatically extract information, or fill out the form manually.
          </DialogDescription>
        </DialogHeader>
        <AddCandidateForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
