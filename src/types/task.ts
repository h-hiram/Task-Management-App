
export type Priority = 'high' | 'medium' | 'low';
export type Category = 'pending' | 'completed' | 'deferred' | 'deployed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  pending: 'Pending',
  completed: 'Completed',
  deferred: 'Deferred',
  deployed: 'Deployed',
};
