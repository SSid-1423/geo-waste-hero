import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, User, Calendar, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Task } from '@/hooks/useRealTimeUpdates';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  reportDetails?: {
    title: string;
    description?: string;
    address?: string;
    waste_type: string;
  };
  onUpdateStatus?: (taskId: string, status: Task['status'], notes?: string, photoUrls?: string[]) => void;
}

export function TaskCard({ task, reportDetails, onUpdateStatus }: TaskCardProps) {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImages, setCompletionImages] = useState<File[]>([]);

  const handleStartTask = () => {
    if (onUpdateStatus) {
      onUpdateStatus(task.id, 'in_progress');
      toast({
        title: "Task Started",
        description: "You have started working on this task"
      });
    }
  };

  const handleCompleteTask = async () => {
    if (completionImages.length === 0) {
      toast({
        title: "Photo Required",
        description: "Please upload at least one completion photo",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real app, you would upload images to storage and get URLs
      // For now, we'll simulate with placeholder URLs
      const photoUrls = completionImages.map((_, index) => 
        `https://placeholder.com/completion-${task.id}-${index}.jpg`
      );

      if (onUpdateStatus) {
        onUpdateStatus(task.id, 'completed', completionNotes, photoUrls);
        setIsCompleting(false);
        setCompletionNotes('');
        setCompletionImages([]);
        toast({
          title: "Task Completed",
          description: "The task has been marked as completed with photos"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {reportDetails?.title || `Task ${task.id.slice(0, 8)}`}
          </CardTitle>
          <Badge variant={getStatusColor(task.status)} className="capitalize">
            {task.status === 'in_progress' ? 'In Progress' : task.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {reportDetails?.description && (
          <p className="text-sm text-muted-foreground">{reportDetails.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {reportDetails?.waste_type && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize font-medium">{reportDetails.waste_type}</span>
              <span>waste collection</span>
            </div>
          )}
          
          {reportDetails?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{reportDetails.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
          </div>

          {task.estimated_completion && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {new Date(task.estimated_completion).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {task.notes && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Assignment Notes:</p>
            <p className="text-sm text-muted-foreground">{task.notes}</p>
          </div>
        )}

        {task.completion_photo_urls && task.completion_photo_urls.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Completed with {task.completion_photo_urls.length} photo(s)</span>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          {task.status === 'assigned' && (
            <Button size="sm" onClick={handleStartTask} className="w-full">
              Start Task
            </Button>
          )}
          
          {task.status === 'in_progress' && (
            <Dialog open={isCompleting} onOpenChange={setIsCompleting}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                  Mark Complete
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Completion Photos *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload clear photos showing the completed work
                    </p>
                    <ImageUpload 
                      onImageSelect={setCompletionImages}
                      maxImages={5}
                    />
                  </div>
                  
                  <div>
                    <Label>Completion Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any additional notes about the completed work..."
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCompleting(false)} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCompleteTask} 
                      className="flex-1"
                      disabled={completionImages.length === 0}
                    >
                      Complete Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {task.status === 'completed' && (
            <div className="w-full text-center text-sm text-success font-medium">
              ✓ Task Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}