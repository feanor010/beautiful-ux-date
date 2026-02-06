// Types for date input examples
import type { ComponentType } from 'react';

export interface DateInputExampleProps {
  onDateCorrect?: (isCorrect: boolean) => void;
  onDateComplete?: (date: string) => void;
}

export interface DateInputExample {
  id: string;
  title: string;
  description: string;
  navLabel?: string;
  component: ComponentType<DateInputExampleProps>;
}

export interface DateValue {
  day: string;
  month: string;
  year: string;
}
