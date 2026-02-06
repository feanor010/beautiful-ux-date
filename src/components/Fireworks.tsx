import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './Fireworks.css';

interface FireworksProps {
  onComplete?: () => void;
  message?: string;
  variant?: 'full' | 'corner' | 'sides';
  showText?: boolean;
}

export const Fireworks = ({
  onComplete,
  message = 'Ура!',
  variant = 'full',
  showText = true,
}: FireworksProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const myConfetti = confetti.create(canvasRef.current, { resize: true, useWorker: true });
    const duration = 2500;
    const end = Date.now() + duration;

    const fire = (originX: number) => {
      myConfetti({
        particleCount: 40,
        spread: 60,
        startVelocity: 35,
        gravity: 0.8,
        origin: { x: originX, y: 0.5 },
      });
    };

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }
      if (variant === 'corner') {
        fire(0.85);
      } else if (variant === 'sides') {
        fire(0.15);
        fire(0.85);
      } else {
        fire(0.2);
        fire(0.8);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete, variant]);

  return (
    <div className={`fireworks-overlay ${variant}`}>
      {showText && (
        <div className="celebration-text">
          🎉 {message} 🎉
        </div>
      )}
      <canvas ref={canvasRef} className="fireworks-canvas" />
    </div>
  );
};