import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/StatsCard';
import { ReportCard } from '@/components/ReportCard';
import { TaskCard } from '@/components/TaskCard';
import { FeatureCard } from '@/components/FeatureCard';
import { QuickReportCard } from '@/components/QuickReportCard';
import { Navigation } from '@/components/Navigation';
import { WorkerLocationCard } from '@/components/WorkerLocationCard';
import { WorkerAssignmentDialog } from '@/components/WorkerAssignmentDialog';
import { TaskAssignmentDialog } from '@/components/TaskAssignmentDialog';
import { NotificationCenter } from '@/components/NotificationCenter';
import { JobListingCard } from '@/components/JobListingCard';
import { JobApplicationManagement } from '@/components/JobApplicationManagement';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { useJobs } from '@/hooks/useJobs';
import { useParams, useNavigate } from "react-router-dom";
import { format } from 'date-fns';
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
  Briefcase,
  Plus
} from "lucide-react";

export function Dashboard() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const [showTaskAssignmentDialog, setShowTaskAssignmentDialog] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [showCreateJobDialog, setShowCreateJobDialog] = useState(false);

  const currentRole = (role || profile?.role) as "citizen" | "government" | "municipality";

  // Query for waste reports
  const { data: reports = [] } = useQuery({
    queryKey: ['waste-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('waste_reports')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
    refetchInterval: 30000
  });

  // Query for municipality workers (for government users) with task completion count
  const { data: municipalityWorkers = [] } = useQuery({
    queryKey: ['municipality-workers'],
    queryFn: async () => {
      const { data: workers } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, address, availability_status, current_address, current_location_lat, current_location_lng')
        .eq('role', 'municipality')
        .order('full_name', { ascending: true });
      
      if (!workers) return [];

      // Get task completion counts for each worker
      const workersWithCounts = await Promise.all(
        workers.map(async (worker) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', worker.user_id)
            .eq('status', 'completed');
          
          return {
            ...worker,
            completed_tasks: count || 0
          };
        })
      );

      return workersWithCounts;
    },
    enabled: profile?.role === 'government',
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  });

  // Query for tasks with worker names (for government users)
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!tasksData) return [];

      // Get worker names for each task
      const tasksWithWorkerNames = await Promise.all(
        tasksData.map(async (task) => {
          const { data: worker } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', task.assigned_to)
            .single();
          
          return {
            ...task,
            assignedWorkerName: worker?.full_name || 'Unknown',
            title: task.notes // Use notes as title for now
          };
        })
      );

      return tasksWithWorkerNames;
    },
    enabled: profile?.role === 'government',
    refetchInterval: 30000 // Real-time updates
  });

  // Query for user's tasks (for municipality users)
  const { data: userTasks = [] } = useQuery({
    queryKey: ['user-tasks', profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', profile?.user_id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: profile?.role === 'municipality' && !!profile?.user_id,
    refetchInterval: 30000 // Real-time updates
  });

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'assigned') return task.status === 'assigned' || task.status === 'in_progress';
    if (taskFilter === 'completed') return task.status === 'completed';
    return true; // 'all'
  });

  // Split user tasks into assigned and completed
  const assignedTasks = userTasks.filter(task => task.status === 'assigned' || task.status === 'in_progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');

  // Get user's completed task count for display
  const userCompletedCount = completedTasks.length;

  // Jobs hook
  const { 
    jobs: jobListings, 
    applications: jobApplications, 
    createJob: createJobListing, 
    updateApplicationStatus 
  } = useJobs();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  const renderGovernmentDashboard = () => (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="task-assignment">Task Assignment</TabsTrigger>
          <TabsTrigger value="worker-management">Worker Management</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard value={reports.length.toString()} label="Total Reports" color="primary" />
            <StatsCard value={municipalityWorkers.length.toString()} label="Municipality Workers" color="secondary" />
            <StatsCard value={tasks.length.toString()} label="Total Tasks" color="accent" />
            <StatsCard value={jobListings.length.toString()} label="Active Job Listings" color="success" />
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.address}</p>
                      </div>
                      <Badge variant="outline">{report.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.assignedWorkerName}</p>
                      </div>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Waste Management Reports</h3>
            <div className="grid gap-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report as any}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="task-assignment" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Task Assignment</h2>
            <Button onClick={() => setShowTaskAssignmentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign New Task
            </Button>
          </div>
          
          {/* Real-time Municipal Workers List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Municipal Workers Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {municipalityWorkers.map((worker) => (
                <div key={worker.user_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{worker.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      worker.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {worker.availability_status}
                    </span>
                  </div>
                  
                  {worker.current_address && (
                    <p className="text-sm text-muted-foreground">
                      📍 {worker.current_address}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasks Completed: <strong>{worker.completed_tasks || 0}</strong></span>
                  </div>
                </div>
              ))}
              {municipalityWorkers.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No municipal workers found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Task History Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Task History</h3>
              <div className="flex gap-2">
                <Button
                  variant={taskFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('all')}
                >
                  All Tasks
                </Button>
                <Button
                  variant={taskFilter === 'assigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('assigned')}
                >
                  Assigned
                </Button>
                <Button
                  variant={taskFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskFilter('completed')}
                >
                  Completed
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Task Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Assigned Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completion Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {task.title || task.notes || 'Untitled Task'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {task.assignedWorkerName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(task.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {task.actual_completion ? format(new Date(task.actual_completion), 'MMM dd, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="worker-management" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Worker Management</h2>
          </div>
          
          <div className="grid gap-4">
            {municipalityWorkers.map((worker) => (
              <WorkerLocationCard
                key={worker.user_id}
                worker={{
                  ...worker,
                  is_online: true,
                  last_location_update: null
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="careers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Careers Management</h2>
            <Button onClick={() => setShowCreateJobDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Listing
            </Button>
          </div>
          
          <JobApplicationManagement 
            applications={jobApplications}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderMunicipalityDashboard = () => (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard value={userTasks.length.toString()} label="Total Tasks" color="primary" />
            <StatsCard value={assignedTasks.length.toString()} label="Active Tasks" color="warning" />
            <StatsCard value={userCompletedCount.toString()} label="Completed Tasks" color="success" />
            <StatsCard value={reports.length.toString()} label="Reports in Area" color="accent" />
          </div>
        </TabsContent>

        {/* My Tasks Tab for Municipality Users */}
        <TabsContent value="my-tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
            <div className="text-sm text-muted-foreground">
              Completed Tasks: <strong>{userCompletedCount}</strong>
            </div>
          </div>

          {/* Assigned Tasks Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              📋 Assigned Tasks
              <Badge variant="secondary">{assignedTasks.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTasks.map((task) => (
                <Card key={task.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {task.notes || 'Task Details'}
                      </CardTitle>
                      <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {task.task_address && (
                      <p className="text-sm text-muted-foreground">
                        📍 {task.task_address}
                      </p>
                    )}
                    
                    {task.estimated_completion && (
                      <p className="text-sm text-muted-foreground">
                        ⏰ Due: {format(new Date(task.estimated_completion), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {task.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('tasks')
                                .update({ status: 'in_progress' })
                                .eq('id', task.id);
                              
                              if (error) throw error;
                              
                              toast({
                                title: "Task Started",
                                description: "Task marked as in progress",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update task status",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Start Task
                        </Button>
                      )}
                      
                      {(task.status === 'assigned' || task.status === 'in_progress') && (
                        <Button 
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('tasks')
                                .update({ 
                                  status: 'completed',
                                  actual_completion: new Date().toISOString()
                                })
                                .eq('id', task.id);
                              
                              if (error) throw error;
                              
                              toast({
                                title: "Task Completed",
                                description: "Task marked as completed successfully",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to complete task",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {assignedTasks.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No assigned tasks at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              ✅ Completed Tasks
              <Badge variant="secondary">{completedTasks.length}</Badge>
            </h3>
            
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{task.notes || 'Task Details'}</h4>
                        {task.task_address && (
                          <p className="text-sm text-muted-foreground">📍 {task.task_address}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ✅ Completed: {format(new Date(task.actual_completion), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Completed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {completedTasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed tasks yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Area Reports</h3>
            <div className="grid gap-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report as any}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCitizenDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard value={reports.length.toString()} label="Total Reports" color="primary" />
        <StatsCard value="0" label="Resolved" color="success" />
        <StatsCard value="0" label="In Progress" color="warning" />
        <StatsCard value="0" label="Pending" color="accent" />
      </div>
      
      <QuickReportCard />
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.address}</p>
                </div>
                <Badge variant="outline">{report.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

        {/* Task Assignment Dialog */}
        <TaskAssignmentDialog
          isOpen={showTaskAssignmentDialog}
          onClose={() => setShowTaskAssignmentDialog(false)}
          workers={municipalityWorkers}
        />

        {/* Create Job Dialog */}
        <CreateJobDialog
          open={showCreateJobDialog}
          onClose={() => setShowCreateJobDialog(false)}
        />
      </div>
    </div>
  );
}