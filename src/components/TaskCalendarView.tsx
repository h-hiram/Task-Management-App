
import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';

interface TaskCalendarViewProps {
  onDateSelect: (date: Date) => void;
  onTaskSelect: (task: Task) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onDateSelect, onTaskSelect }) => {
  const { tasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  // Group tasks by date for easy access
  const tasksByDate = useMemo(() => {
    const result: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(task);
    });
    
    return result;
  }, [tasks]);

  // List of tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  }, [selectedDate, tasksByDate]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onDateSelect(date);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex justify-center">
        <TooltipProvider>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="border rounded-md p-3"
            components={{
              Day: ({ day, ...props }) => {
                // Check if there are tasks on this day
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const hasTasks = dayTasks.length > 0;

                // Count tasks by priority
                const highPriorityCount = dayTasks.filter(t => t.priority === 'high').length;
                const mediumPriorityCount = dayTasks.filter(t => t.priority === 'medium').length;
                const lowPriorityCount = dayTasks.filter(t => t.priority === 'low').length;

                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        {...props}
                        className={`${props.className} relative ${
                          hasTasks 
                            ? 'font-bold' 
                            : ''
                        } ${selectedDate && isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground' : ''}`}
                      >
                        <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
                        
                        {hasTasks && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            {highPriorityCount > 0 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-priority-high" />
                            )}
                            {mediumPriorityCount > 0 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-priority-medium" />
                            )}
                            {lowPriorityCount > 0 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-priority-low" />
                            )}
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    {hasTasks && (
                      <TooltipContent>
                        <div className="text-sm p-1">
                          <p className="font-bold mb-1">{format(day, 'MMMM d, yyyy')}</p>
                          <p>{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              },
            }}
          />
        </TooltipProvider>
      </div>
      
      <div className="flex-1">
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          
          {tasksForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {tasksForSelectedDate.map(task => (
                <div 
                  key={task.id}
                  className="border rounded-md p-3 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onTaskSelect(task)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge 
                      className={`${
                        task.priority === 'high' 
                          ? 'bg-priority-high' 
                          : task.priority === 'medium'
                          ? 'bg-priority-medium'
                          : 'bg-priority-low'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                  <div className="text-xs text-gray-400">
                    {format(new Date(task.dueDate), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCalendarView;
