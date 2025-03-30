
import React from 'react';
import { Task, Priority, Category, PRIORITY_LABELS, CATEGORY_LABELS } from '@/types/task';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }).max(50, {
    message: 'Title must not exceed 50 characters.',
  }),
  description: z.string().max(200, {
    message: 'Description must not exceed 200 characters.',
  }).optional(),
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
  dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Please enter a valid time in 24-hour format (HH:MM).',
  }),
  priority: z.enum(['high', 'medium', 'low'] as const),
  category: z.enum(['pending', 'completed', 'deferred', 'deployed'] as const),
});

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Task;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onCancel }) => {
  // Parse initialData for the form
  const defaultValues = initialData
    ? {
        title: initialData.title,
        description: initialData.description,
        dueDate: new Date(initialData.dueDate),
        dueTime: format(new Date(initialData.dueDate), 'HH:mm'),
        priority: initialData.priority,
        category: initialData.category,
      }
    : {
        title: '',
        description: '',
        dueDate: new Date(),
        dueTime: format(new Date(), 'HH:mm'),
        priority: 'medium' as Priority,
        category: 'pending' as Category,
      };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const handleSubmit = (values: z.infer<typeof FormSchema>) => {
    // Combine date and time
    const [hours, minutes] = values.dueTime.split(':').map(Number);
    const dueDate = new Date(values.dueDate);
    dueDate.setHours(hours, minutes);

    // Submit the form data
    onSubmit({
      title: values.title,
      description: values.description || '',
      dueDate,
      priority: values.priority,
      category: values.category,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Task description"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Due Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem 
                        key={value} 
                        value={value}
                        className={cn(
                          value === 'high' && "text-priority-high",
                          value === 'medium' && "text-priority-medium",
                          value === 'low' && "text-priority-low"
                        )}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem 
                        key={value} 
                        value={value} 
                        className={cn(
                          value === 'pending' && "text-category-pending",
                          value === 'completed' && "text-category-completed",
                          value === 'deferred' && "text-category-deferred",
                          value === 'deployed' && "text-category-deployed"
                        )}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
