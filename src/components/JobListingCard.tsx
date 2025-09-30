import { JobListing } from '@/hooks/useJobs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface JobListingCardProps {
  job: JobListing;
  onApply: (jobId: string) => void;
  hasApplied?: boolean;
  isApplying?: boolean;
}

export function JobListingCard({ job, onApply, hasApplied, isApplying }: JobListingCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
            <CardDescription className="line-clamp-2">{job.description}</CardDescription>
          </div>
          <Badge variant={job.job_type === 'government' ? 'default' : 'secondary'}>
            {job.job_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        )}

        {job.department && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{job.department}</span>
          </div>
        )}

        {job.salary_range && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary_range}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Posted {format(new Date(job.created_at), 'MMM dd, yyyy')}</span>
        </div>

        {job.requirements && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Requirements:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {job.requirements}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onApply(job.id)}
          disabled={hasApplied || isApplying}
          className="w-full"
        >
          {isApplying ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}