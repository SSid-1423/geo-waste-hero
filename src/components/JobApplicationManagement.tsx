import { useState } from 'react';
import { JobApplication, useJobs } from '@/hooks/useJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Eye, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';

interface JobApplicationManagementProps {
  applications: JobApplication[];
}

export function JobApplicationManagement({ applications }: JobApplicationManagementProps) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const { updateApplicationStatus } = useJobs();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'selected':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (application: JobApplication) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setInterviewDate(application.interview_date ? format(new Date(application.interview_date), 'yyyy-MM-dd\'T\'HH:mm') : '');
    setNotes(application.interview_notes || '');
    setStatusDialogOpen(true);
  };

  const handleSubmitStatusUpdate = async () => {
    if (!selectedApplication) return;

    const success = await updateApplicationStatus(
      selectedApplication.id,
      newStatus,
      interviewDate || undefined,
      notes || undefined
    );

    if (success) {
      setStatusDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  const downloadResume = (resumeUrl: string) => {
    window.open(resumeUrl, '_blank');
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No job applications found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {application.job_listings?.title || 'Unknown Position'}
                  </CardTitle>
                  <CardDescription>
                    Applied by: {application.profiles?.full_name || 'Unknown Applicant'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{application.profiles?.email}</span>
                </div>
                
                {application.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.contact_phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
                </div>

                {application.interview_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Interview: {format(new Date(application.interview_date), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>

              {application.cover_letter && (
                <div>
                  <h4 className="font-medium mb-2">Cover Letter:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {application.cover_letter}
                  </p>
                </div>
              )}

              {application.interview_notes && (
                <div>
                  <h4 className="font-medium mb-2">Interview Notes:</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.interview_notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {application.resume_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResume(application.resume_url!)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(application)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedApplication?.profiles?.full_name}'s application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'interview_scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="interview_date">Interview Date & Time</Label>
                <Input
                  id="interview_date"
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this application..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}