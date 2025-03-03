
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: { title: string; description: string }[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex justify-between mb-4">
      {steps.map((_, index) => (
        <div 
          key={index}
          className={cn(
            "w-full h-1 rounded-full transition-all duration-300",
            index < currentStep ? "bg-primary" : index === currentStep ? "bg-primary/40" : "bg-muted"
          )}
          style={{ marginRight: index < steps.length - 1 ? '4px' : 0 }}
        />
      ))}
    </div>
  );
};

export default StepIndicator;
