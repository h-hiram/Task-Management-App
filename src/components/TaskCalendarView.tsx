
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import TaskCard from './TaskCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskCalendarViewProps {
  onDateSelect: (date: Date) => void;
  onTaskSelect: (task: Task) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onDateSelect, onTaskSelect }) => {
  const { filteredTasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  // Get tasks for the selected date
  const tasksForSelectedDate = selectedDate
    ? filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  // Get dates that have tasks
  const datesWithTasks = filteredTasks.map(task => {
    const date = new Date(task.dueDate);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-4 md:col-span-1 glass-card">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md"
          modifiers={{
            hasTasks: datesWithTasks,
          }}
          modifiersClassNames={{
            hasTasks: 'border-b-2 border-blue-500 font-medium',
          }}
        />
      </Card>

      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : 'Select a date'}
        </h3>
        
        {tasksForSelectedDate.length > 0 ? (
          <div className="space-y-4">
            {tasksForSelectedDate.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onTaskSelect} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center glass-card">
            <p className="text-gray-500">No tasks scheduled for this date</p>
            {!isMobile && (
              <p className="text-sm text-gray-400 mt-2">
                Select a different date or add a new task
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskCalendarView;
