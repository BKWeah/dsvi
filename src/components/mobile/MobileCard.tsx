import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    onClick?: () => void;
    href?: string;
  }>;
  className?: string;
  children?: React.ReactNode;
}

export function MobileCard({ 
  title, 
  subtitle, 
  status, 
  actions, 
  className, 
  children 
}: MobileCardProps) {
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {status && (
            <Badge variant={status.variant} className="text-xs ml-2">
              {status.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {children && (
        <CardContent className="pt-0 pb-3">
          {children}
        </CardContent>
      )}
      
      {actions && actions.length > 0 && (
        <CardContent className="pt-0 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              className="flex-1 min-w-0 text-xs"
              onClick={action.onClick}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
