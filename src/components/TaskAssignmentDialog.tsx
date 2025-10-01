import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, User } from "lucide-react";

interface Worker {
  user_id: string;
  full_name: string;
  email: string;
  address: string | null;
  current_location_lat: number | null;
  current_location_lng: number | null;
  current_address: string | null;
  availability_status: string;
  completed_tasks?: number;
}

interface TaskAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
}

export function TaskAssignmentDialog({ isOpen, onClose, workers }: TaskAssignmentDialogProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    notes: '',
    address: '',
    latitude: '',
    longitude: '',
    deadline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorker) {
      toast({
        title: "Select a Worker",
        description: "Please select a municipal worker to assign the task",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          assigned_to: selectedWorker.user_id,
          assigned_by: profile?.user_id,
          report_id: '00000000-0000-0000-0000-000000000000',
          notes: taskData.notes,
          task_address: taskData.address,
          task_location_lat: taskData.latitude ? parseFloat(taskData.latitude) : null,
          task_location_lng: taskData.longitude ? parseFloat(taskData.longitude) : null,
          estimated_completion: taskData.deadline || null,
          status: 'assigned'
        });

      if (taskError) throw taskError;

      // Send notification to worker
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedWorker.user_id,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${taskData.notes}`,
          type: 'task_assignment',
          data: { address: taskData.address }
        });

      toast({
        title: "Task Assigned Successfully",
        description: `Task assigned to ${selectedWorker.full_name}`,
      });

      // Reset form and close
      setTaskData({
        notes: '',
        address: '',
        latitude: '',
        longitude: '',
        deadline: ''
      });
      setSelectedWorker(null);
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableWorkers = workers.filter(w => w.availability_status === 'available');
  const unavailableWorkers = workers.filter(w => w.availability_status !== 'available');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Worker Selection */}
          <div className="space-y-4">
            <Label>Select Municipal Worker</Label>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {availableWorkers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Workers</p>
                    {availableWorkers.map((worker) => (
                      <Card
                        key={worker.user_id}
                        className={`cursor-pointer transition-all ${
                          selectedWorker?.user_id === worker.user_id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedWorker(worker)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{worker.full_name}</span>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Available
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{worker.email}</p>
                            {worker.current_address && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{worker.current_address}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Completed: {worker.completed_tasks || 0} tasks
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {unavailableWorkers.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Unavailable Workers</p>
                    {unavailableWorkers.map((worker) => (
                      <Card
                        key={worker.user_id}
                        className="opacity-60"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{worker.full_name}</span>
                              </div>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {worker.availability_status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{worker.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {workers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No municipal workers found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Task Details Form */}
          <div className="space-y-4">
            <Label>Task Details</Label>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="notes">Task Description *</Label>
                <Textarea
                  id="notes"
                  value={taskData.notes}
                  onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })}
                  placeholder="Describe the task to be completed..."
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="address">Location *</Label>
                <Input
                  id="address"
                  value={taskData.address}
                  onChange={(e) => setTaskData({ ...taskData, address: e.target.value })}
                  placeholder="Enter task location..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={taskData.latitude}
                    onChange={(e) => setTaskData({ ...taskData, latitude: e.target.value })}
                    placeholder="e.g., 23.2398"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={taskData.longitude}
                    onChange={(e) => setTaskData({ ...taskData, longitude: e.target.value })}
                    placeholder="e.g., 77.3898"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Expected Completion</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={taskData.deadline}
                  onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
                />
              </div>

              {selectedWorker && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium">Selected Worker:</p>
                  <p className="text-sm text-muted-foreground">{selectedWorker.full_name}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedWorker}
                  className="flex-1"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
