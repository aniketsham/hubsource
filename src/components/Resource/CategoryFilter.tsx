import React from 'react';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const CATEGORIES = [
  'All', 'Tech', 'AI', 'Courses', 'News', 'Tools', 'Design', 'Career', 'Other'
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 py-4 pr-4">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selected === category ? "default" : "outline"}
              size="sm"
              className="rounded-full px-6 h-10 shadow-neo font-black uppercase tracking-widest text-[10px]"
              onClick={() => onSelect(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
};
