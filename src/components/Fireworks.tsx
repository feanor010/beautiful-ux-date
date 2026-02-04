import { useEffect, useState } from 'react';
import './Fireworks.css';

interface FireworksProps {
  onComplete?: () => void;
  message?: string;
}

export const Fireworks = ({ onComplete, message = 'Ура!' }: FireworksProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    // Create multiple fireworks
    const newParticles: Array<{ id: number; x: number; y: number; color: string; delay: number }> = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
      });
    }
    
    setParticles(newParticles);
    
    // Set CSS variables for random particles
    newParticles.forEach((particle, index) => {
      if (index >= 8) {
        const element = document.documentElement;
        element.style.setProperty(`--random-x-${index}`, String(particle.x));
        element.style.setProperty(`--random-y-${index}`, String(particle.y));
      }
    });

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fireworks-overlay">
      <div className="celebration-text">🎉 {message} 🎉</div>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="firework-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
