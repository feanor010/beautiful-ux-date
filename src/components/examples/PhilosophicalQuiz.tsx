import { useState } from 'react';
import './PhilosophicalQuiz.css';
import { Fireworks } from '../Fireworks';
import { getCelebrationMessage } from '../../utils/celebrations';
import type { DateInputExampleProps } from '../../types';

const QUESTIONS = [
  'Когда открылась компания 7битс?',
  'Кто был первым сотрудником принятым на работу?',
  'Да?',
  'Когда Маша придёт в офис к 10?',
  'Почему кошки смотрят в пустоту?',
];

const formatDateForCelebration = (date: string): string => {
  const digits = date.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
  }
  if (digits.length === 6) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.19${digits.slice(4, 6)}`;
  }
  return date;
};

export const PhilosophicalQuiz = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => QUESTIONS.map(() => ''));
  const [date, setDate] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const isDateStep = step >= QUESTIONS.length;

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
  };

  const handleSubmitDate = () => {
    const formatted = formatDateForCelebration(date);
    if (formatted) onDateComplete?.(formatted);
    const message = getCelebrationMessage(formatted);
    if (!message) return;
    setCelebrationMessage(message);
    setShowFireworks(true);
    onDateCorrect?.(true);
  };

  return (
    <>
      {showFireworks && (
        <Fireworks
          message={celebrationMessage ?? 'Ура!'}
          onComplete={() => setShowFireworks(false)}
        />
      )}

      <div className="philosophical-quiz">
        {!isDateStep ? (
          <>
            <div className="philosophical-question">
              <h2>{QUESTIONS[step]}</h2>
              <input
                type="text"
                className="philosophical-answer-input"
                placeholder="Ваш ответ..."
                value={answers[step]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            <button className="philosophical-next" onClick={handleNext}>
              Дальше
            </button>
          </>
        ) : (
          <div className="philosophical-date-step">
            <h2>Когда Вы родились?</h2>
            <div className="philosophical-date-input-zone">
              <input
                type="text"
                className="philosophical-field"
                placeholder="ДД.ММ.ГГГГ"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitDate()}
              />
              <button
                className="philosophical-submit"
                onClick={handleSubmitDate}
                disabled={!date.trim()}
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
