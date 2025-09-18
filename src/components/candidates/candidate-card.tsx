import { Mail, MoreHorizontal, Phone, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Candidate, CandidateStage, STAGES } from '@/lib/types';

interface CandidateCardProps {
  candidate: Candidate;
  onStageChange: (candidateId: string, newStage: CandidateStage) => void;
}

export default function CandidateCard({ candidate, onStageChange }: CandidateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={candidate.avatar} alt={candidate.name} data-ai-hint="person face" />
          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle className="text-base">{candidate.name}</CardTitle>
          <CardDescription>{candidate.jobTitle}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Send Email</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {STAGES.map(stage => (
                            <DropdownMenuItem 
                                key={stage}
                                disabled={stage === candidate.stage}
                                onClick={() => onStageChange(candidate.id, stage)}
                            >
                                {stage}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                 <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{candidate.email}</span>
        </div>
        {candidate.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{candidate.phone}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        {candidate.skills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
        ))}
        {candidate.skills.length > 3 && (
            <Badge variant="outline">+{candidate.skills.length-3}</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
