import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Signal } from "lucide-react";

interface Worker {
  user_id: string;
  full_name: string;
  email: string;
  address: string | null;
  current_location_lat: number | null;
  current_location_lng: number | null;
  current_address: string | null;
  availability_status: string;
  last_location_update: string | null;
  is_online: boolean;
}

interface WorkerLocationCardProps {
  worker: Worker;
  distance?: number;
  onAssign: (workerId: string) => void;
  isAssigning?: boolean;
}

export function WorkerLocationCard({ worker, distance, onAssign, isAssigning }: WorkerLocationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatLastUpdate = (lastUpdate: string | null) => {
    if (!lastUpdate) return 'Never';
    
    const diff = new Date().getTime() - new Date(lastUpdate).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(lastUpdate).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {worker.full_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(worker.availability_status)}`} />
            <Badge variant={worker.is_online ? "default" : "secondary"}>
              <Signal className="h-3 w-3 mr-1" />
              {worker.is_online ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {worker.email}
        </div>

        {worker.current_address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary" />
            <div className="flex-1">
              <p className="text-sm">{worker.current_address}</p>
              {distance !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {distance.toFixed(2)} km away
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last update: {formatLastUpdate(worker.last_location_update)}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Badge variant="outline">
            {getStatusText(worker.availability_status)}
          </Badge>
          
          <Button
            size="sm"
            onClick={() => onAssign(worker.user_id)}
            disabled={!worker.is_online || worker.availability_status !== 'available' || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign Task'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}