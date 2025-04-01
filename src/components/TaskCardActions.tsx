
import React from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PauseCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardActionsProps {
  task: Task;
  onComplete: () => void;
  onDefer: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

const TaskCardActions: React.FC<TaskCardActionsProps> = ({ 
  task, 
  onComplete, 
  onDefer, 
  onEdit, 
  onDelete,
  isMobile 
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-wrap gap-2 w-full">
        <Button
          variant={task.category === 'completed' ? "secondary" : "outline"}
          size="sm"
          onClick={onComplete}
          className={`flex-1 min-w-[100px] ${task.category === 'completed' ? "bg-green-100" : ""}`}
        >
          <CheckCircle2 className={`h-4 w-4 mr-1 ${task.category === 'completed' ? "text-green-500" : ""}`} />
          {task.category === 'completed' ? 'Completed' : 'Complete'}
        </Button>
        
        <Button
          variant={task.category === 'deferred' ? "secondary" : "outline"}
          size="sm"
          onClick={onDefer}
          className={`flex-1 min-w-[100px] ${task.category === 'deferred' ? "bg-yellow-100" : ""}`}
        >
          <PauseCircle className={`h-4 w-4 mr-1 ${task.category === 'deferred' ? "text-yellow-500" : ""}`} />
          {task.category === 'deferred' ? 'Deferred' : 'Defer'}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white/50">
              <MoreHorizontal className="h-4 w-4 mr-1" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-gray-200">
            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex gap-2">
        <Button
          variant={task.category === 'completed' ? "secondary" : "outline"}
          size="sm"
          onClick={onComplete}
          className={task.category === 'completed' ? "bg-green-100" : ""}
        >
          <CheckCircle2 className={`h-4 w-4 mr-1 ${task.category === 'completed' ? "text-green-500" : ""}`} />
          {task.category === 'completed' ? 'Completed' : 'Complete'}
        </Button>
        <Button
          variant={task.category === 'deferred' ? "secondary" : "outline"}
          size="sm"
          onClick={onDefer}
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
        <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </>
  );
};

export default TaskCardActions;
