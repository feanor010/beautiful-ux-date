import { useCallback, useRef, useState } from 'react';
import './LockedSlotsDateInput.css';
import { Fireworks } from '../Fireworks';
import { getCelebrationMessage } from '../../utils/celebrations';
import { getTargetDigitSlots } from '../../config/targetDate';
import type { DateInputExampleProps } from '../../types';

const DIGIT_COUNT = 8; // DDMMYYYY (without separators)
const TARGET_DIGITS = getTargetDigitSlots();

const isSpecialDigits = (digits: string[]) =>
  digits.length === DIGIT_COUNT && digits.every((d, i) => d === TARGET_DIGITS[i]);

const randomDigit = () => String(Math.floor(Math.random() * 10));

const buildDateString = (digits: string[]) => {
  const safe = (i: number) => digits[i] ?? '';
  return `${safe(0)}${safe(1)}.${safe(2)}${safe(3)}.${safe(4)}${safe(5)}${safe(6)}${safe(7)}`;
};

export const LockedSlotsDateInput = ({ onDateCorrect }: DateInputExampleProps) => {
  const [digits, setDigits] = useState<string[]>(() => Array(DIGIT_COUNT).fill(''));
  const [locked, setLocked] = useState<boolean[]>(() => Array(DIGIT_COUNT).fill(false));
  const [showFireworks, setShowFireworks] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const lastMatchRef = useRef(false);
  const lastMessageRef = useRef<string | null>(null);

  const evaluateAndNotify = useCallback(
    (nextDigits: string[], nextLocked: boolean[]) => {
      const allLocked = nextLocked.every(Boolean);
      const filled = nextDigits.every((d) => d.length === 1);
      if (!filled || !allLocked) {
        if (lastMatchRef.current) {
          lastMatchRef.current = false;
          lastMessageRef.current = null;
          setCelebrationMessage(null);
          onDateCorrect?.(false);
        }
        return;
      }
      const dateStr = buildDateString(nextDigits);
      const message = getCelebrationMessage(dateStr);
      const match = !!message;
      if (lastMatchRef.current === match && (match ? lastMessageRef.current === message : true)) return;
      lastMatchRef.current = match;
      lastMessageRef.current = message;
      if (match) {
        setCelebrationMessage(message);
        setShowFireworks(true);
        onDateCorrect?.(true);
      } else {
        setCelebrationMessage(null);
        onDateCorrect?.(false);
      }
    },
    [onDateCorrect],
  );

  const toggleLock = useCallback(
    (index: number) => {
      const nextLocked = [...locked];
      nextLocked[index] = !nextLocked[index];
      setLocked(nextLocked);
      evaluateAndNotify(digits, nextLocked);
    },
    [digits, evaluateAndNotify, locked],
  );

  const handleRandomize = useCallback(() => {
    const unlockedIndices: number[] = [];
    for (let i = 0; i < DIGIT_COUNT; i += 1) {
      if (!locked[i]) unlockedIndices.push(i);
    }

    const tries = 50;
    let nextDigits = [...digits];
    for (let attempt = 0; attempt < tries; attempt += 1) {
      const next = [...digits];
      for (let i = 0; i < DIGIT_COUNT; i += 1) {
        if (locked[i]) continue;
        next[i] = randomDigit();
      }

      // Guard: never randomly generate the target date digits.
      if (!isSpecialDigits(next)) {
        nextDigits = next;
        break;
      }

      // If all slots are locked and already equal target, we can't change it.
      if (unlockedIndices.length === 0) {
        nextDigits = next;
        break;
      }
    }

    setDigits(nextDigits);
    evaluateAndNotify(nextDigits, locked);
  }, [digits, evaluateAndNotify, locked]);

  const handleReset = useCallback(() => {
    setDigits(Array(DIGIT_COUNT).fill(''));
    setLocked(Array(DIGIT_COUNT).fill(false));
    lastMatchRef.current = false;
    lastMessageRef.current = null;
    setCelebrationMessage(null);
    onDateCorrect?.(false);
  }, [onDateCorrect]);

  const renderDigit = (i: number) => {
    const isLocked = locked[i];
    const lockLabel = isLocked ? 'Разблокировать слот' : 'Заблокировать слот';
    const value = digits[i] || ' ';

    return (
      <div key={i} className="lsdi-slot">
        <div
          className={`lsdi-input ${isLocked ? 'locked' : ''}`}
          aria-label={`Цифра ${i + 1} даты рождения`}
          aria-readonly="true"
          role="textbox"
        >
          {value}
        </div>

        <button
          type="button"
          className={`lsdi-lock ${isLocked ? 'locked' : ''}`}
          onClick={() => toggleLock(i)}
          aria-pressed={isLocked}
          aria-label={lockLabel}
          title={lockLabel}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>
    );
  };

  return (
    <>
      {showFireworks && (
        <Fireworks
          message={celebrationMessage ?? 'Ура!'}
          onComplete={() => setShowFireworks(false)}
        />
      )}
      <div className="locked-slots-date-input">
        <div className="lsdi-top">
          <div className="lsdi-actions">
            <button type="button" className="lsdi-random" onClick={handleRandomize}>
              Перемешать
            </button>
            <button type="button" className="lsdi-reset" onClick={handleReset}>
              Сбросить
            </button>
          </div>
        </div>

        <div className="lsdi-slots" role="group" aria-label="Дата рождения (ДД.ММ.ГГГГ)">
          {renderDigit(0)}
          {renderDigit(1)}
          <span className="lsdi-sep" aria-hidden="true">
            .
          </span>
          {renderDigit(2)}
          {renderDigit(3)}
          <span className="lsdi-sep" aria-hidden="true">
            .
          </span>
          {renderDigit(4)}
          {renderDigit(5)}
          {renderDigit(6)}
          {renderDigit(7)}
        </div>
      </div>
    </>
  );
};

