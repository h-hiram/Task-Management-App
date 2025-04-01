
import React from 'react';
import { format } from 'date-fns';
import { Task, PRIORITY_LABELS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/types/task';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, ArrowUpCircle, CheckCircle2, AlertCircle, MoreHorizontal, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTaskContext();
  const isPastDue = new Date() > new Date(task.dueDate) && task.category !== 'completed' && task.category !== 'deployed';
  const isMobile = useIsMobile();
  
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-priority-high" />;
      case 'medium':
        return <ArrowUpCircle className="h-4 w-4 text-priority-medium" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-priority-low" />;
      default:
        return null;
    }
  };

  const handleCompleteToggle = () => {
    updateTask(task.id, { 
      category: task.category === 'completed' ? 'pending' : 'completed' 
    });
  };
  
  const handleDeferToggle = () => {
    updateTask(task.id, { 
      category: task.category === 'deferred' ? 'pending' : 'deferred' 
    });
  };

  const getCategoryColor = () => {
    switch (task.category) {
      case 'pending':
        return "bg-category-pending/90 hover:bg-category-pending";
      case 'completed':
        return "bg-category-completed/90 hover:bg-category-completed";
      case 'deferred':
        return "bg-category-deferred/90 hover:bg-category-deferred";
      case 'deployed':
        return "bg-category-deployed/90 hover:bg-category-deployed";
      default:
        return "";
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return "bg-priority-high/90 hover:bg-priority-high";
      case 'medium':
        return "bg-priority-medium/90 hover:bg-priority-medium";
      case 'low':
        return "bg-priority-low/90 hover:bg-priority-low";
      default:
        return "";
    }
  };

  // Calculate time remaining or overdue with hours and minutes
  const getTimeStatus = () => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    
    // If completed or deferred, no need to show time status
    if (task.category === 'completed' || task.category === 'deferred') {
      return null;
    }
    
    // If ongoing/deployed, show started status instead of due time
    if (task.category === 'deployed') {
      if (now >= dueDate) {
        const runningForMs = now.getTime() - dueDate.getTime();
        const runningDays = Math.floor(runningForMs / (1000 * 60 * 60 * 24));
        const runningHours = Math.floor((runningForMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const runningMinutes = Math.floor((runningForMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (runningDays > 0) {
          return (
            <span className="text-blue-600 font-medium text-xs">
              Running for {runningDays}d {runningHours}h {runningMinutes}m
            </span>
          );
        } else {
          return (
            <span className="text-blue-600 font-medium text-xs">
              Running for {runningHours}h {runningMinutes}m
            </span>
          );
        }
      } else {
        // Will start in the future
        const startingInMs = dueDate.getTime() - now.getTime();
        const startingDays = Math.floor(startingInMs / (1000 * 60 * 60 * 24));
        const startingHours = Math.floor((startingInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const startingMinutes = Math.floor((startingInMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (startingDays > 0) {
          return (
            <span className="text-purple-600 font-medium text-xs">
              Starts in {startingDays}d {startingHours}h {startingMinutes}m
            </span>
          );
        } else {
          return (
            <span className="text-purple-600 font-medium text-xs">
              Starts in {startingHours}h {startingMinutes}m
            </span>
          );
        }
      }
    }
    
    // If past due
    if (timeDiff < 0) {
      const overdueDays = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
      const overdueHours = Math.floor((Math.abs(timeDiff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const overdueMinutes = Math.floor((Math.abs(timeDiff) % (1000 * 60 * 60)) / (1000 * 60));
      
      if (overdueDays > 0) {
        return (
          <span className="text-red-500 font-medium text-xs">
            Overdue by {overdueDays}d {overdueHours}h {overdueMinutes}m
          </span>
        );
      } else {
        return (
          <span className="text-red-500 font-medium text-xs">
            Overdue by {overdueHours}h {overdueMinutes}m
          </span>
        );
      }
    }
    
    // If due within 24 hours
    if (timeDiff < 24 * 60 * 60 * 1000) {
      const dueHours = Math.floor(timeDiff / (1000 * 60 * 60));
      const dueMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <span className="text-orange-500 font-medium text-xs">
          Due in {dueHours}h {dueMinutes}m
        </span>
      );
    }
    
    // If due in more than 24 hours
    const dueDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const dueHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const dueMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return (
      <span className="text-green-600 font-medium text-xs">
        Due in {dueDays}d {dueHours}h {dueMinutes}m
      </span>
    );
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-300 hover:shadow-md overflow-hidden",
      "border-t-4",
      task.category === 'completed' ? "border-t-green-500" : 
      task.category === 'deferred' ? "border-t-yellow-500" :
      task.category === 'deployed' ? "border-t-blue-500" :
      task.priority === 'high' ? "border-t-red-500" :
      task.priority === 'medium' ? "border-t-orange-500" : "border-t-blue-500",
      isPastDue && "border-red-500 bg-red-50/30"
    )}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn("font-medium text-lg", 
              task.category === 'completed' && "line-through text-gray-500",
              task.category === 'deferred' && "italic text-gray-500"
            )}>
              {task.title}
            </h3>
            {task.category === 'deferred' ? 
              <PauseCircle className="h-4 w-4 text-yellow-500" /> : 
              getPriorityIcon()}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge className={cn("transition-colors", getPriorityColor())}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={cn("transition-colors", getCategoryColor())}>
                  {CATEGORY_LABELS[task.category]}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{CATEGORY_DESCRIPTIONS[task.category]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-500 mb-3">
          {task.description}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'hh:mm a')}</span>
          </div>
          {getTimeStatus()}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        {isMobile ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/50">
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleCompleteToggle}>
                  {task.category === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeferToggle}>
                  {task.category === 'deferred' ? 'Resume Task' : 'Defer Task'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-500">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                variant={task.category === 'completed' ? "secondary" : "outline"}
                size="sm"
                onClick={handleCompleteToggle}
                className={task.category === 'completed' ? "bg-green-100" : ""}
              >
                <CheckCircle2 className={`h-4 w-4 mr-1 ${task.category === 'completed' ? "text-green-500" : ""}`} />
                {task.category === 'completed' ? 'Completed' : 'Complete'}
              </Button>
              <Button
                variant={task.category === 'deferred' ? "secondary" : "outline"}
                size="sm"
                onClick={handleDeferToggle}
                className={task.category === 'deferred' ? "bg-yellow-100" : ""}
              >
                <PauseCircle className={`h-4 w-4 mr-1 ${task.category === 'deferred' ? "text-yellow-500" : ""}`} />
                {task.category === 'deferred' ? 'Deferred' : 'Defer'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                Delete
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
