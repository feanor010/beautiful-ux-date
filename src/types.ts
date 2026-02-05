// Types for date input examples
import type { ComponentType } from 'react';

export interface DateInputExampleProps {
  onDateCorrect?: (isCorrect: boolean) => void;
}

export interface DateInputExample {
  id: string;
  title: string;
  description: string;
  component: ComponentType<DateInputExampleProps>;
}

export interface DateValue {
  day: string;
  month: string;
  year: string;
}
