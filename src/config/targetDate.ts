export const TARGET_DATE = '05.02.1976';

export const getTargetDigits = (): string => TARGET_DATE.replace(/\D/g, '');

export const getTargetDigitsNoCentury = (): string | null => {
  const digits = getTargetDigits();
  // If target is DDMMYYYY (8 digits) -> allow DDMMYY as shorthand.
  if (digits.length === 8) return `${digits.slice(0, 4)}${digits.slice(6, 8)}`;
  return null;
};

export const getTargetDigitSlots = (): string[] => getTargetDigits().split('');

