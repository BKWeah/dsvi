import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Download, Upload, RefreshCw } from "lucide-react";
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

const TodoTrackerPage: React.FC = () => {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'approved'>('all');
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load tasks from Supabase on component mount
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

      if (data && data.length > 0) {
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

  const updateTask = async (taskId: string, updates: Partial<TodoTask>) => {
    try {
      // Update local state immediately for responsiveness
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      // Update in Supabase
      const { error } = await supabase
        .from('project_tasks')
        .update({
          completed: updates.completed,
          approved: updates.approved,
          notes: updates.notes
        })
        .eq('id', taskId);

      if (error) throw error;

      setLastSaved(new Date());
      toast({
        title: "Saved",
        description: "Task updated successfully",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive"
      });
      // Revert local changes on error
      loadTasks();
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      if (filter === 'approved') return task.approved;
      return true;
    });
  };

  const groupTasksByCategory = (filteredTasks: TodoTask[]) => {
    return filteredTasks.reduce((groups, task) => {
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

  const getProgressStats = () => {
    const completed = tasks.filter(t => t.completed).length;
    const approved = tasks.filter(t => t.approved).length;
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    const completedHours = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimated_hours, 0);
    const highPriority = tasks.filter(t => t.priority === 'High');
    const highPriorityCompleted = highPriority.filter(t => t.completed).length;
    
    return {
      completed,
      approved,
      total: tasks.length,
      totalHours,
      completedHours,
      completionPercentage: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
      approvalPercentage: tasks.length > 0 ? (approved / tasks.length) * 100 : 0,
      hoursPercentage: totalHours > 0 ? (completedHours / totalHours) * 100 : 0,
      highPriorityPercentage: highPriority.length > 0 ? (highPriorityCompleted / highPriority.length) * 100 : 0
    };
  };

  const exportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsvi-todo-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTasks = getFilteredTasks();
  const groupedTasks = groupTasksByCategory(filteredTasks);
  const stats = getProgressStats();

  return (
    <>
      <Helmet>
        <title>DSVI Development - TODO Tracker (130h MVP)</title>
        <meta name="description" content="Track development progress for DSVI project - 130 hour MVP scope" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">DSVI TODO Tracker - 130h MVP</h1>
                <p className="text-gray-600">Realistic scope with global client approval access via Supabase</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={loadTasks} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                {lastSaved && (
                  <p className="text-xs text-gray-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
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
                <CardTitle className="text-sm font-medium">Client Approval</CardTitle>
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
                <CardTitle className="text-sm font-medium">Hours (130h Total)</CardTitle>
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
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {tasks.filter(t => t.priority === 'High' && t.completed).length}/{tasks.filter(t => t.priority === 'High').length}
                </div>
                <Progress value={stats.highPriorityPercentage} className="mb-1" />
                <p className="text-xs text-gray-500">{stats.highPriorityPercentage.toFixed(1)}% Critical Done</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={exportData} size="sm" variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {(['all', 'completed', 'pending', 'approved'] as const).map((filterOption) => (
                  <Button
                    key={filterOption}
                    size="sm"
                    variant={filter === filterOption ? "default" : "outline"}
                    onClick={() => setFilter(filterOption)}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Task Categories */}
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([category, subCategories]) => {
              const categoryTasks = Object.values(subCategories).flat();
              const completedInCategory = categoryTasks.filter(t => t.completed).length;
              const approvedInCategory = categoryTasks.filter(t => t.approved).length;
              const totalHoursInCategory = categoryTasks.reduce((sum, t) => sum + t.estimated_hours, 0);
              const isExpanded = expandedCategories.has(category);

              return (
                <Card key={category}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <div>
                              <CardTitle className="text-lg">{category}</CardTitle>
                              <p className="text-sm text-gray-600">
                                {completedInCategory}/{categoryTasks.length} completed • 
                                {approvedInCategory} approved • {totalHoursInCategory}h
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge>{completedInCategory}/{categoryTasks.length}</Badge>
                            <Badge variant="outline">{totalHoursInCategory}h</Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent>
                        {Object.entries(subCategories).map(([subCategory, subCategoryTasks]) => (
                          <div key={subCategory} className="mb-6 last:mb-0">
                            <h4 className="font-medium text-gray-800 mb-3 border-b pb-1">
                              {subCategory}
                            </h4>
                            <div className="space-y-3">
                              {subCategoryTasks.map((task) => (
                                <Card key={task.id} className={`border-l-4 ${
                                  task.priority === 'High' ? 'border-l-red-400' :
                                  task.priority === 'Medium' ? 'border-l-yellow-400' :
                                  'border-l-green-400'
                                }`}>
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-3 mb-2">
                                      <Checkbox
                                        checked={task.completed}
                                        onCheckedChange={(checked) => 
                                          updateTask(task.id, { completed: checked as boolean })
                                        }
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <h5 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                          {task.title}
                                        </h5>
                                      </div>
                                      <div className="flex gap-1">
                                        <Badge 
                                          variant={task.priority === 'High' ? 'destructive' : 
                                                 task.priority === 'Medium' ? 'default' : 'secondary'} 
                                          className="text-xs"
                                        >
                                          {task.priority}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">{task.estimated_hours}h</Badge>
                                      </div>
                                    </div>                                    
                                    <div className="flex items-center gap-3 mb-2 ml-6">
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={task.approved}
                                          onCheckedChange={(checked) => 
                                            updateTask(task.id, { approved: checked as boolean })
                                          }
                                        />
                                        <span className="text-xs text-gray-600">Client Approved</span>
                                      </div>
                                      {task.approved && <Badge className="bg-green-100 text-green-800 text-xs">✓ Approved</Badge>}
                                      {task.completed && <Badge className="bg-blue-100 text-blue-800 text-xs">✓ Done</Badge>}
                                    </div>
                                    
                                    <div className="ml-6">
                                      <Textarea
                                        placeholder="Add notes or client feedback..."
                                        value={task.notes}
                                        onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                                        className="min-h-[60px] text-sm"
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {/* Summary Card */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">🎯 130-Hour MVP Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">✅ What's Included:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Fully functional service website</li>
                    <li>• Working school templates</li>
                    <li>• Basic admin panel with Supabase</li>
                    <li>• Simple payment integration</li>
                    <li>• Global client approval system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🚫 Deferred to V2:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Advanced CMS features</li>
                    <li>• Role-based access control</li>
                    <li>• Advanced analytics</li>
                    <li>• Multiple payment methods</li>
                    <li>• Complex workflows</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TodoTrackerPage;