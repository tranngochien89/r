'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { extractCandidateInfo } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, JobPosting } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  jobId: z.string({ required_error: 'Please select a job.' }),
  skills: z.string().optional(),
  experience: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCandidateFormProps {
  onSuccess: (data: Candidate) => void;
  jobs: JobPosting[];
}

export default function AddCandidateForm({ onSuccess, jobs }: AddCandidateFormProps) {
  const { toast } = useToast();
  const [isAiPending, startAiTransition] = useTransition();
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      jobId: '',
      skills: '',
      experience: '',
    },
  });

  const { reset, setValue } = form;

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      startAiTransition(async () => {
        const result = await extractCandidateInfo({ cvDataUri: dataUri });
        if (result.success && result.data) {
          const { name, email, phone, skills, experience } = result.data;
          reset({
            name,
            email,
            phone: phone || '',
            skills: skills.join(', '),
            experience,
            jobId: form.getValues('jobId'),
          });
          toast({ title: 'Success', description: 'Candidate data extracted from CV.' });
        } else {
            const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to extract data.';
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        }
      });
    };
    reader.readAsDataURL(file);
  }, [file, reset, toast, form, startAiTransition]);

  const onSubmit = async (values: FormValues) => {
    const selectedJob = jobs.find(job => job.id === values.jobId);
    if (!selectedJob) return;

    setIsSubmitPending(true);

    const candidateData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      jobId: values.jobId,
      jobTitle: selectedJob.title,
      stage: 'Applied' as const,
      skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
      experience: values.experience,
    };

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create candidate.');
      }
      
      const result = await response.json();
      toast({ title: 'Success', description: 'New candidate added.' });
      onSuccess(result.data);
      form.reset();

    } catch (error) {
      const err = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Error', description: err });
    } finally {
      setIsSubmitPending(false);
    }
  };
  
  const isPending = isAiPending || isSubmitPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative group">
            <label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isAiPending ? (
                        <>
                            <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                            <p className="mb-2 text-sm text-muted-foreground">Extracting data...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload CV</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 5MB)</p>
                        </>
                    )}
                </div>
                <Input id="cv-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx" disabled={isPending} />
            </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. john.doe@example.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. +84 123 456 789" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applying for</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobs.filter(j => j.status === 'Open').map(job => (
                      <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. React, Node.js, Project Management" {...field} value={field.value || ''} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Summary</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief summary of work experience..." className="resize-none" {...field} value={field.value || ''} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isSubmitPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Candidate
        </Button>
      </form>
    </Form>
  );
}
