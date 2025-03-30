
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isToday, isSameMonth } from 'date-fns';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarHeader, CalendarHeading, Calendar, DayProps } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskCalendarViewProps {
  onDateSelect: (date: Date) => void;
  onTaskSelect: (task: Task) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onDateSelect, onTaskSelect }) => {
  const { tasks } = useTaskContext();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous and next month to fill the calendar
  const startDay = monthStart.getDay();
  const endDay = 6 - monthEnd.getDay();
  
  const previousMonthDays = startDay > 0 
    ? eachDayOfInterval({ 
        start: addDays(monthStart, -startDay), 
        end: addDays(monthStart, -1) 
      }) 
    : [];
  
  const nextMonthDays = endDay > 0 
    ? eachDayOfInterval({ 
        start: addDays(monthEnd, 1), 
        end: addDays(monthEnd, endDay) 
      }) 
    : [];
  
  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];
  
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
  };
  
  const renderDay = (props: any) => {
    const { date } = props;
    const tasksForDay = getTasksForDate(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    
    return (
      <div
        className={cn(
          "h-28 p-1 border border-gray-200 overflow-hidden",
          !isCurrentMonth && "bg-gray-50 text-gray-400",
          isToday(date) && "bg-blue-50 font-bold",
          "relative"
        )}
        onClick={() => onDateSelect(date)}
      >
        <div className="text-xs mb-1">{format(date, 'd')}</div>
        <div className="space-y-1 overflow-y-auto max-h-[80%]">
          {tasksForDay.map(task => (
            <div
              key={task.id}
              className={cn(
                "text-xs p-1 rounded truncate cursor-pointer",
                `bg-priority-${task.priority}`,
                `text-white`
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTaskSelect(task);
              }}
              title={task.title}
            >
              {task.title}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center text-sm font-medium border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {allDays.map((day, i) => (
          <div key={i} className="min-h-[100px]">
            {renderDay({ date: day })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCalendarView;
