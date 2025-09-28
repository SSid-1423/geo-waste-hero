import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Loader2 } from "lucide-react";

export function QuickReportCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    waste_type: "" as "dry" | "wet" | "hazardous" | "electronic" | "medical" | "",
    address: ""
  });

  const { createReport } = useRealTimeUpdates();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.title || !reportData.waste_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get user's location if available
      let location_lat, location_lng;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location_lat = position.coords.latitude;
          location_lng = position.coords.longitude;
        } catch (error) {
          console.log('Location access denied or unavailable');
        }
      }

      const { error } = await createReport({
        title: reportData.title,
        description: reportData.description || undefined,
        waste_type: reportData.waste_type as "dry" | "wet" | "hazardous" | "electronic" | "medical",
        address: reportData.address || undefined,
        location_lat,
        location_lng
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to submit report",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Report Submitted",
          description: "Your waste report has been submitted successfully"
        });
        
        // Reset form
        setReportData({
          title: "",
          description: "",
          waste_type: "",
          address: ""
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wasteTypeColors = {
    dry: "text-blue-600",
    wet: "text-green-600", 
    hazardous: "text-red-600",
    electronic: "text-purple-600",
    medical: "text-orange-600"
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Quick Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waste_type">Waste Type *</Label>
              <Select 
                value={reportData.waste_type} 
                onValueChange={(value: "dry" | "wet" | "hazardous" | "electronic" | "medical") => 
                  setReportData(prev => ({ ...prev, waste_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry" className="text-blue-600">
                    🗂️ Dry Waste (Paper, Plastic, Metal)
                  </SelectItem>
                  <SelectItem value="wet" className="text-green-600">
                    🍃 Wet Waste (Food, Organic)
                  </SelectItem>
                  <SelectItem value="hazardous" className="text-red-600">
                    ⚠️ Hazardous (Chemicals, Batteries)
                  </SelectItem>
                  <SelectItem value="electronic" className="text-purple-600">
                    💻 Electronic (E-waste)
                  </SelectItem>
                  <SelectItem value="medical" className="text-orange-600">
                    🏥 Medical Waste
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Location/Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                className="pl-10"
                placeholder="Enter location or address"
                value={reportData.address}
                onChange={(e) => setReportData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the waste issue"
              rows={3}
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              variant="hero" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                // Future: Implement photo capture functionality
                toast({
                  title: "Coming Soon",
                  description: "Photo capture feature will be available soon"
                });
              }}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            * Required fields. Location will be automatically detected if permission is granted.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}