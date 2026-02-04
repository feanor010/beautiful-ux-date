import { celebrations } from '../config/celebrations';

const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/;

export const getCelebrationMessage = (date: string): string | null => {
  if (!DATE_RE.test(date)) return null;
  const found = celebrations.find((item) => item.date === date);
  return found ? found.message : null;
};
