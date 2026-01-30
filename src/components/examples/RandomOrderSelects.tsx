import { useState, useMemo } from 'react';
import './RandomOrderSelects.css';
import { Fireworks } from '../Fireworks';
import { isSpecialDate } from '../../utils/dateCheck';
import type { DateInputExampleProps } from '../../types';

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Example: Selects with random order of options
export const RandomOrderSelects = ({ onDateCorrect }: DateInputExampleProps) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const checkDate = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const dateStr = `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
      const isDateCorrect = isSpecialDate(dateStr);
      if (isDateCorrect && !isCorrect) {
        setShowFireworks(true);
        setIsCorrect(true);
        onDateCorrect?.(true);
      } else if (!isDateCorrect && isCorrect) {
        setIsCorrect(false);
        onDateCorrect?.(false);
      }
    } else if (isCorrect) {
      setIsCorrect(false);
      onDateCorrect?.(false);
    }
  };
  
  const handleDayChange = (value: string) => {
    setDay(value);
    checkDate(value, month, year);
  };
  
  const handleMonthChange = (value: string) => {
    setMonth(value);
    checkDate(day, value, year);
  };
  
  const handleYearChange = (value: string) => {
    setYear(value);
    checkDate(day, month, value);
  };

  // Generate random order arrays using useMemo to prevent re-shuffling on each render
  const randomDays = useMemo(() => {
    return shuffleArray(Array.from({ length: 31 }, (_, i) => i + 1));
  }, []);

  const randomMonths = useMemo(() => {
    return shuffleArray(Array.from({ length: 12 }, (_, i) => i + 1));
  }, []);

  const randomYears = useMemo(() => {
    return shuffleArray(Array.from({ length: 100 }, (_, i) => 2024 - i));
  }, []);

  return (
    <>
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}
      <div className="random-order-selects">
        <div className="selects-container">
        <div className="select-group">
          <label>День</label>
          <select value={day} onChange={(e) => handleDayChange(e.target.value)} className="select-field">
            <option value="">Выберите день</option>
            {randomDays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <label>Месяц</label>
          <select value={month} onChange={(e) => handleMonthChange(e.target.value)} className="select-field">
            <option value="">Выберите месяц</option>
            {randomMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <label>Год</label>
          <select value={year} onChange={(e) => handleYearChange(e.target.value)} className="select-field">
            <option value="">Выберите год</option>
            {randomYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
    </>
  );
};
