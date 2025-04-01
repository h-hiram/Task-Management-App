
import React, { useState, useEffect } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import TaskList from '@/components/TaskList';
import TaskCalendarView from '@/components/TaskCalendarView';
import TaskForm from '@/components/TaskForm';
import TaskFilter from '@/components/TaskFilter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlusCircle, List, Calendar, Sparkles, Cloud, SmartphoneNfc, RefreshCw } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const TaskDashboard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const { addTask, updateTask, syncTasks } = useTaskContext();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      toast("Enable notifications", {
        description: "Allow notifications to receive task reminders",
        action: {
          label: "Enable",
          onClick: () => Notification.requestPermission()
        },
        duration: 10000,
      });
    }
  }, []);

  // Force a sync on page load for mobile
  useEffect(() => {
    if (isMobile) {
      console.log("Mobile detected, forcing initial sync");
      setTimeout(() => {
        syncTasks();
      }, 1000);
    }
  }, [isMobile, syncTasks]);

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsDialogOpen(false);
  };

  const handleSyncClick = () => {
    setIsRefreshing(true);
    syncTasks();
    toast.success("Tasks synchronized across devices");
    
    // Add visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="relative gradient-border p-3 inline-block">
          <h1 className="text-3xl font-bold mb-1 flex items-center">
            Task Manager
            <Sparkles className="h-5 w-5 ml-2 text-yellow-400 animate-pulse-soft" />
          </h1>
          <p className="text-gray-700">Organize and manage your tasks efficiently</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSyncClick}
            disabled={isRefreshing}
            className="bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 transition-all"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 text-blue-500 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4 mr-2 text-blue-500" />
            )}
            {isMobile ? "Sync" : "Sync Tasks"}
          </Button>
          
          <Button 
            onClick={handleAddTask} 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isMobile ? "Add" : "Add Task"}
          </Button>
        </div>
      </div>

      {isMobile && (
        <div className="mb-4 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center">
          <SmartphoneNfc className="h-4 w-4 mr-2 text-blue-500" />
          <span>Mobile sync enabled. Tap Sync button if tasks aren't appearing.</span>
        </div>
      )}
      
      <TaskFilter />
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6 glass-card">
          <TabsTrigger value="list" className="data-[state=active]:bg-white/80">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white/80">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="animate-fade-in">
          <TaskList onEditTask={handleEditTask} />
        </TabsContent>
        
        <TabsContent value="calendar" className="animate-fade-in">
          <TaskCalendarView 
            onDateSelect={() => {}} 
            onTaskSelect={handleEditTask} 
          />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card border-white/40 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSubmit={handleSubmit} 
            initialData={selectedTask} 
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <TaskProvider>
      <TaskDashboard />
    </TaskProvider>
  );
};

export default Index;
