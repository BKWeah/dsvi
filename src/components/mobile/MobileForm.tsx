import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function MobileFormField({ label, children, required, className }: MobileFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

interface MobileFormProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function MobileForm({ 
  title, 
  description, 
  children, 
  onSubmit, 
  submitLabel = "Submit", 
  isSubmitting = false,
  className 
}: MobileFormProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Mobile-optimized input component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export function MobileInput({ label, required, ...props }: MobileInputProps) {
  return (
    <MobileFormField label={label} required={required}>
      <Input 
        {...props}
        className={cn("h-12 text-base", props.className)}
      />
    </MobileFormField>
  );
}

// Mobile-optimized textarea component
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
}

export function MobileTextarea({ label, required, ...props }: MobileTextareaProps) {
  return (
    <MobileFormField label={label} required={required}>
      <Textarea 
        {...props}
        className={cn("min-h-[100px] text-base", props.className)}
      />
    </MobileFormField>
  );
}
