import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import { Municipality } from "@/hooks/useMunicipalityMatching";

interface MunicipalitySelectorProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onSelect: (municipality: Municipality) => void;
  onConfirm?: () => void;
  title?: string;
  showConfirmButton?: boolean;
}

export function MunicipalitySelector({
  municipalities,
  selectedMunicipality,
  onSelect,
  onConfirm,
  title = "Select Municipality",
  showConfirmButton = false
}: MunicipalitySelectorProps) {
  if (municipalities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No municipalities available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the appropriate municipality for this location
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {municipalities.map((municipality) => (
          <Card
            key={municipality.id}
            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
              selectedMunicipality?.id === municipality.id
                ? 'ring-2 ring-primary border-primary'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelect(municipality)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {municipality.full_name?.split(' ').map(n => n[0]).join('') || 'M'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {municipality.full_name || 'Unknown Municipality'}
                  </h4>
                  {municipality.is_online && (
                    <Badge variant="secondary" className="text-xs">
                      Online
                    </Badge>
                  )}
                  {selectedMunicipality?.id === municipality.id && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {municipality.email}
                </p>
                
                {municipality.address && (
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {municipality.address}
                    </span>
                  </div>
                )}
                
                {municipality.last_seen && !municipality.is_online && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Last seen: {new Date(municipality.last_seen).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {showConfirmButton && selectedMunicipality && onConfirm && (
          <Button 
            onClick={onConfirm} 
            className="w-full mt-4"
            variant="default"
          >
            Confirm Assignment to {selectedMunicipality.full_name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}