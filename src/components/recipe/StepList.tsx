import { RecipeStep } from "@/lib/types";
import { ImageIcon } from "lucide-react";

interface StepListProps {
  steps: RecipeStep[];
}

export default function StepList({ steps }: StepListProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          {/* Step number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tea-100 dark:bg-tea-800 flex items-center justify-center text-sm font-semibold text-tea-700 dark:text-tea-400">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-2">{step.title || `步骤 ${index + 1}`}</h4>
            <p className="text-sm text-foreground/70 leading-relaxed">{step.description}</p>

            {/* Step image */}
            {step.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt={step.title || `步骤 ${index + 1}`}
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            )}

            {/* Image placeholder */}
            {!step.image && (
              <div className="mt-3 step-placeholder rounded-lg h-24 flex items-center justify-center max-w-md">
                <ImageIcon className="h-6 w-6 text-tea-400 dark:text-tea-600" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
