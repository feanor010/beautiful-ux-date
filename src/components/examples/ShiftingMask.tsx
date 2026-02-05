import { useState, useEffect } from 'react';
import './ShiftingMask.css';
import { Fireworks } from '../Fireworks';
import { isSpecialDate } from '../../utils/dateCheck';
import type { DateInputExampleProps } from '../../types';

// Example 4: Input with constantly changing mask
export const ShiftingMask = ({ onDateCorrect }: DateInputExampleProps) => {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('DD.MM.YYYY');
  const [showFireworks, setShowFireworks] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const masks = [
    'DD.MM.YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    'MM.DD.YYYY',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMask = masks[Math.floor(Math.random() * masks.length)];
      setPlaceholder(randomMask);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Check if date matches the configured target date
    const isDateCorrect = isSpecialDate(newValue);
    if (isDateCorrect && !isCorrect) {
      setShowFireworks(true);
      setIsCorrect(true);
      onDateCorrect?.(true);
    } else if (!isDateCorrect && isCorrect) {
      setIsCorrect(false);
      onDateCorrect?.(false);
    }
  };

  return (
    <>
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}
      <div className="shifting-mask">
        <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="mask-input"
      />
      </div>
    </>
  );
};
