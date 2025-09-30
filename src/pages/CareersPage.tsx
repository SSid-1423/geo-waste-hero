import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobListingCard } from '@/components/JobListingCard';
import { JobApplicationDialog } from '@/components/JobApplicationDialog';
import { JobApplicationManagement } from '@/components/JobApplicationManagement';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { Briefcase, FileText, MapPin, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

export function CareersPage() {
  const { profile } = useAuth();
  const { jobs, applications, loading, fetchMyApplications } = useJobs();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);

  const handleApplyToJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setApplicationDialogOpen(true);
    }
  };

  const hasAppliedToJob = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
  };

  if (profile?.role === 'government') {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Job Management</h1>
                <p className="text-muted-foreground">Manage job listings and applications</p>
              </div>
              <Button onClick={() => setCreateJobDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Job Listing
              </Button>
            </div>

            <Tabs defaultValue="listings" className="w-full">
              <TabsList>
                <TabsTrigger value="listings">Active Listings</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-4">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded w-5/6"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                      <Card key={job.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription>{job.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant={job.job_type === 'government' ? 'default' : 'secondary'}>
                                {job.job_type}
                              </Badge>
                              {job.department && <span className="text-muted-foreground">{job.department}</span>}
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Job Listings</h3>
                      <p className="text-muted-foreground mb-4">Create your first job listing to start recruiting</p>
                      <Button onClick={() => setCreateJobDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Job Listing
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <JobApplicationManagement applications={applications} />
              </TabsContent>
            </Tabs>
          </div>

          <CreateJobDialog
            open={createJobDialogOpen}
            onClose={() => setCreateJobDialogOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Career Opportunities</h1>
            <p className="text-muted-foreground">Browse and apply for government and municipality positions</p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList>
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <JobListingCard
                      key={job.id}
                      job={job}
                      onApply={handleApplyToJob}
                      hasApplied={hasAppliedToJob(job.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Job Listings Available</h3>
                    <p className="text-muted-foreground">Check back later for new opportunities</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {application.job_listings?.title || 'Unknown Position'}
                            </CardTitle>
                            <CardDescription>
                              {application.job_listings?.department} • {application.job_listings?.job_type}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={
                              application.status === 'selected' ? 'default' :
                              application.status === 'rejected' ? 'destructive' :
                              application.status === 'interview_scheduled' ? 'secondary' :
                              'outline'
                            }
                          >
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div>Applied: {format(new Date(application.created_at), 'MMM dd, yyyy')}</div>
                          {application.interview_date && (
                            <div>Interview: {format(new Date(application.interview_date), 'MMM dd, yyyy HH:mm')}</div>
                          )}
                          {application.job_listings?.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{application.job_listings.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground">Start browsing job listings to submit your first application</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <JobApplicationDialog
          job={selectedJob}
          open={applicationDialogOpen}
          onClose={() => setApplicationDialogOpen(false)}
          onSuccess={() => fetchMyApplications()}
        />
      </div>
    </div>
  );
}