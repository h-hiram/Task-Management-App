
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskCard from './TaskCard';
import { Task } from '@/types/task';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { filteredTasks } = useTaskContext();

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-gray-500">No tasks found</h3>
        <p className="text-gray-400">Try adjusting your filters or add a new task</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEditTask} />
      ))}
    </div>
  );
};

export default TaskList;
