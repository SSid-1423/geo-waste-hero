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
import { MunicipalitySelector } from "@/components/MunicipalitySelector";
import { WorkerAssignmentDialog } from "@/components/WorkerAssignmentDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useMunicipalityPresence } from "@/hooks/useMunicipalityPresence";
import { useMunicipalityMatching } from "@/hooks/useMunicipalityMatching";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useNotifications } from "@/hooks/useNotifications";
import { MunicipalityAssignmentDialog } from "@/components/MunicipalityAssignmentDialog";
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
  ClipboardList,
  Briefcase
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
  
  const { municipalityUsers, onlineCount, totalCount } = useMunicipalityPresence();
  const { municipalities, getBestMatch } = useMunicipalityMatching();
  const { isTracking, locationData, updateAvailabilityStatus } = useLocationTracking();
  const { unreadCount } = useNotifications();
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    isOpen: boolean;
    reportId: string;
    reportTitle: string;
  }>({ isOpen: false, reportId: '', reportTitle: '' });
  
  const [assignmentDialog, setAssignmentDialog] = useState<{
    isOpen: boolean;
    reportId: string;
    reportTitle: string;
    reportAddress?: string;
  }>({ isOpen: false, reportId: '', reportTitle: '', reportAddress: '' });

  const [municipalitySelectionDialog, setMunicipalitySelectionDialog] = useState<{
    isOpen: boolean;
    report: any;
    selectedMunicipality: any;
  }>({ isOpen: false, report: null, selectedMunicipality: null });

  const [isWorkerAssignmentOpen, setIsWorkerAssignmentOpen] = useState(false);
  const [selectedReportForWorker, setSelectedReportForWorker] = useState<any>(null);

  const currentRole = (role || profile?.role) as "citizen" | "government" | "municipality";

  // Remove the old municipality users fetch since it's handled by the hook

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
    setAssignmentDialog({ isOpen: false, reportId: '', reportTitle: '', reportAddress: '' });
  };

  const openAssignmentDialog = (report: any) => {
    setAssignmentDialog({
      isOpen: true,
      reportId: report.id,
      reportTitle: report.title,
      reportAddress: report.address
    });
  };

  const openWorkerAssignmentDialog = (report: any) => {
    setSelectedReportForWorker(report);
    setIsWorkerAssignmentOpen(true);
  };

  const openMunicipalitySelection = async (report: any) => {
    // Try to auto-match first
    let bestMatch = null;
    if (report.address) {
      bestMatch = await getBestMatch(report.address, report.location_lat, report.location_lng);
    }
    
    setMunicipalitySelectionDialog({
      isOpen: true,
      report,
      selectedMunicipality: bestMatch
    });
  };

  const handleMunicipalityAssignment = async () => {
    const { report, selectedMunicipality } = municipalitySelectionDialog;
    if (!report || !selectedMunicipality) return;

    try {
      await createTask({
        report_id: report.id,
        assigned_to: selectedMunicipality.user_id,
        notes: `Auto-assigned based on location: ${report.address || 'No address'}`
      });

      await updateReportStatus(report.id, 'assigned');
      
      setMunicipalitySelectionDialog({ isOpen: false, report: null, selectedMunicipality: null });
    } catch (error) {
      console.error('Failed to assign municipality:', error);
    }
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
          <StatsCard value={onlineCount.toString()} label="Online Municipalities" color="secondary" trend="up" />
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
                <div key={report.id} className="space-y-2">
                  <ReportCard
                    report={report}
                    onUpdateStatus={updateReportStatus}
                    onAssignTask={openAssignmentDialog}
                    showActions={true}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMunicipalitySelection(report)}
                      className="flex-1"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Assign Municipality
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openWorkerAssignmentDialog(report)}
                      className="flex-1"
                    >
                      Assign Worker
                    </Button>
                  </div>
                </div>
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
            <div className="flex gap-2">
              <NotificationCenter />
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
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

        {/* Location Status for Municipality Workers */}
        {profile?.role === 'municipality' && (
          <div className="fixed bottom-4 right-4">
            <Card className="p-4 w-72">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Location Status</h3>
                  <Badge variant={isTracking ? "default" : "secondary"}>
                    {isTracking ? "Tracking" : "Not tracking"}
                  </Badge>
                </div>
                
                {locationData && (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{locationData.address}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 text-sm border rounded"
                    onChange={(e) => updateAvailabilityStatus(e.target.value as any)}
                    defaultValue="available"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        <FeedbackDialog
          isOpen={feedbackDialog.isOpen}
          onClose={() => setFeedbackDialog({ isOpen: false, reportId: '', reportTitle: '' })}
          reportTitle={feedbackDialog.reportTitle}
          reportId={feedbackDialog.reportId}
          onSubmitFeedback={handleFeedbackSubmit}
        />

        <MunicipalityAssignmentDialog
          isOpen={assignmentDialog.isOpen}
          onClose={() => setAssignmentDialog({ isOpen: false, reportId: '', reportTitle: '', reportAddress: '' })}
          onAssign={(userId, notes) => handleAssignTask(assignmentDialog.reportId, userId, notes)}
          municipalityUsers={municipalityUsers}
          reportTitle={assignmentDialog.reportTitle}
          reportAddress={assignmentDialog.reportAddress}
        />

        {/* Municipality Selection Dialog */}
        {municipalitySelectionDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Smart Municipality Assignment
                </h2>
                <div className="mb-4">
                  <h3 className="font-medium text-sm">{municipalitySelectionDialog.report?.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    📍 {municipalitySelectionDialog.report?.address || 'No address provided'}
                  </p>
                  {municipalitySelectionDialog.selectedMunicipality && (
                    <p className="text-xs text-success-foreground mt-1">
                      ✓ Auto-matched based on location
                    </p>
                  )}
                </div>
                
                <MunicipalitySelector
                  municipalities={municipalities}
                  selectedMunicipality={municipalitySelectionDialog.selectedMunicipality}
                  onSelect={(municipality) => 
                    setMunicipalitySelectionDialog(prev => ({ 
                      ...prev, 
                      selectedMunicipality: municipality 
                    }))
                  }
                  title="Select Best Municipality"
                />
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMunicipalitySelectionDialog({ isOpen: false, report: null, selectedMunicipality: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMunicipalityAssignment}
                    disabled={!municipalitySelectionDialog.selectedMunicipality}
                  >
                    Assign to {municipalitySelectionDialog.selectedMunicipality?.full_name || 'Municipality'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Worker Assignment Dialog */}
        <WorkerAssignmentDialog
          isOpen={isWorkerAssignmentOpen}
          onClose={() => setIsWorkerAssignmentOpen(false)}
          reportData={selectedReportForWorker || {}}
        />
      </div>
    </div>
  );
}