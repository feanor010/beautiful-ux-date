import { useEffect, useState } from 'react';
import './Fireworks.css';

interface FireworksProps {
  onComplete?: () => void;
  message?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  delay: number;
}

export const Fireworks = ({ onComplete, message = 'Ура!' }: FireworksProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 300;

      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
      <div className="fireworks-overlay">
        <div className="celebration-text">
          🎉 {message} 🎉
        </div>
        {particles.map((p) => (
            <div
                key={p.id}
                className="firework-particle animate"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
                  animationDelay: `${p.delay}s`,
                  // @ts-ignore
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                }}
            />
        ))}
      </div>
  );
};