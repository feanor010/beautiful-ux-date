import { useCallback, useEffect, useRef, useState } from 'react';
import './DateBreakout.css';
import { Fireworks } from '../Fireworks';
import { isSpecialDate } from '../../utils/dateCheck';
import { getCelebrationMessage } from '../../utils/celebrations';
import type { DateInputExampleProps } from '../../types';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 380;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 8;
const BLOCK_COLS = 10;
const BLOCK_ROWS = 3;
const BLOCK_WIDTH = GAME_WIDTH / BLOCK_COLS - 4;
const BLOCK_HEIGHT = 28;

// Target date 05.02.1976 → digits for blocks (shuffled per row)
const TARGET_DIGITS = ['0', '5', '0', '2', '1', '9', '7', '6'];

const shuffleDigits = (): string[] => {
  const arr = [...TARGET_DIGITS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const randomBallVelocity = (): { vx: number; vy: number } => {
  const angleDeg = -140 + Math.random() * 100;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    vx: BALL_SPEED * Math.cos(angleRad),
    vy: BALL_SPEED * Math.sin(angleRad),
  };
};

type PowerUpType = 'bigPaddle' | 'magnet' | 'slowBall';

interface Block {
  id: number;
  digit: string;
  x: number;
  y: number;
  alive: boolean;
}

interface FallingDigit {
  id: number;
  digit: string;
  x: number;
  y: number;
  vy: number;
}

interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
}

const BALL_SPEED = 5;
const PADDLE_SPEED = 10;
const FALL_SPEED = 3;
const POWERUP_DURATION_MS = 8000;

export const DateBreakout = ({ onDateCorrect }: DateInputExampleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [collectedDigits, setCollectedDigits] = useState<string[]>([]);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<number[]>(() => {
    try {
      const s = localStorage.getItem('dateBreakoutScores');
      return s ? JSON.parse(s) : [1250, 980, 750];
    } catch {
      return [1250, 980, 750];
    }
  });

  const stateRef = useRef({
    paddleX: (GAME_WIDTH - PADDLE_WIDTH) / 2,
    nextBlockId: 0,
    paddleWidth: PADDLE_WIDTH,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT - 80,
    ballVx: 0,
    ballVy: 0,
    blocks: [] as Block[],
    fallingDigits: [] as FallingDigit[],
    powerUps: [] as PowerUp[],
    collected: [] as string[],
    powerUpActive: null as { type: PowerUpType; until: number } | null,
    score: 0,
    nextFallingId: 0,
    nextPowerUpId: 0,
  });

  const keysRef = useRef({ left: false, right: false });
  const animationRef = useRef<number>(0);

  const initBlocks = useCallback((): Block[] => {
    const blocks: Block[] = [];
    let id = 0;
    for (let row = 0; row < BLOCK_ROWS; row++) {
      const rowDigits = shuffleDigits();
      for (let col = 0; col < BLOCK_COLS; col++) {
        blocks.push({
          id: id++,
          digit: rowDigits[col % rowDigits.length],
          x: col * (GAME_WIDTH / BLOCK_COLS) + 2,
          y: 24 + row * (BLOCK_HEIGHT + 4),
          alive: true,
        });
      }
    }
    return blocks;
  }, []);

  const spawnNewRow = useCallback((s: typeof stateRef.current) => {
    s.blocks = s.blocks.filter((b) => b.alive);
    const maxY = s.blocks.length
      ? Math.max(...s.blocks.map((b) => b.y))
      : -BLOCK_HEIGHT - 4;
    const newY = maxY + BLOCK_HEIGHT + 4;
    const rowDigits = shuffleDigits();
    for (let col = 0; col < BLOCK_COLS; col++) {
      s.blocks.push({
        id: s.nextBlockId++,
        digit: rowDigits[col % rowDigits.length],
        x: col * (GAME_WIDTH / BLOCK_COLS) + 2,
        y: newY,
        alive: true,
      });
    }
  }, []);

  const startGame = useCallback(() => {
    const blocks = initBlocks();
    const { vx, vy } = randomBallVelocity();
    stateRef.current = {
      paddleX: (GAME_WIDTH - PADDLE_WIDTH) / 2,
      paddleWidth: PADDLE_WIDTH,
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT - 80,
      ballVx: vx,
      ballVy: vy,
      blocks,
      fallingDigits: [],
      powerUps: [],
      collected: [],
      powerUpActive: null,
      score: 0,
      nextFallingId: 0,
      nextPowerUpId: 0,
      nextBlockId: blocks.length,
    };
    setCollectedDigits([]);
    setCelebrationMessage(null);
    setGameStarted(true);
    setGameOver(false);
    setWon(false);
    onDateCorrect?.(false);
  }, [initBlocks, onDateCorrect]);

  useEffect(() => {
    const handleLockChange = () => {
      if (
        document.pointerLockElement !== canvasRef.current &&
        gameStarted &&
        !gameOver &&
        !won
      ) {
        setGameStarted(false);
      }
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, [gameStarted, gameOver, won]);

  useEffect(() => {
    if (!gameStarted || gameOver || won) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPaddleWidth = () => {
      const { powerUpActive } = stateRef.current;
      if (powerUpActive?.type === 'bigPaddle' && Date.now() < powerUpActive.until) {
        return PADDLE_WIDTH * 1.6;
      }
      return PADDLE_WIDTH;
    };

    const getBallSpeed = () => {
      const { powerUpActive } = stateRef.current;
      if (powerUpActive?.type === 'slowBall' && Date.now() < powerUpActive.until) {
        return 0.5;
      }
      return 1;
    };

    const gameLoop = () => {
      const s = stateRef.current;
      s.paddleWidth = getPaddleWidth();
      const speedMult = getBallSpeed();

      // Paddle
      if (keysRef.current.left) s.paddleX = Math.max(0, s.paddleX - PADDLE_SPEED);
      if (keysRef.current.right) s.paddleX = Math.min(GAME_WIDTH - s.paddleWidth, s.paddleX + PADDLE_SPEED);

      // Ball
      s.ballX += s.ballVx * speedMult;
      s.ballY += s.ballVy * speedMult;

      // Walls
      if (s.ballX - BALL_RADIUS <= 0 || s.ballX + BALL_RADIUS >= GAME_WIDTH) s.ballVx *= -1;
      if (s.ballY - BALL_RADIUS <= 0) s.ballVy *= -1;
      if (s.ballY + BALL_RADIUS >= GAME_HEIGHT) {
        document.exitPointerLock();
        setGameOver(true);
        setGameStarted(false);
        return;
      }

      // Paddle bounce
      const paddleY = GAME_HEIGHT - PADDLE_HEIGHT - 20;
      if (
        s.ballY + BALL_RADIUS >= paddleY &&
        s.ballY - BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + s.paddleWidth
      ) {
        const hitPos = (s.ballX - s.paddleX) / s.paddleWidth;
        s.ballVy = -Math.abs(s.ballVy);
        s.ballVx = (hitPos - 0.5) * 2 * BALL_SPEED;
      }

      // Blocks
      s.blocks.forEach((b) => {
        if (!b.alive) return;
        const bx = b.x + BLOCK_WIDTH / 2;
        const by = b.y + BLOCK_HEIGHT / 2;
        const dx = Math.abs(s.ballX - bx);
        const dy = Math.abs(s.ballY - by);
        if (dx <= BLOCK_WIDTH / 2 + BALL_RADIUS && dy <= BLOCK_HEIGHT / 2 + BALL_RADIUS) {
          b.alive = false;
          s.ballVy *= -1;
          s.score += 100;
          s.fallingDigits.push({
            id: s.nextFallingId++,
            digit: b.digit,
            x: b.x + BLOCK_WIDTH / 2 - 12,
            y: b.y,
            vy: FALL_SPEED,
          });
          if (Math.random() < 0.25) {
            const types: PowerUpType[] = ['bigPaddle', 'magnet', 'slowBall'];
            s.powerUps.push({
              id: s.nextPowerUpId++,
              type: types[Math.floor(Math.random() * 3)],
              x: b.x + BLOCK_WIDTH / 2 - 12,
              y: b.y,
              vy: 2,
            });
          }
        }
      });

      // Falling digits
      const paddleLeft = s.paddleX;
      const paddleRight = s.paddleX + s.paddleWidth;
      const magnet = s.powerUpActive?.type === 'magnet' && Date.now() < (s.powerUpActive?.until ?? 0);

      const nextNeededDigit = s.collected.length < TARGET_DIGITS.length
        ? TARGET_DIGITS[s.collected.length]
        : null;

      s.fallingDigits = s.fallingDigits.filter((fd) => {
        fd.y += fd.vy;
        const paddleCenterX = s.paddleX + s.paddleWidth / 2;
        const digitCenterX = fd.x + 12;
        if (magnet && fd.y > GAME_HEIGHT / 2) {
          fd.x += (paddleCenterX - digitCenterX) * 0.03;
        } else if (nextNeededDigit && fd.digit === nextNeededDigit && fd.y > GAME_HEIGHT / 3) {
          fd.x += (paddleCenterX - digitCenterX) * 0.018;
        }
        if (fd.y >= paddleY - 10 && fd.y <= paddleY + PADDLE_HEIGHT + 20) {
          const fdCenter = fd.x + 12;
          if (fdCenter >= paddleLeft && fdCenter <= paddleRight) {
            const newCollected = [...s.collected, fd.digit];
            s.collected = newCollected;
            setCollectedDigits(newCollected);
            const dateStr = formatCollected(newCollected);
            if (dateStr.length >= 10 && isSpecialDate(dateStr)) {
              document.exitPointerLock();
              const newScore = s.score + 500;
              setLeaderboard((prev) => {
                const next = [...prev, newScore].sort((a, b) => b - a).slice(0, 5);
                try {
                  localStorage.setItem('dateBreakoutScores', JSON.stringify(next));
                } catch {}
                return next;
              });
              const message = getCelebrationMessage(dateStr);
              setCelebrationMessage(message);
              setWon(true);
              setShowFireworks(true);
              onDateCorrect?.(true);
            }
            return false;
          }
        }
        return fd.y < GAME_HEIGHT + 30;
      });

      // Power-ups
      s.powerUps = s.powerUps.filter((pu) => {
        pu.y += pu.vy;
        if (pu.y >= paddleY - 10 && pu.y <= paddleY + PADDLE_HEIGHT + 20) {
          const cx = pu.x + 12;
          if (cx >= paddleLeft && cx <= paddleRight) {
            s.powerUpActive = { type: pu.type, until: Date.now() + POWERUP_DURATION_MS };
            return false;
          }
        }
        return pu.y < GAME_HEIGHT + 30;
      });

      // Clear expired power-up
      if (s.powerUpActive && Date.now() >= s.powerUpActive.until) {
        s.powerUpActive = null;
      }

      // Если все блоки разбиты — появляется новый ряд с цифрами 05.02.1976
      if (s.blocks.every((b) => !b.alive)) {
        spawnNewRow(s);
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      s.blocks.forEach((b) => {
        if (!b.alive) return;
        const gradient = ctx.createLinearGradient(b.x, b.y, b.x + BLOCK_WIDTH, b.y + BLOCK_HEIGHT);
        gradient.addColorStop(0, '#4a69bd');
        gradient.addColorStop(1, '#1e3a5f');
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        roundRect(ctx, b.x, b.y, BLOCK_WIDTH, BLOCK_HEIGHT, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.digit, b.x + BLOCK_WIDTH / 2, b.y + BLOCK_HEIGHT / 2);
      });

      s.fallingDigits.forEach((fd) => {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(fd.digit, fd.x, fd.y);
        ctx.shadowBlur = 0;
      });

      s.powerUps.forEach((pu) => {
        const colors = { bigPaddle: '#4ade80', magnet: '#f59e0b', slowBall: '#60a5fa' };
        ctx.fillStyle = colors[pu.type];
        ctx.beginPath();
        ctx.arc(pu.x + 12, pu.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Paddle
      const paddleGrad = ctx.createLinearGradient(s.paddleX, 0, s.paddleX + s.paddleWidth, 0);
      paddleGrad.addColorStop(0, '#3b82f6');
      paddleGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = paddleGrad;
      roundRect(ctx, s.paddleX, paddleY, s.paddleWidth, PADDLE_HEIGHT, 7);
      ctx.fill();

      // Ball
      const ballGrad = ctx.createRadialGradient(
        s.ballX - 3, s.ballY - 3, 0,
        s.ballX, s.ballY, BALL_RADIUS
      );
      ballGrad.addColorStop(0, '#fff');
      ballGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    function roundRect(
      ctx: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number, r: number
    ) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameStarted, gameOver, won, onDateCorrect, spawnNewRow]);

  const formatCollected = (arr: string[]) => {
    const pad = (s: string, len: number) => (s + '_'.repeat(len)).slice(0, len);
    const d = pad(arr.slice(0, 2).join(''), 2);
    const m = pad(arr.slice(2, 4).join(''), 2);
    const y = pad(arr.slice(4, 8).join(''), 4);
    return `${d}.${m}.${y}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.exitPointerLock();
        return;
      }
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const displayDate = formatCollected(collectedDigits);
  const handleFireworksComplete = () => {
    setShowFireworks(false);
    setShowLeaderboard(true);
  };

  if (showFireworks) {
    return <Fireworks onComplete={handleFireworksComplete} message={celebrationMessage ?? 'Ура!'} />;
  }

  return (
    <div className="date-breakout">
      <h3 className="date-breakout-title">Введите дату рождения: разбейте блоки и ловите цифры</h3>
      <p className="date-breakout-desc">
        Управление: ← → или мышь. Курсор заперт в области игры до проигрыша или Esc. Power-up&apos;ы: большой паддл, магнит, замедление мяча.
      </p>

      <div className="date-breakout-status">
        Собрано: {displayDate}
      </div>

      {showLeaderboard && won && (
        <div className="date-breakout-leaderboard">
          <h4>Лидерборд</h4>
          <ol>
            {leaderboard.map((score, i) => (
              <li key={i}>{score}</li>
            ))}
          </ol>
          <button
            type="button"
            className="date-breakout-again"
            onClick={() => { setShowLeaderboard(false); startGame(); }}
          >
            Играть снова
          </button>
        </div>
      )}

      {!showLeaderboard && (
        <div className="date-breakout-area">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="date-breakout-canvas"
            style={{ cursor: gameStarted ? 'none' : 'pointer' }}
            onMouseMove={(e) => {
              if (!gameStarted) return;
              const canvas = e.currentTarget;
              const rect = canvas.getBoundingClientRect();
              const scale = GAME_WIDTH / rect.width;
              if (document.pointerLockElement === canvas) {
                const newX = stateRef.current.paddleX + e.movementX * scale;
                stateRef.current.paddleX = Math.max(
                  0,
                  Math.min(GAME_WIDTH - stateRef.current.paddleWidth, newX)
                );
              } else {
                const x = (e.clientX - rect.left) * scale;
                stateRef.current.paddleX = Math.max(
                  0,
                  Math.min(GAME_WIDTH - stateRef.current.paddleWidth, x - stateRef.current.paddleWidth / 2)
                );
              }
            }}
            onClick={(e) => {
              if (!gameStarted) {
                startGame();
                e.currentTarget.requestPointerLock();
              }
            }}
          />
          {!gameStarted && !gameOver && (
            <div className="date-breakout-start">Нажмите или кликните, чтобы начать</div>
          )}
          {gameOver && (
            <div className="date-breakout-over">
              Мячик упущен
              <button type="button" onClick={startGame}>Заново</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
