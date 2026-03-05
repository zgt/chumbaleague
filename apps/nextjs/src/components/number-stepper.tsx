"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@acme/ui/button";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
}: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
      )}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <div className="bg-muted flex h-8 w-12 items-center justify-center rounded-md text-sm font-semibold tabular-nums">
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
