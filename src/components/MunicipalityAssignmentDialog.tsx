import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, User, Clock, Radio } from 'lucide-react';

interface MunicipalityUser {
  id: string;
  full_name: string;
  email: string;
  address: string | null;
  is_online: boolean;
  last_seen: string;
}

interface MunicipalityAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, notes?: string) => void;
  municipalityUsers: MunicipalityUser[];
  reportTitle: string;
  reportAddress?: string;
}

export function MunicipalityAssignmentDialog({
  isOpen,
  onClose,
  onAssign,
  municipalityUsers,
  reportTitle,
  reportAddress
}: MunicipalityAssignmentDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (selectedUser) {
      onAssign(selectedUser, notes);
      setSelectedUser('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Task to Municipality</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium">{reportTitle}</h4>
            {reportAddress && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {reportAddress}
              </p>
            )}
          </div>

          <div>
            <Label>Select Municipality Team Member</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Choose based on location proximity and availability
            </p>
            
            <div className="grid gap-3">
              {municipalityUsers.map((user) => (
                <Card 
                  key={user.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedUser === user.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.full_name}</span>
                          <Badge 
                            variant={user.is_online ? "default" : "secondary"}
                            className="text-xs"
                          >
                            <Radio className={`h-2 w-2 mr-1 ${user.is_online ? 'text-green-400' : 'text-gray-400'}`} />
                            {user.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        
                        {user.address && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{user.address}</span>
                          </div>
                        )}
                        
                        {!user.is_online && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Last seen: {new Date(user.last_seen).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {municipalityUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No municipality users available
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="assignment-notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="assignment-notes"
              placeholder="Add any specific instructions or priority information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedUser}
              className="flex-1"
            >
              Assign Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}