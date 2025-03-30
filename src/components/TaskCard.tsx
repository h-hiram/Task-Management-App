
import React from 'react';
import { format } from 'date-fns';
import { Task, PRIORITY_LABELS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/types/task';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTaskContext();
  const isPastDue = new Date() > new Date(task.dueDate) && task.category !== 'completed';
  
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

  return (
    <Card className={cn("w-full transition-all duration-300 hover:shadow-md", 
      isPastDue && "border-red-500"
    )}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn("font-medium text-lg", 
              task.category === 'completed' && "line-through text-gray-500"
            )}>
              {task.title}
            </h3>
            {getPriorityIcon()}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge 
            className={cn(
              task.priority === 'high' && "bg-priority-high", 
              task.priority === 'medium' && "bg-priority-medium",
              task.priority === 'low' && "bg-priority-low"
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={cn(
                    task.category === 'pending' && "bg-category-pending",
                    task.category === 'completed' && "bg-category-completed",
                    task.category === 'deferred' && "bg-category-deferred",
                    task.category === 'deployed' && "bg-category-deployed"
                  )}
                >
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
        <div className="flex items-center text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'hh:mm a')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCompleteToggle}
        >
          {task.category === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
