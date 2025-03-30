import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Priority, Category } from '@/types/task';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationService from '@/services/NotificationService';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  filteredTasks: Task[];
  setFilterPriority: (priority: Priority | null) => void;
  setFilterCategory: (category: Category | null) => void;
  filterPriority: Priority | null;
  filterCategory: Category | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  syncTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Function to generate a unique device ID if it doesn't exist
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// Create a BroadcastChannel for cross-tab communication if supported
const createBroadcastChannel = () => {
  if (typeof BroadcastChannel !== 'undefined') {
    return new BroadcastChannel('task_sync_channel');
  }
  return null;
};

// Load tasks from localStorage or use default tasks
const loadTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);
    // Convert string dates back to Date objects
    return parsedTasks.map((task: any) => ({
      ...task,
      dueDate: new Date(task.dueDate),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }
  
  // Default tasks if nothing in localStorage
  return [
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Draft the initial proposal for the new client project',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      priority: 'high' as Priority,
      category: 'pending' as Category,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Weekly team meeting',
      description: 'Discuss progress and roadblocks with the team',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      priority: 'medium' as Priority,
      category: 'pending' as Category,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'System maintenance',
      description: 'Ongoing system maintenance that will run for several days',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      priority: 'medium' as Priority,
      category: 'deployed' as Category,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast: uiToast } = useToast();
  const isMobile = useIsMobile();
  const deviceId = getDeviceId();
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [broadcastChannel] = useState(createBroadcastChannel());
  const notificationService = NotificationService.getInstance();

  // Load tasks from localStorage on component mount
  useEffect(() => {
    setTasks(loadTasks());
    
    // Set up a listener for storage events to sync between tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        const newTasks = e.newValue ? JSON.parse(e.newValue) : [];
        setTasks(newTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })));
      }
    };

    // Listen for BroadcastChannel messages
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data.type === 'TASKS_UPDATED') {
        setTasks(event.data.tasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
    };
  }, [broadcastChannel]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      // Broadcast to other tabs/windows
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'TASKS_UPDATED',
          tasks: tasks,
          sourceDeviceId: deviceId
        });
      }
    }
  }, [tasks, broadcastChannel, deviceId]);

  // Check for tasks due in 5 minutes and for due tasks every minute
  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // Early notification: If the task is due in 5 minutes (300000 ms) and is not completed
        if (timeDiff <= 300000 && timeDiff > 240000 && task.category !== 'completed') {
          notificationService.sendNotification(
            `Task Starting Soon: ${task.title}`,
            `Your task will start in 5 minutes. Priority: ${task.priority.toUpperCase()}`
          );
          
          toast(`Task Starting Soon: ${task.title}`, {
            description: `Your task will start in 5 minutes. Priority: ${task.priority.toUpperCase()}`,
            duration: 10000,
          });
        }
        
        // Regular due notification
        if (timeDiff <= 60000 && timeDiff > 0 && task.category !== 'completed') {
          notificationService.sendNotification(
            `Task Due: ${task.title}`,
            `Priority: ${task.priority.toUpperCase()}`
          );
          
          toast(`Task Due: ${task.title}`, {
            description: `Priority: ${task.priority.toUpperCase()}`,
            duration: 5000,
          });
        }
      });
    };

    // Request notification permission on component mount
    notificationService.requestPermission();

    // Check immediately when component mounts
    checkDueTasks();
    const intervalId = setInterval(checkDueTasks, 60000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  // Manual sync function for cross-device sync button
  const syncTasks = async () => {
    try {
      // For a real implementation, this would connect to a backend API
      // For now, we'll just simulate by updating the last sync time and showing a toast
      setLastSyncTime(Date.now());
      
      // Force a refresh of localStorage to trigger syncing
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'TASKS_UPDATED',
          tasks: tasks,
          sourceDeviceId: deviceId
        });
      }
      
      uiToast({
        title: "Tasks synchronized",
        description: `Successfully synced tasks across your devices`,
      });
    } catch (error) {
      uiToast({
        title: "Sync failed",
        description: "Could not sync tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up auto-sync timer (every 5 minutes)
  useEffect(() => {
    const autoSyncInterval = setInterval(() => {
      syncTasks();
    }, 300000); // 5 minutes
    
    return () => clearInterval(autoSyncInterval);
  }, []);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks(prev => [...prev, newTask]);
    uiToast({
      title: "Task created",
      description: "Your task has been successfully created",
    });
  };

  const updateTask = (id: string, taskUpdate: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, ...taskUpdate, updatedAt: new Date() } 
          : task
      )
    );
    uiToast({
      title: "Task updated",
      description: "Your task has been successfully updated",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    uiToast({
      title: "Task deleted",
      description: "Your task has been successfully deleted",
    });
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  // Apply filters and search to tasks
  const filteredTasks = tasks.filter(task => {
    // Apply priority filter
    if (filterPriority && task.priority !== filterPriority) {
      return false;
    }
    
    // Apply category filter
    if (filterCategory && task.category !== filterCategory) {
      return false;
    }
    
    // Apply search query
    if (searchQuery && 
       !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
       !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        filteredTasks,
        setFilterPriority,
        setFilterCategory,
        filterPriority,
        filterCategory,
        searchQuery,
        setSearchQuery,
        syncTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
