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

const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

const createBroadcastChannel = () => {
  if (typeof BroadcastChannel !== 'undefined') {
    return new BroadcastChannel('task_sync_channel');
  }
  return null;
};

const getCurrentTimestamp = () => {
  return new Date().getTime();
};

const loadTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    try {
      const parsedTasks = JSON.parse(savedTasks);
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

  useEffect(() => {
    const initialTasks = loadTasks();
    console.log("Initial tasks loaded:", initialTasks.length);
    setTasks(initialTasks);
    
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

  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      try {
        const tasksJson = JSON.stringify(tasks);
        localStorage.setItem('tasks', tasksJson);
        console.log("Tasks saved to localStorage:", tasks.length);
        
        if (isMobile) {
          setTimeout(() => {
            console.log("Mobile sync triggered automatically");
            setLastSyncTime(getCurrentTimestamp());
          }, 100);
        }
        
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

  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.category === 'completed' || task.category === 'deferred' || task.category === 'deployed') {
          return;
        }
        
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        
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

    notificationService.requestPermission();
    checkDueTasks();
    
    const intervalId = setInterval(checkDueTasks, 30000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  const syncTasks = async () => {
    try {
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
      
      localStorage.setItem('last_sync', currentTime.toString());
      
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

  useEffect(() => {
    const syncInterval = isMobile ? 120000 : 300000;
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
    
    setTimeout(() => syncTasks(), 100);
    
    uiToast({
      title: "Task created",
      description: "Your task has been successfully created",
    });
  };

  const updateTask = (id: string, taskUpdate: Partial<Task>) => {
    console.log("Updating task:", id, "with updates:", taskUpdate);
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, ...taskUpdate, updatedAt: new Date() } 
          : task
      )
    );
    
    setTimeout(() => syncTasks(), 100);
    
    if (taskUpdate.category === 'deferred') {
      uiToast({
        title: "Task deferred",
        description: "Task has been marked as deferred",
      });
    } else if (taskUpdate.category === 'completed') {
      uiToast({
        title: "Task completed",
        description: "Task has been marked as completed",
      });
    } else if (taskUpdate.category === 'pending' && prev.find(task => task.id === id)?.category === 'deferred') {
      uiToast({
        title: "Task resumed",
        description: "Deferred task has been resumed",
      });
    } else {
      uiToast({
        title: "Task updated",
        description: "Your task has been successfully updated",
      });
    }
  };

  const deleteTask = (id: string) => {
    console.log("Deleting task:", id);
    setTasks(prev => prev.filter(task => task.id !== id));
    
    setTimeout(() => syncTasks(), 100);
    
    uiToast({
      title: "Task deleted",
      description: "Your task has been successfully deleted",
    });
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority && task.priority !== filterPriority) {
      return false;
    }
    
    if (filterCategory && task.category !== filterCategory) {
      return false;
    }
    
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
