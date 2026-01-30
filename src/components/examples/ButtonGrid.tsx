import { useState, useCallback } from 'react';
import './ButtonGrid.css';
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

// Generate two-digit numbers with 33% chance to include 05, 02, 19, 76
const generateNumbers = (): string[] => {
  const shouldUseSpecial = Math.random() < 0.33;
  
  if (shouldUseSpecial) {
    // Use special numbers: 05, 02, 19, 76
    const specialNumbers = ['05', '02', '19', '76'];
    const otherNumbers = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
      .filter(n => !specialNumbers.includes(n));
    const allNumbers = [...specialNumbers, ...otherNumbers];
    return shuffleArray(allNumbers);
  } else {
    // Regular shuffle of two-digit numbers
    return shuffleArray(Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')));
  }
};

export const ButtonGrid = ({ onDateCorrect }: DateInputExampleProps) => {
  const [date, setDate] = useState<string>('__.__.____');
  const [numbers, setNumbers] = useState<string[]>(() => generateNumbers());
  const [showFireworks, setShowFireworks] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleClick = (num: string) => {
    const newDate = date.split('');

    // Check day (positions 0-1)
    if (newDate[0] === '_' || newDate[1] === '_') {
      newDate[0] = num[0];
      newDate[1] = num[1];
    }
    // Check month (positions 3-4)
    else if (newDate[3] === '_' || newDate[4] === '_') {
      newDate[3] = num[0];
      newDate[4] = num[1];
    }
    // Check year (positions 6-9)
    else if (newDate[6] === '_' || newDate[7] === '_') {
      // First two digits of year
      newDate[6] = num[0];
      newDate[7] = num[1];
    }
    else if (newDate[8] === '_' || newDate[9] === '_') {
      // Last two digits of year
      newDate[8] = num[0];
      newDate[9] = num[1];
    }

    const finalDate = newDate.join('');
    setDate(finalDate);
    
    // Check if date matches 05.02.1976
    const isDateCorrect = isSpecialDate(finalDate);
    if (isDateCorrect && !isCorrect) {
      setShowFireworks(true);
      setIsCorrect(true);
      onDateCorrect?.(true);
    }
  };

  const handleReshuffle = useCallback(() => {
    setNumbers(generateNumbers());
    // Don't reset date - keep what's already entered
  }, []);

  const handleReset = useCallback(() => {
    setDate('__.__.____');
    setIsCorrect(false);
    onDateCorrect?.(false);
  }, [onDateCorrect]);

  return (
    <>
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}
      <div className="button-grid">
        <div className="date-display">
        {date.split('').map((char, index) => (
          <span key={index} className={char === '_' ? 'placeholder' : 'filled'}>
            {char}
          </span>
        ))}
      </div>
      <div className="grid">
        {numbers.map((num, index) => (
          <button
            key={`${num}-${index}`}
            onClick={() => handleClick(num)}
            className="grid-button"
          >
            {num}
          </button>
        ))}
      </div>
      <div className="buttons-container">
        <button onClick={handleReshuffle} className="reshuffle-button">
          Перемешать
        </button>
        <button onClick={handleReset} className="reset-button">
          Сбросить
        </button>
      </div>
      </div>
    </>
  );
};
