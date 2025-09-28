import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { QuickReportCard } from "@/components/QuickReportCard";
import { ReportCard } from "@/components/ReportCard";
import { TaskCard } from "@/components/TaskCard";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { supabase } from "@/integrations/supabase/client";
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
  RefreshCw,
  ClipboardList
} from "lucide-react";

export function Dashboard() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { 
    reports, 
    tasks, 
    loading, 
    userCounts,
    updateReportStatus, 
    createTask, 
    updateTaskStatus,
    submitFeedback,
    refetch 
  } = useRealTimeUpdates();
  
  const [municipalityUsers, setMunicipalityUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    isOpen: boolean;
    reportId: string;
    reportTitle: string;
  }>({ isOpen: false, reportId: '', reportTitle: '' });

  const currentRole = (role || profile?.role) as "citizen" | "government" | "municipality";

  // Fetch municipality users for assignment
  useEffect(() => {
    const fetchMunicipalityUsers = async () => {
      if (profile?.role === 'government') {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('role', 'municipality');
        
        if (data) {
          setMunicipalityUsers(data.map(user => ({
            id: user.user_id,
            name: user.full_name || user.email,
            email: user.email
          })));
        }
      }
    };

    fetchMunicipalityUsers();
  }, [profile?.role]);

  // Check for completed tasks to show feedback dialog
  useEffect(() => {
    if (currentRole === 'citizen') {
      const newlyCompleted = reports.filter(report => 
        report.status === 'completed' && 
        !completedTasks.some(ct => ct.id === report.id)
      );

      if (newlyCompleted.length > 0) {
        const latest = newlyCompleted[0];
        setFeedbackDialog({
          isOpen: true,
          reportId: latest.id,
          reportTitle: latest.title
        });
        setCompletedTasks(prev => [...prev, ...newlyCompleted]);
      }
    }
  }, [reports, currentRole, completedTasks]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    await submitFeedback(feedbackDialog.reportId, rating, feedback);
    setFeedbackDialog({ isOpen: false, reportId: '', reportTitle: '' });
  };

  const handleAssignTask = async (reportId: string, assignedTo: string, notes?: string) => {
    await createTask({
      report_id: reportId,
      assigned_to: assignedTo,
      notes
    });
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

  const renderGovernmentDashboard = () => {
    const pendingReports = reports.filter(r => r.status === 'pending');
    const verifiedReports = reports.filter(r => r.status === 'verified');
    const completedReports = reports.filter(r => r.status === 'completed');

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <StatsCard value={stats.total.toString()} label="Total Reports" color="primary" trend="up" />
          <StatsCard value={stats.verified.toString()} label="Verified" color="success" />
          <StatsCard value={stats.pendingReview.toString()} label="Pending Review" color="warning" />
          <StatsCard value={userCounts.citizens.toString()} label="Citizens" color="accent" />
          <StatsCard value={userCounts.municipalities.toString()} label="Municipalities" color="secondary" />
          <StatsCard value={completedReports.length.toString()} label="Completed" color="success" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Verification ({pendingReports.length})
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {pendingReports.slice(0, 5).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onUpdateStatus={updateReportStatus}
                  showActions={true}
                />
              ))}
              {pendingReports.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No pending reports
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ready for Assignment ({verifiedReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {verifiedReports.slice(0, 5).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onUpdateStatus={updateReportStatus}
                  onAssignTask={handleAssignTask}
                  municipalityUsers={municipalityUsers}
                  showActions={true}
                />
              ))}
              {verifiedReports.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No verified reports waiting for assignment
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Completed Projects ({completedReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {completedReports.slice(0, 6).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showActions={false}
                />
              ))}
            </div>
            {completedReports.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No completed projects yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMunicipalityDashboard = () => {
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
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
                Active Tasks ({activeTasks.length})
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  reportDetails={reports.find(r => r.id === task.report_id)}
                  onUpdateStatus={updateTaskStatus}
                />
              ))}
              {activeTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No active tasks assigned
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {completedTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  reportDetails={reports.find(r => r.id === task.report_id)}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No completed tasks yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

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

        <FeedbackDialog
          isOpen={feedbackDialog.isOpen}
          onClose={() => setFeedbackDialog({ isOpen: false, reportId: '', reportTitle: '' })}
          reportTitle={feedbackDialog.reportTitle}
          reportId={feedbackDialog.reportId}
          onSubmitFeedback={handleFeedbackSubmit}
        />
      </div>
    </div>
  );
}