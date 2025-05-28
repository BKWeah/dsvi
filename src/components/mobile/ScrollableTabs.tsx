import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ScrollableTabsProps {
  defaultValue: string;
  tabs: Array<{
    value: string;
    label: string;
    content?: React.ReactNode;
  }>;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function ScrollableTabs({ defaultValue, tabs, className, onValueChange }: ScrollableTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className={cn("w-full", className)}>
      <div className="relative">
        {/* Scrollable tabs list */}
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="flex w-max min-w-full h-12 bg-muted/50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-shrink-0 px-6 py-2.5 text-sm font-medium",
                  "whitespace-nowrap min-w-[100px]",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "transition-all duration-200"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>        
        {/* Gradient fade effects */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}