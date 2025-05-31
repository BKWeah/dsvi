import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TodoTask {
  id: string;
  title: string;
  estimated_hours: number;
  category: string;
  sub_category: string;
  completed: boolean;
  approved: boolean;
  notes: string;
  priority: 'High' | 'Medium' | 'Low';
}

const ClientApprovalPage: React.FC = () => {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .order('category')
        .order('sub_category');

      if (error) throw error;

      if (data) {
        setTasks(data.map(task => ({
          id: task.id,
          title: task.title,
          estimated_hours: task.estimated_hours,
          category: task.category,
          sub_category: task.sub_category,
          completed: task.completed,
          approved: task.approved,
          notes: task.notes,
          priority: task.priority as 'High' | 'Medium' | 'Low'
        })));
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      toast({
        title: "Error Loading Tasks",
        description: error.message || "Failed to load project tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const newApprovalStatus = !task.approved;
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, approved: newApprovalStatus } : t
      ));
      setHasChanges(true);

      // Update in Supabase
      const { error } = await supabase
        .from('project_tasks')
        .update({ approved: newApprovalStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: newApprovalStatus ? "Approved" : "Approval Removed",
        description: `Task "${task.title}" ${newApprovalStatus ? 'approved' : 'approval removed'}`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Failed to update approval:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update approval",
        variant: "destructive"
      });
      // Revert local changes on error
      loadTasks();
    }
  };

  const getProgressStats = () => {
    const completed = tasks.filter(t => t.completed).length;
    const approved = tasks.filter(t => t.approved).length;
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimated_hours, 0);
    
    return {
      completed,
      approved,
      total: tasks.length,
      totalHours,
      completedHours,
      completionPercentage: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
      approvalPercentage: tasks.length > 0 ? (approved / tasks.length) * 100 : 0,
      hoursPercentage: totalHours > 0 ? (completedHours / totalHours) * 100 : 0
    };
  };

  const groupTasksByCategory = (tasks: TodoTask[]) => {
    return tasks.reduce((groups, task) => {
      if (!groups[task.category]) {
        groups[task.category] = {};
      }
      if (!groups[task.category][task.sub_category]) {
        groups[task.category][task.sub_category] = [];
      }
      groups[task.category][task.sub_category].push(task);
      return groups;
    }, {} as Record<string, Record<string, TodoTask[]>>);
  };

  const stats = getProgressStats();
  const groupedTasks = groupTasksByCategory(tasks);

  return (
    <>
      <Helmet>
        <title>DSVI Project Progress - Client Approval</title>
        <meta name="description" content="Review and approve completed development tasks" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">DSVI Project Progress</h1>
                <p className="text-gray-600">Client Approval Interface - Review and approve completed tasks</p>
              </div>
              <Button onClick={loadTasks} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Development Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats.completed}/{stats.total}
                </div>
                <Progress value={stats.completionPercentage} className="mb-1" />
                <p className="text-xs text-gray-500">{stats.completionPercentage.toFixed(1)}% Complete</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.approved}/{stats.total}
                </div>
                <Progress value={stats.approvalPercentage} className="mb-1" />
                <p className="text-xs text-gray-500">{stats.approvalPercentage.toFixed(1)}% Approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hours Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stats.completedHours.toFixed(0)}/130h
                </div>
                <Progress value={stats.hoursPercentage} className="mb-1" />
                <p className="text-xs text-gray-500">{stats.hoursPercentage.toFixed(1)}% Hours Done</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600 mb-2">130h MVP</div>
                <div className="text-sm text-gray-600">Realistic Scope</div>
                <p className="text-xs text-gray-500">Focused & Achievable</p>
              </CardContent>
            </Card>
          </div>

          {/* Tasks by Category */}
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([category, subCategories]) => {
              const categoryTasks = Object.values(subCategories).flat();
              const completedInCategory = categoryTasks.filter(t => t.completed).length;
              const approvedInCategory = categoryTasks.filter(t => t.approved).length;
              const totalHoursInCategory = categoryTasks.reduce((sum, t) => sum + t.estimated_hours, 0);

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{category}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {completedInCategory}/{categoryTasks.length} completed • 
                          {approvedInCategory} approved • {totalHoursInCategory}h total
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{completedInCategory}/{categoryTasks.length}</Badge>
                        <Badge variant="outline">{totalHoursInCategory}h</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(subCategories).map(([subCategory, subTasks]) => (
                      <div key={subCategory} className="mb-6 last:mb-0">
                        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">{subCategory}</h3>
                        <div className="space-y-3">
                          {subTasks.map((task) => (
                            <div key={task.id} className={`p-4 border rounded-lg ${
                              task.priority === 'High' ? 'border-l-4 border-l-red-400' :
                              task.priority === 'Medium' ? 'border-l-4 border-l-yellow-400' :
                              'border-l-4 border-l-green-400'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </h4>
                                  <div className="flex gap-2 mt-1">
                                    <Badge 
                                      variant={task.priority === 'High' ? 'destructive' : 
                                             task.priority === 'Medium' ? 'default' : 'secondary'} 
                                      className="text-xs"
                                    >
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">{task.estimated_hours}h</Badge>
                                    {task.completed && <Badge className="bg-blue-100 text-blue-800 text-xs">✓ Completed</Badge>}
                                    {task.approved && <Badge className="bg-green-100 text-green-800 text-xs">✓ Approved by You</Badge>}
                                  </div>
                                </div>
                              </div>
                              
                              {task.completed && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                      checked={task.approved}
                                      onCheckedChange={() => toggleApproval(task.id)}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-green-800">
                                      I approve this completed task
                                    </span>
                                  </label>
                                </div>
                              )}
                              
                              {task.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">{task.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Instructions */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">📋 How to Use This Interface</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>Green checkboxes</strong> appear when tasks are marked as completed</p>
                <p>• <strong>Check the box</strong> to approve completed tasks</p>
                <p>• <strong>Your approvals</strong> are saved automatically and sync globally</p>
                <p>• <strong>Progress updates</strong> in real-time as development progresses</p>
                <p>• <strong>Access this page</strong> anytime from anywhere in the world</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ClientApprovalPage;