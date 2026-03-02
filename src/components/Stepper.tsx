import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => (
  <div className="flex items-center justify-between">
    {steps.map((step, index) => (
      <div key={step} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
            index < currentStep && 'border-stepper-complete bg-stepper-complete text-primary-foreground',
            index === currentStep && 'border-stepper-active bg-stepper-active text-primary-foreground',
            index > currentStep && 'border-stepper-inactive bg-card text-muted-foreground',
          )}>
            {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
          </div>
          <span className={cn(
            'mt-2 text-xs font-medium text-center max-w-[80px]',
            index <= currentStep ? 'text-foreground' : 'text-muted-foreground',
          )}>
            {step}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={cn(
            'mx-2 h-0.5 flex-1 transition-colors',
            index < currentStep ? 'bg-stepper-complete' : 'bg-stepper-inactive',
          )} />
        )}
      </div>
    ))}
  </div>
);
