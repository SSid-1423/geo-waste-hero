import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkerManagement } from "@/hooks/useWorkerManagement";
import { WorkerLocationCard } from "@/components/WorkerLocationCard";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, MapPin } from "lucide-react";

interface WorkerAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: {
    id: string;
    title: string;
    description?: string;
    address: string;
    location_lat?: number;
    location_lng?: number;
  };
}

export function WorkerAssignmentDialog({ isOpen, onClose, reportData }: WorkerAssignmentDialogProps) {
  const { workers, loading, assignWorkerToTask, findClosestWorker, calculateDistance } = useWorkerManagement();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const filteredWorkers = workers.filter(worker =>
    worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.current_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignWorker = async (workerId: string) => {
    setIsAssigning(true);
    setSelectedWorker(workerId);

    try {
      const task = await assignWorkerToTask(workerId, {
        reportId: reportData.id,
        title: reportData.title,
        description: reportData.description,
        address: reportData.address,
        latitude: reportData.location_lat,
        longitude: reportData.location_lng
      });

      if (task) {
        toast({
          title: "Worker Assigned",
          description: "The task has been successfully assigned to the worker.",
        });
        onClose();
      } else {
        toast({
          title: "Assignment Failed",
          description: "Failed to assign the task. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
      setSelectedWorker(null);
    }
  };

  const handleAutoAssign = () => {
    if (reportData.location_lat && reportData.location_lng) {
      const closestWorker = findClosestWorker(reportData.location_lat, reportData.location_lng);
      if (closestWorker) {
        handleAssignWorker(closestWorker.user_id);
      } else {
        toast({
          title: "No Available Workers",
          description: "No workers are available near this location.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Location Required",
        description: "Location coordinates are required for auto-assignment.",
        variant: "destructive"
      });
    }
  };

  // Calculate distances for workers if report has location
  const workersWithDistance = filteredWorkers.map(worker => ({
    ...worker,
    distance: (reportData.location_lat && reportData.location_lng && 
               worker.current_location_lat && worker.current_location_lng) 
      ? calculateDistance(
          reportData.location_lat, reportData.location_lng,
          worker.current_location_lat, worker.current_location_lng
        )
      : undefined
  })).sort((a, b) => {
    // Sort by distance if available, then by availability
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    if (a.availability_status === 'available' && b.availability_status !== 'available') return -1;
    if (a.availability_status !== 'available' && b.availability_status === 'available') return 1;
    return 0;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Worker to Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{reportData.title}</h3>
            {reportData.description && (
              <p className="text-sm text-muted-foreground mb-2">{reportData.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{reportData.address}</span>
            </div>
          </div>

          {/* Search and Auto-assign */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workers by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {reportData.location_lat && reportData.location_lng && (
              <Button
                variant="outline"
                onClick={handleAutoAssign}
                disabled={isAssigning || workers.length === 0}
              >
                Auto-assign Closest
              </Button>
            )}
          </div>

          {/* Workers List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Available Workers ({workersWithDistance.length})</Label>
              {loading && <Badge variant="secondary">Loading...</Badge>}
            </div>
            
            <ScrollArea className="h-96">
              {workersWithDistance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading workers...' : 'No available workers found'}
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {workersWithDistance.map((worker) => (
                    <WorkerLocationCard
                      key={worker.user_id}
                      worker={worker}
                      distance={worker.distance}
                      onAssign={handleAssignWorker}
                      isAssigning={isAssigning && selectedWorker === worker.user_id}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}