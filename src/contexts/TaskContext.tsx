
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

// Mobile-friendly timestamp for more reliable syncing
const getCurrentTimestamp = () => {
  return new Date().getTime();
};

// Load tasks from localStorage or use default tasks
const loadTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    try {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert string dates back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (e) {
      console.error("Error parsing saved tasks:", e);
      return getDefaultTasks();
    }
  }
  
  return getDefaultTasks();
};

// Default tasks if nothing in localStorage
const getDefaultTasks = (): Task[] => {
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
    {
      id: '4',
      title: 'Research competitors',
      description: 'Task was left alone due to higher priorities',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      priority: 'low' as Priority,
      category: 'deferred' as Category,
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
  const [lastSyncTime, setLastSyncTime] = useState<number>(getCurrentTimestamp());
  const [broadcastChannel] = useState(createBroadcastChannel());
  const notificationService = NotificationService.getInstance();

  // More robust initialization to ensure tasks are loaded on mobile
  useEffect(() => {
    const initialTasks = loadTasks();
    console.log("Initial tasks loaded:", initialTasks.length);
    setTasks(initialTasks);
    
    // Set up a listener for storage events to sync between tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        try {
          console.log("Storage change detected for tasks");
          const newTasks = e.newValue ? JSON.parse(e.newValue) : [];
          setTasks(newTasks.map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          })));
        } catch (err) {
          console.error("Error processing storage change:", err);
        }
      }
    };

    // Listen for BroadcastChannel messages
    const handleBroadcastMessage = (event: MessageEvent) => {
      try {
        if (event.data.type === 'TASKS_UPDATED') {
          console.log("Broadcast message received:", event.data.tasks.length);
          setTasks(event.data.tasks.map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          })));
        }
      } catch (err) {
        console.error("Error processing broadcast message:", err);
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

  // Enhanced persistence logic to handle mobile environments better
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      try {
        // Stringify with proper date handling
        const tasksJson = JSON.stringify(tasks);
        localStorage.setItem('tasks', tasksJson);
        console.log("Tasks saved to localStorage:", tasks.length);
        
        // Force sync on task changes for mobile
        if (isMobile) {
          // Add a small delay to ensure storage is updated
          setTimeout(() => {
            console.log("Mobile sync triggered automatically");
            // Also update lastSyncTime for mobile
            setLastSyncTime(getCurrentTimestamp());
          }, 100);
        }
        
        // Broadcast to other tabs/windows
        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'TASKS_UPDATED',
            tasks: tasks,
            sourceDeviceId: deviceId,
            timestamp: getCurrentTimestamp()
          });
        }
      } catch (err) {
        console.error("Error saving tasks:", err);
      }
    }
  }, [tasks, broadcastChannel, deviceId, isMobile]);

  // Check for tasks due soon or already due every minute
  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        // Skip completed, deferred or deployed tasks for notifications
        if (task.category === 'completed' || task.category === 'deferred' || task.category === 'deployed') {
          return;
        }
        
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // Early notification: Task due in 5 minutes (300000 ms)
        if (timeDiff <= 300000 && timeDiff > 240000) {
          notificationService.sendNotification(
            `Task Starting Soon: ${task.title}`,
            `Your task will start in 5 minutes. Priority: ${task.priority.toUpperCase()}`
          );
          
          toast(`Task Starting Soon: ${task.title}`, {
            description: `Your task will start in 5 minutes. Priority: ${task.priority.toUpperCase()}`,
            duration: 10000,
          });
        }
        
        // Notification exactly at due time (within a minute window)
        if (timeDiff <= 60000 && timeDiff > -60000) {
          notificationService.sendNotification(
            `Task Due Now: ${task.title}`,
            `Priority: ${task.priority.toUpperCase()}`
          );
          
          toast(`Task Due Now: ${task.title}`, {
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
    
    // Check every 30 seconds for more immediate notifications
    const intervalId = setInterval(checkDueTasks, 30000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  // Enhanced sync function for cross-device sync button
  const syncTasks = async () => {
    try {
      // Force a refresh from localStorage first
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        console.log("Manual sync - loading from localStorage");
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })));
      }
      
      const currentTime = getCurrentTimestamp();
      setLastSyncTime(currentTime);
      
      // Force update localStorage again
      localStorage.setItem('last_sync', currentTime.toString());
      
      // Force a refresh of localStorage to trigger syncing
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'TASKS_UPDATED',
          tasks: tasks,
          sourceDeviceId: deviceId,
          timestamp: currentTime
        });
      }
      
      console.log("Manual sync completed");
      uiToast({
        title: "Tasks synchronized",
        description: `Successfully synced ${tasks.length} tasks across your devices`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      uiToast({
        title: "Sync failed",
        description: "Could not sync tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up auto-sync timer (every 2 minutes for mobile, 5 minutes for desktop)
  useEffect(() => {
    const syncInterval = isMobile ? 120000 : 300000; // 2 minutes for mobile, 5 minutes for desktop
    console.log(`Auto-sync set up, interval: ${syncInterval}ms`);
    
    const autoSyncInterval = setInterval(() => {
      console.log("Auto-sync triggered");
      syncTasks();
    }, syncInterval);
    
    return () => clearInterval(autoSyncInterval);
  }, [isMobile]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log("Adding new task:", newTask.title);
    setTasks(prev => [...prev, newTask]);
    
    // Force immediate sync after adding a task
    setTimeout(() => syncTasks(), 100);
    
    uiToast({
      title: "Task created",
      description: "Your task has been successfully created",
    });
  };

  const updateTask = (id: string, taskUpdate: Partial<Task>) => {
    console.log("Updating task:", id);
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, ...taskUpdate, updatedAt: new Date() } 
          : task
      )
    );
    
    // Force immediate sync after updating a task
    setTimeout(() => syncTasks(), 100);
    
    uiToast({
      title: "Task updated",
      description: "Your task has been successfully updated",
    });
  };

  const deleteTask = (id: string) => {
    console.log("Deleting task:", id);
    setTasks(prev => prev.filter(task => task.id !== id));
    
    // Force immediate sync after deleting a task
    setTimeout(() => syncTasks(), 100);
    
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
