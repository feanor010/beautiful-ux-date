import { useState, useEffect } from 'react';
import './RestrictedCalendar.css';
import { Fireworks } from '../Fireworks';
import type { DateInputExampleProps } from '../../types';
import { getTargetDigitSlots } from '../../config/targetDate';

// Example 5: Calendar with only specific days available
export const RestrictedCalendar = ({ onDateCorrect }: DateInputExampleProps) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // For this component, we only select day.
  // Mark correct if chosen day matches the target day.
  useEffect(() => {
    const digits = getTargetDigitSlots();
    const targetDay = digits.length >= 2 ? `${digits[0]}${digits[1]}` : null;
    const isDateCorrect =
      !!targetDay &&
      (selectedDate === targetDay || selectedDate === String(Number(targetDay)));
    if (isDateCorrect && !isCorrect) {
      setShowFireworks(true);
      setIsCorrect(true);
      onDateCorrect?.(true);
    } else if (!isDateCorrect && isCorrect) {
      setIsCorrect(false);
      onDateCorrect?.(false);
    }
  }, [selectedDate, isCorrect, onDateCorrect]);
  
  // Only allow dates that are prime numbers
  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const availableDays = days.filter(day => isPrime(day));

  return (
    <>
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}
      <div className="restricted-calendar">
        <div className="calendar-grid">
        {days.map((day) => {
          const isAvailable = availableDays.includes(day);
          const isSelected = selectedDate === day.toString();
          
          return (
            <button
              key={day}
              onClick={() => isAvailable && setSelectedDate(day.toString())}
              disabled={!isAvailable}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
            >
              {day}
            </button>
          );
        })}
        </div>
      </div>
    </>
  );
};
