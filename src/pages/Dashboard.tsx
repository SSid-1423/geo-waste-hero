import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Trash2,
  TrendingUp,
  FileText
} from "lucide-react";

interface DashboardProps {
  role: "citizen" | "government" | "municipality";
  onBack: () => void;
}

export function Dashboard({ role, onBack }: DashboardProps) {
  const renderCitizenDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value="12" label="Reports Submitted" color="primary" trend="up" />
        <StatsCard value="8" label="Resolved" color="success" />
        <StatsCard value="3" label="In Progress" color="warning" />
        <StatsCard value="1" label="Pending" color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Quick Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo to report waste in your area
              </p>
              <Button variant="hero" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">
                <Trash2 className="mr-1 h-3 w-3" />
                Dry Waste
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-1 h-3 w-3" />
                Wet Waste
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Hazardous
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "WR001", status: "resolved", location: "MG Road", date: "2 days ago" },
              { id: "WR002", status: "progress", location: "Park Street", date: "5 days ago" },
              { id: "WR003", status: "pending", location: "City Center", date: "1 week ago" },
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{report.id}</p>
                  <p className="text-xs text-muted-foreground">{report.location}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={report.status === "resolved" ? "default" : report.status === "progress" ? "secondary" : "outline"}
                    className="mb-1"
                  >
                    {report.status === "resolved" ? "Resolved" : report.status === "progress" ? "In Progress" : "Pending"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGovernmentDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value="847" label="Total Reports" color="primary" trend="up" />
        <StatsCard value="623" label="Verified" color="success" />
        <StatsCard value="156" label="Pending Review" color="warning" />
        <StatsCard value="68" label="Rejected" color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "WR156", location: "Sector 14", type: "Dry Waste", priority: "high" },
              { id: "WR157", location: "Mall Road", type: "Wet Waste", priority: "medium" },
              { id: "WR158", location: "IT Park", type: "Hazardous", priority: "high" },
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{report.id}</p>
                  <p className="text-sm text-muted-foreground">{report.location} • {report.type}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={report.priority === "high" ? "destructive" : "secondary"}>
                    {report.priority}
                  </Badge>
                  <Button size="sm" variant="default">Verify</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resolution Rate</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "87%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="font-medium">2.3 hrs avg</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Citizen Satisfaction</span>
                <span className="font-medium">4.2/5</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "84%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMunicipalityDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value="34" label="Assigned Tasks" color="accent" />
        <StatsCard value="28" label="Completed" color="success" trend="up" />
        <StatsCard value="6" label="In Progress" color="warning" />
        <StatsCard value="0" label="Overdue" color="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "CT001", location: "Park Avenue", type: "Dry Waste Collection", status: "assigned", priority: "high" },
              { id: "CT002", location: "Mall Road", type: "Wet Waste Collection", status: "progress", priority: "medium" },
              { id: "CT003", location: "Sector 18", type: "Hazardous Waste", status: "assigned", priority: "high" },
            ].map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{task.id}</p>
                  <p className="text-sm text-muted-foreground">{task.location}</p>
                  <p className="text-sm">{task.type}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                    {task.priority}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant={task.status === "progress" ? "success" : "default"}
                  >
                    {task.status === "progress" ? "Mark Complete" : "Start Task"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Team Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="font-medium">12 Teams Active</p>
              <p className="text-sm text-muted-foreground">All teams operational</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Team A</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team B</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team C</span>
                <Badge variant="secondary">Break</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getRoleTitle = () => {
    switch (role) {
      case "citizen":
        return "Citizen Dashboard";
      case "government":
        return "Government Dashboard";
      case "municipality":
        return "Municipality Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {getRoleTitle()}
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening in your area.
          </p>
        </div>

        {role === "citizen" && renderCitizenDashboard()}
        {role === "government" && renderGovernmentDashboard()}
        {role === "municipality" && renderMunicipalityDashboard()}
      </div>
    </div>
  );
}