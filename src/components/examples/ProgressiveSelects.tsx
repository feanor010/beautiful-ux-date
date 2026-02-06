import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import './ProgressiveSelects.css';
import { Fireworks } from '../Fireworks';
import { getCelebrationMessage } from '../../utils/celebrations';
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

export const ProgressiveSelects = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [stage, setStage] = useState<'day' | 'button' | 'month' | 'year'>('day');
  const [showFireworks, setShowFireworks] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(5);
  const [isCharging, setIsCharging] = useState(false);

  // Generate random order arrays
  const randomDays = useMemo(() => {
    return shuffleArray(Array.from({ length: 31 }, (_, i) => i + 1));
  }, []);

  const randomMonths = useMemo(() => {
    return shuffleArray(Array.from({ length: 12 }, (_, i) => i + 1));
  }, []);

  const randomYears = useMemo(() => {
    // Years from 1970 to 2005
    return shuffleArray(Array.from({ length: 36 }, (_, i) => 2005 - i));
  }, []);

  // Generate button positions (one green, rest red)
  const [buttonPositions, setButtonPositions] = useState(() => {
    const positions = Array.from({ length: 20 }, (_, i) => i);
    const greenIndex = Math.floor(Math.random() * positions.length);
    return { positions, greenIndex };
  });

  // Regenerate buttons when entering button stage
  useEffect(() => {
    if (stage === 'button') {
      const positions = Array.from({ length: 20 }, (_, i) => i);
      const greenIndex = Math.floor(Math.random() * positions.length);
      setButtonPositions({ positions, greenIndex });
    }
  }, [stage]);

  // Timer logic - runs on all stages
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0.1) {
          // Reset everything
          setDay('');
          setMonth('');
          setYear('');
          setStage('day');
          setTimer(5);
          setIsCorrect(false);
          onDateCorrect?.(false);
          return 5;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage, onDateCorrect]);

  // Charging logic - only on hold
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleChargeStart = useCallback(() => {
    setIsCharging(true);
    chargeIntervalRef.current = setInterval(() => {
      setTimer((prev) => Math.min(5, prev + 0.2));
    }, 100);
  }, []);

  const handleChargeEnd = useCallback(() => {
    setIsCharging(false);
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
  }, []);

  const handleDayChange = (value: string) => {
    setDay(value);
    setStage('button');
    // Don't reset timer - it continues
  };

  const handleButtonClick = (index: number) => {
    if (index === buttonPositions.greenIndex) {
      setStage('month');
      // Don't reset timer - it continues
    } else {
      // Wrong button - reset
      setDay('');
      setMonth('');
      setYear('');
      setStage('day');
      setTimer(5);
      setIsCorrect(false);
      onDateCorrect?.(false);
    }
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setStage('year');
    // Don't reset timer - it continues
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    // Don't reset timer - it continues
  };

  // Check date when all fields are filled
  useEffect(() => {
    if (day && month && year) {
      const dateStr = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
      onDateComplete?.(dateStr);
      const message = getCelebrationMessage(dateStr);
      if (message) {
        if (!isCorrect || celebrationMessage !== message) {
          setCelebrationMessage(message);
          setShowFireworks(true);
          setIsCorrect(true);
          onDateCorrect?.(true);
        }
      } else if (isCorrect) {
        setIsCorrect(false);
        setCelebrationMessage(null);
        onDateCorrect?.(false);
      }
    } else if (isCorrect) {
      setIsCorrect(false);
      setCelebrationMessage(null);
      onDateCorrect?.(false);
    }
  }, [day, month, year, isCorrect, onDateCorrect, celebrationMessage]);

  return (
    <>
      {showFireworks && (
        <Fireworks
          message={celebrationMessage ?? 'Ура!'}
          onComplete={() => setShowFireworks(false)}
        />
      )}
      <div className="progressive-selects">
        {/* Timer bar - always visible */}
        <div className="timer-container">
          <div className="timer-bar">
            <div 
              className="timer-fill" 
              style={{ width: `${(timer / 5) * 100}%` }}
            />
          </div>
          <button 
            onMouseDown={handleChargeStart}
            onMouseUp={handleChargeEnd}
            onMouseLeave={handleChargeEnd}
            onTouchStart={handleChargeStart}
            onTouchEnd={handleChargeEnd}
            className={`charge-button ${isCharging ? 'charging' : ''}`}
          >
            Зарядить
          </button>
        </div>

        {/* Day selection */}
        {stage === 'day' && (
          <div className="select-stage">
            <label>Выберите день</label>
            <select 
              value={day} 
              onChange={(e) => handleDayChange(e.target.value)} 
              className="select-field"
            >
              <option value="">Выберите день</option>
              {randomDays.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Button stage */}
        {stage === 'button' && (
          <div className="button-stage">
            <p className="button-instruction">Нажмите на зеленую кнопку!</p>
            <div className="buttons-grid">
              {buttonPositions.positions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index)}
                  className={`round-button ${index === buttonPositions.greenIndex ? 'green' : 'red'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Month selection */}
        {stage === 'month' && (
          <div className="select-stage">
            <label>Выберите месяц</label>
            <select 
              value={month} 
              onChange={(e) => handleMonthChange(e.target.value)} 
              className="select-field"
            >
              <option value="">Выберите месяц</option>
              {randomMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year selection */}
        {stage === 'year' && (
          <div className="select-stage">
            <label>Выберите год</label>
            <select 
              value={year} 
              onChange={(e) => handleYearChange(e.target.value)} 
              className="select-field"
            >
              <option value="">Выберите год</option>
              {randomYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};
