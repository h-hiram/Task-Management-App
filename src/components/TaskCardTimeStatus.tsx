
import React from 'react';
import { Task } from '@/types/task';

interface TaskCardTimeStatusProps {
  task: Task;
}

const TaskCardTimeStatus: React.FC<TaskCardTimeStatusProps> = ({ task }) => {
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

  return getTimeStatus();
};

export default TaskCardTimeStatus;
