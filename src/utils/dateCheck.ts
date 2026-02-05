import { getTargetDigits, getTargetDigitsNoCentury } from '../config/targetDate';

// Normalize date string for comparison
export const normalizeDate = (date: string): string => date.replace(/\D/g, '');

// Check if date matches TARGET_DATE in various formats (digits-only compare)
export const isSpecialDate = (date: string): boolean => {
  const digits = normalizeDate(date);
  const target = getTargetDigits();
  const targetShort = getTargetDigitsNoCentury();

  if (digits === target) return true;
  if (targetShort && digits === targetShort) return true;
  return false;
};
