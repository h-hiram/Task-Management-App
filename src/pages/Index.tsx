
import React, { useState } from 'react';
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
import { PlusCircle, List, Calendar } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';

const TaskDashboard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const { addTask, updateTask } = useTaskContext();

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Task Manager</h1>
          <p className="text-gray-500">Organize and manage your tasks efficiently</p>
        </div>
        
        <Button 
          onClick={handleAddTask} 
          className="mt-4 sm:mt-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <TaskFilter />
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
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
        <DialogContent className="sm:max-w-md">
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
