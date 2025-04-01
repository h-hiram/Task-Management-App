
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Priority, Category, PRIORITY_LABELS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskCardBadgesProps {
  priority: Priority;
  category: Category;
}

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
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

export const getCategoryColor = (category: Category): string => {
  switch (category) {
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

const TaskCardBadges: React.FC<TaskCardBadgesProps> = ({ priority, category }) => {
  return (
    <div className="flex flex-col gap-2 items-end">
      <Badge className={cn("transition-colors", getPriorityColor(priority))}>
        {PRIORITY_LABELS[priority]}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn("transition-colors", getCategoryColor(category))}>
              {CATEGORY_LABELS[category]}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{CATEGORY_DESCRIPTIONS[category]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TaskCardBadges;
