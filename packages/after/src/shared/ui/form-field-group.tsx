import * as React from 'react';
import { Label } from '@/shared/ui/label';

interface FormFieldGroupProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  label,
  children,
  required,
}) => (
  <div className="space-y-2 mb-4">
    <Label>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);
