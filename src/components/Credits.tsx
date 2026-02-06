import { useEffect } from 'react';
import './Credits.css';

const CREDITS = [
  'спасибо огромное',
  'Никите за самые оригинальные идеи и их реализацию',
  'Артёму за поддержку всего проекта',
  'Егору за самый классный геймплей',
  'Гале за тестирование этого мракобесия',
];

type CreditsProps = {
  onClose: () => void;
};

export const Credits = ({ onClose }: CreditsProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="credits-step" onClick={onClose} role="presentation">
      <div className="credits-crawl-wrap">
        <div className="credits-crawl">
          {CREDITS.map((line, i) => (
            <p key={i} className={`credits-line ${i === 0 ? 'credits-line-title' : ''}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="credits-back"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        Назад
      </button>
    </div>
  );
};
