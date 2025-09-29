import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { MunicipalitySelector } from "@/components/MunicipalitySelector";
import { useLocation } from "@/hooks/useLocation";
import { useMunicipalityMatching } from "@/hooks/useMunicipalityMatching";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, MapPin, Loader2, Navigation, Users } from "lucide-react";

export function QuickReportCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showMunicipalitySelector, setShowMunicipalitySelector] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    waste_type: "" as "dry" | "wet" | "hazardous" | "electronic" | "medical" | "",
    address: ""
  });

  const { user } = useAuth();
  const { createReport } = useRealTimeUpdates();
  const { toast } = useToast();
  const { locationData, isLoading: locationLoading, requestLocation, permissionGranted } = useLocation();
  const { municipalities, getBestMatch, loading: municipalitiesLoading } = useMunicipalityMatching();

  // Auto-fill address when location is detected
  useEffect(() => {
    if (locationData && !reportData.address) {
      setReportData(prev => ({ ...prev, address: locationData.address }));
    }
  }, [locationData]);

  // Check for municipality match when address changes
  useEffect(() => {
    const checkMunicipalityMatch = async () => {
      if (!reportData.address) return;
      
      const match = await getBestMatch(
        reportData.address, 
        locationData?.latitude, 
        locationData?.longitude
      );
      
      if (match) {
        setSelectedMunicipality(match);
        setShowMunicipalitySelector(false);
      } else if (municipalities.length > 0) {
        // No automatic match found, show municipality selector
        setShowMunicipalitySelector(true);
      }
    };

    if (reportData.address && municipalities.length > 0) {
      checkMunicipalityMatch();
    }
  }, [reportData.address, municipalities]);

  const handleLocationRequest = async () => {
    const location = await requestLocation();
    if (location) {
      setReportData(prev => ({ ...prev, address: location.address }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.title || !reportData.waste_type || images.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload at least one photo",
        variant: "destructive"
      });
      return;
    }

    // If no address and user is not logged in, require address
    if (!reportData.address && !user) {
      toast({
        title: "Address Required",
        description: "Please provide a location for your report",
        variant: "destructive"
      });
      return;
    }

    // If no municipality match and municipalities are available, show selector
    if (!selectedMunicipality && municipalities.length > 0 && reportData.address) {
      setShowMunicipalitySelector(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use location data if available
      const location_lat = locationData?.latitude;
      const location_lng = locationData?.longitude;

      // In a real app, you would upload images to storage and get URLs
      const photo_urls = images.length > 0 ? 
        images.map((_, index) => `https://placeholder.com/report-${Date.now()}-${index}.jpg`) : 
        undefined;

      const { error } = await createReport({
        title: reportData.title,
        description: reportData.description || undefined,
        waste_type: reportData.waste_type as "dry" | "wet" | "hazardous" | "electronic" | "medical",
        address: reportData.address || undefined,
        location_lat,
        location_lng,
        photo_urls
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
          description: selectedMunicipality 
            ? `Your report has been routed to ${selectedMunicipality.full_name}`
            : "Your waste report has been submitted successfully"
        });
        
        // Reset form
        setReportData({
          title: "",
          description: "",
          waste_type: "",
          address: ""
        });
        setImages([]);
        setSelectedMunicipality(null);
        setShowMunicipalitySelector(false);
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
            <div className="flex items-center justify-between">
              <Label htmlFor="address">
                Location/Address {!user && <span className="text-destructive">*</span>}
              </Label>
              {user && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLocationRequest}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                </Button>
              )}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                className="pl-10"
                placeholder={user ? "Enter location or use current location" : "Enter location or address (required)"}
                value={reportData.address}
                onChange={(e) => setReportData(prev => ({ ...prev, address: e.target.value }))}
                required={!user}
              />
            </div>
            
            {/* Location Status */}
            {locationData && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Current location detected and used
              </div>
            )}
            
            {/* Municipality Assignment Status */}
            {selectedMunicipality && (
              <div className="p-2 bg-success/10 border border-success/20 rounded-md">
                <div className="flex items-center gap-2 text-sm text-success-foreground">
                  <Users className="h-4 w-4" />
                  <span>Will be assigned to: <strong>{selectedMunicipality.full_name}</strong></span>
                </div>
              </div>
            )}
            
            {showMunicipalitySelector && (
              <div className="mt-3">
                <MunicipalitySelector
                  municipalities={municipalities}
                  selectedMunicipality={selectedMunicipality}
                  onSelect={setSelectedMunicipality}
                  onConfirm={() => setShowMunicipalitySelector(false)}
                  title="No Auto-Match Found"
                  showConfirmButton={true}
                />
              </div>
            )}
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

          <div className="space-y-2">
            <Label>Photos of the Issue *</Label>
            <p className="text-xs text-muted-foreground">
              Upload clear photos showing the waste/dirty area that needs attention
            </p>
            <ImageUpload onImageSelect={setImages} maxImages={3} />
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            className="w-full"
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

          <div className="text-xs text-muted-foreground space-y-1">
            <div>* Required fields. {user ? 'Location will be automatically detected if permission is granted.' : 'Address is required for guests.'}</div>
            {permissionGranted === false && user && (
              <div className="text-amber-600">
                Location permission denied. You can still enter address manually.
              </div>
            )}
            {!selectedMunicipality && municipalities.length > 0 && reportData.address && (
              <div className="text-amber-600">
                Please select a municipality before submitting.
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}