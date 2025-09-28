import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { QuickReportCard } from "@/components/QuickReportCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
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
  FileText,
  LogOut,
  RefreshCw
} from "lucide-react";

export function Dashboard() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { reports, tasks, loading, refetch } = useRealTimeUpdates();

  const currentRole = (role || profile?.role) as "citizen" | "government" | "municipality";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Calculate stats based on real data
  const getStats = () => {
    if (currentRole === 'citizen') {
      const userReports = reports;
      const resolved = userReports.filter(r => r.status === 'completed').length;
      const inProgress = userReports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
      const pending = userReports.filter(r => r.status === 'pending' || r.status === 'verified').length;
      
      return {
        total: userReports.length,
        resolved,
        inProgress,
        pending
      };
    } else if (currentRole === 'government') {
      const verified = reports.filter(r => r.status === 'verified' || r.status === 'assigned' || r.status === 'in_progress' || r.status === 'completed').length;
      const pendingReview = reports.filter(r => r.status === 'pending').length;
      const rejected = reports.filter(r => r.status === 'rejected').length;
      
      return {
        total: reports.length,
        verified,
        pendingReview,
        rejected
      };
    } else {
      const userTasks = tasks;
      const completed = userTasks.filter(t => t.status === 'completed').length;
      const inProgress = userTasks.filter(t => t.status === 'in_progress').length;
      const assigned = userTasks.filter(t => t.status === 'assigned').length;
      
      return {
        total: userTasks.length,
        completed,
        inProgress,
        assigned
      };
    }
  };

  const stats = getStats();
  const renderCitizenDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value={stats.total.toString()} label="Reports Submitted" color="primary" trend="up" />
        <StatsCard value={stats.resolved.toString()} label="Resolved" color="success" />
        <StatsCard value={stats.inProgress.toString()} label="In Progress" color="warning" />
        <StatsCard value={stats.pending.toString()} label="Pending" color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <QuickReportCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.address || 'No address'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{report.waste_type} waste</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      report.status === "completed" ? "default" : 
                      report.status === "in_progress" || report.status === "assigned" ? "secondary" : 
                      "outline"
                    }
                    className="mb-1"
                  >
                    {report.status === "completed" ? "Completed" : 
                     report.status === "in_progress" ? "In Progress" :
                     report.status === "assigned" ? "Assigned" :
                     report.status === "verified" ? "Verified" :
                     report.status === "rejected" ? "Rejected" : "Pending"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {reports.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground">
                No reports yet. Submit your first report above!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGovernmentDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value={stats.total.toString()} label="Total Reports" color="primary" trend="up" />
        <StatsCard value={stats.verified.toString()} label="Verified" color="success" />
        <StatsCard value={stats.pendingReview.toString()} label="Pending Review" color="warning" />
        <StatsCard value={stats.rejected.toString()} label="Rejected" color="accent" />
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
        <StatsCard value={stats.total.toString()} label="Assigned Tasks" color="accent" />
        <StatsCard value={stats.completed.toString()} label="Completed" color="success" trend="up" />
        <StatsCard value={stats.inProgress.toString()} label="In Progress" color="warning" />
        <StatsCard value={stats.assigned.toString()} label="Pending Start" color="primary" />
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
    switch (currentRole) {
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
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {getRoleTitle()}
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.full_name}! Here's what's happening in your area.
          </p>
        </div>

        {currentRole === "citizen" && renderCitizenDashboard()}
        {currentRole === "government" && renderGovernmentDashboard()}
        {currentRole === "municipality" && renderMunicipalityDashboard()}
      </div>
    </div>
  );
}