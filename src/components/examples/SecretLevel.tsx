import { useEffect, useState } from 'react';
import './SecretLevel.css';
import annieImg from '../../assets/annie.jpg';
import { secretLevel } from '../../config/secretLevel';
import { Fireworks } from '../Fireworks';

export const SecretLevel = () => {
  const [showFireworks, setShowFireworks] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFireworks(true);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="secret-level">
      {showFireworks && (
        <Fireworks
          message={secretLevel.title}
          variant="sides"
          showText={false}
          onComplete={() => setShowFireworks(false)}
        />
      )}
      <div className="secret-stars" aria-hidden="true" />
      <div className="secret-card">
        <div className="secret-image-wrap">
          <img src={annieImg} alt="Annie" className="secret-image" />
          <div className="secret-confetti" aria-hidden="true" />
        </div>
        <div className="secret-text">
          <h2>{secretLevel.title}</h2>
          <p>{secretLevel.text}</p>
        </div>
      </div>
    </div>
  );
};
