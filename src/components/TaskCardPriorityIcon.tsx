
import React from 'react';
import { Priority } from '@/types/task';
import { AlertCircle, ArrowUpCircle, CheckCircle2 } from 'lucide-react';

interface TaskCardPriorityIconProps {
  priority: Priority;
}

const TaskCardPriorityIcon: React.FC<TaskCardPriorityIconProps> = ({ priority }) => {
  switch (priority) {
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

export default TaskCardPriorityIcon;
