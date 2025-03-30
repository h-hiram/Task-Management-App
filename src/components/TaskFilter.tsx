
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Priority, Category, PRIORITY_LABELS, CATEGORY_LABELS } from '@/types/task';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, FilterX } from 'lucide-react';

const TaskFilter: React.FC = () => {
  const { 
    setFilterPriority, 
    setFilterCategory, 
    filterPriority, 
    filterCategory,
    searchQuery,
    setSearchQuery
  } = useTaskContext();

  const handleClearFilters = () => {
    setFilterPriority(null);
    setFilterCategory(null);
    setSearchQuery('');
  };

  const handlePriorityChange = (value: string) => {
    setFilterPriority(value === "all" ? null : value as Priority);
  };

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value === "all" ? null : value as Category);
  };

  return (
    <div className="glass-card p-4 rounded-md shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/70 backdrop-blur-sm border-white/40"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={filterPriority || 'all'} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[140px] bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem 
                  key={value} 
                  value={value}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px] bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem 
                  key={value} 
                  value={value}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleClearFilters}
            disabled={!filterPriority && !filterCategory && !searchQuery}
            title="Clear all filters"
            className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
