
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarIcon, Clock, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { useIsMobile } from '@/hooks/use-mobile';
import TaskCardBadges, { getCategoryColor, getPriorityColor } from './TaskCardBadges';
import TaskCardTimeStatus from './TaskCardTimeStatus';
import TaskCardActions from './TaskCardActions';
import TaskCardPriorityIcon from './TaskCardPriorityIcon';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTaskContext();
  const isPastDue = new Date() > new Date(task.dueDate) && task.category !== 'completed' && task.category !== 'deployed';
  const isMobile = useIsMobile();
  
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
              <TaskCardPriorityIcon priority={task.priority} />}
          </div>
        </div>
        <TaskCardBadges priority={task.priority} category={task.category} />
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
          <TaskCardTimeStatus task={task} />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <TaskCardActions 
          task={task} 
          onComplete={handleCompleteToggle}
          onDefer={handleDeferToggle}
          onEdit={onEdit}
          onDelete={deleteTask}
          isMobile={isMobile}
        />
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
