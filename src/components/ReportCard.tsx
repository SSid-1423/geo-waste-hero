import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { WasteReport } from '@/hooks/useRealTimeUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReportCardProps {
  report: WasteReport;
  onUpdateStatus?: (reportId: string, status: WasteReport['status'], notes?: string) => void;
  onAssignTask?: (reportId: string, assignedTo: string, notes?: string) => void;
  municipalityUsers?: Array<{ id: string; name: string; email: string }>;
  showActions?: boolean;
}

export function ReportCard({ 
  report, 
  onUpdateStatus, 
  onAssignTask,
  municipalityUsers = [],
  showActions = true 
}: ReportCardProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const handleVerify = () => {
    if (onUpdateStatus) {
      onUpdateStatus(report.id, 'verified');
      toast({
        title: "Report Verified",
        description: "The report has been verified and is ready for assignment"
      });
    }
  };

  const handleReject = () => {
    if (onUpdateStatus) {
      onUpdateStatus(report.id, 'rejected');
      toast({
        title: "Report Rejected",
        description: "The report has been rejected"
      });
    }
  };

  const handleAssign = () => {
    if (!selectedMunicipality) {
      toast({
        title: "Municipality Required",
        description: "Please select a municipality to assign this task",
        variant: "destructive"
      });
      return;
    }

    if (onAssignTask && onUpdateStatus) {
      onAssignTask(report.id, selectedMunicipality, assignmentNotes);
      onUpdateStatus(report.id, 'assigned');
      setIsAssigning(false);
      setSelectedMunicipality('');
      setAssignmentNotes('');
      toast({
        title: "Task Assigned",
        description: "The task has been assigned to the selected municipality"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'verified': return 'default';
      case 'assigned': return 'secondary';
      case 'in_progress': return 'secondary';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(report.status)} className="capitalize">
              {report.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getPriorityColor(report.priority || 'medium')} className="capitalize">
              {report.priority || 'medium'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {report.description && (
          <p className="text-sm text-muted-foreground">{report.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize font-medium">{report.waste_type}</span>
            <span>waste</span>
          </div>
          
          {report.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{report.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span>{new Date(report.created_at).toLocaleTimeString()}</span>
          </div>
        </div>

        {report.photo_urls && report.photo_urls.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>{report.photo_urls.length} photo(s) attached</span>
          </div>
        )}

        {showActions && profile?.role === 'government' && (
          <div className="flex gap-2 pt-2 border-t">
            {report.status === 'pending' && (
              <>
                <Button size="sm" onClick={handleVerify} className="flex-1">
                  Verify
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
              </>
            )}
            
            {report.status === 'verified' && (
              <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Assign to Municipality
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Municipality</Label>
                      <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose municipality..." />
                        </SelectTrigger>
                        <SelectContent>
                          {municipalityUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Assignment Notes (Optional)</Label>
                      <Input
                        placeholder="Add any special instructions..."
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsAssigning(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleAssign} className="flex-1">
                        Assign Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}