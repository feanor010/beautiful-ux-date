import { useState, useRef, type KeyboardEvent } from 'react';
import './CharByCharInput.css';

// Example 1: Each character in separate input field
export const CharByCharInput = () => {
  const [date, setDate] = useState<string[]>(Array(10).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const format = 'DD.MM.YYYY';
  const positions = [0, 1, 3, 4, 6, 7, 8, 9]; // positions for digits (skip dots)

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newDate = [...date];
    newDate[index] = value;
    setDate(newDate);

    // Auto-focus next input
    if (value && index < positions.length - 1) {
      const nextIndex = positions[positions.indexOf(index) + 1];
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !date[index] && index > 0) {
      const prevIndex = positions[positions.indexOf(index) - 1];
      inputsRef.current[prevIndex]?.focus();
    }
  };

  return (
    <div className="char-by-char">
      <div className="char-inputs">
        {format.split('').map((char, index) => {
          if (char === '.') {
            return <span key={index} className="separator">{char}</span>;
          }
          return (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={date[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="char-input"
            />
          );
        })}
      </div>
    </div>
  );
};
