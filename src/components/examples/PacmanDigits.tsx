import { useEffect, useRef, useState, useCallback } from 'react';
import './PacmanDigits.css';
import { Fireworks } from '../Fireworks';
import type { DateInputExampleProps } from '../../types';
import pacmanUrl from '../../assets/pacman.png';
import { getCelebrationMessage } from '../../utils/celebrations';

type Position = { x: number; y: number };

const GRID = [
  '###############',
  '#.............#',
  '#.###.###.###.#',
  '#.............#',
  '#.###.#.#.###.#',
  '#.....#.#.....#',
  '###.#.###.#.###',
  '#.............#',
  '#.###.###.###.#',
  '#.............#',
  '###############',
];

const CELL_SIZE = 48;
const PLAYER_MOVE_TICKS = 1;
const TARGET_LENGTH = 8;

const isWall = (x: number, y: number) => GRID[y]?.[x] === '#';

const keyFromPos = (pos: Position) => `${pos.x},${pos.y}`;

const createPills = () => {
  const pills: Record<string, string> = {};
  const emptyCells: Position[] = [];
  for (let y = 0; y < GRID.length; y += 1) {
    for (let x = 0; x < GRID[0].length; x += 1) {
      if (!isWall(x, y)) {
        const key = `${x},${y}`;
        if (key !== '1,1' && key !== '13,9' && key !== '13,1') {
          emptyCells.push({ x, y });
        }
      }
    }
  }

  for (let i = emptyCells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }

  for (let i = 0; i < emptyCells.length; i += 1) {
    const cell = emptyCells[i];
    pills[keyFromPos(cell)] = String(Math.floor(Math.random() * 10));
  }

  return pills;
};

export const PacmanDigits = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Position>({ x: 1, y: 1 });
  const enemyRefs = useRef<Position[]>([
    { x: 13, y: 9 },
    { x: 13, y: 1 },
  ]);
  const directionRef = useRef<Position>({ x: 0, y: 0 });
  const pillsRef = useRef<Record<string, string>>(createPills());
  const collectedRef = useRef<string[]>([]);
  const isWinRef = useRef(false);
  const isCorrectRef = useRef(false);
  const enemyTickRef = useRef(0);
  const playerTickRef = useRef(0);
  const collectRequestedRef = useRef(false);
  const pressedKeysRef = useRef<Record<string, boolean>>({});
  const lastDirectionRef = useRef<Position>({ x: 1, y: 0 });
  const playerImageRef = useRef<HTMLImageElement | null>(null);

  const [collected, setCollected] = useState<string[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const resetProgress = useCallback(() => {
    collectedRef.current = [];
    setCollected([]);
    if (isCorrectRef.current) {
      isCorrectRef.current = false;
      onDateCorrect?.(false);
    }
  }, [onDateCorrect]);

  useEffect(() => {
    const img = new Image();
    img.src = pacmanUrl;
    playerImageRef.current = img;
  }, []);

  const initGame = useCallback(() => {
    isWinRef.current = false;
    playerRef.current = { x: 1, y: 1 };
    enemyRefs.current = [
      { x: 13, y: 9 },
      { x: 13, y: 1 },
    ];
    directionRef.current = { x: 0, y: 0 };
    pillsRef.current = createPills();
    enemyTickRef.current = 0;
    setGameOver(false);
    resetProgress();
  }, [resetProgress]);

  const moveIfPossible = (pos: Position, next: Position) => {
    if (!isWall(next.x, next.y)) {
      pos.x = next.x;
      pos.y = next.y;
    }
  };

  const updatePlayer = useCallback(() => {
    playerTickRef.current += 1;
    if (playerTickRef.current % PLAYER_MOVE_TICKS !== 0) return;
    const dir = directionRef.current;
    if (dir.x === 0 && dir.y === 0) return;
    const next = { x: playerRef.current.x + dir.x, y: playerRef.current.y + dir.y };
    moveIfPossible(playerRef.current, next);
  }, []);

  const updateEnemies = useCallback(() => {
    enemyTickRef.current += 1;
    if (enemyTickRef.current % 4 !== 0) return;
    const player = playerRef.current;
    enemyRefs.current.forEach((enemy) => {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

      const primary = Math.abs(dx) >= Math.abs(dy)
        ? { x: enemy.x + stepX, y: enemy.y }
        : { x: enemy.x, y: enemy.y + stepY };
      const secondary = Math.abs(dx) >= Math.abs(dy)
        ? { x: enemy.x, y: enemy.y + stepY }
        : { x: enemy.x + stepX, y: enemy.y };

      if (!isWall(primary.x, primary.y)) {
        enemy.x = primary.x;
        enemy.y = primary.y;
      } else if (!isWall(secondary.x, secondary.y)) {
        enemy.x = secondary.x;
        enemy.y = secondary.y;
      }
    });
  }, []);

  const checkCollisions = useCallback(() => {
    const player = playerRef.current;
    const hit = enemyRefs.current.some((enemy) => enemy.x === player.x && enemy.y === player.y);
    if (hit) {
      setGameOver(true);
    }
  }, []);

  const checkPills = useCallback(() => {
    if (!collectRequestedRef.current) return;
    collectRequestedRef.current = false;
    const key = keyFromPos(playerRef.current);
    const pill = pillsRef.current[key];
    if (!pill) return;

    delete pillsRef.current[key];
    const nextCollected = [...collectedRef.current, pill];
    collectedRef.current = nextCollected;
    setCollected(nextCollected);
    if (nextCollected.length === TARGET_LENGTH) {
      isWinRef.current = true;
      const dateStr = `${nextCollected[0]}${nextCollected[1]}.${nextCollected[2]}${nextCollected[3]}.${nextCollected[4]}${nextCollected[5]}${nextCollected[6]}${nextCollected[7]}`;
      onDateComplete?.(dateStr);
      const message = getCelebrationMessage(dateStr);
      if (message) {
        isCorrectRef.current = true;
        setCelebrationMessage(message);
        onDateCorrect?.(true);
        setShowFireworks(true);
      } else {
        isCorrectRef.current = false;
        setCelebrationMessage(null);
        onDateCorrect?.(false);
      }
    }
  }, [onDateCorrect]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID.length; y += 1) {
      for (let x = 0; x < GRID[0].length; x += 1) {
        if (isWall(x, y)) {
          ctx.fillStyle = '#2e2e2e';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    Object.entries(pillsRef.current).forEach(([key, value]) => {
      const [xStr, yStr] = key.split(',');
      const x = Number(xStr);
      const y = Number(yStr);
      const cx = x * CELL_SIZE + CELL_SIZE / 2;
      const cy = y * CELL_SIZE + CELL_SIZE / 2;
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, cx, cy);
    });

    const player = playerRef.current;
    const playerX = player.x * CELL_SIZE + CELL_SIZE / 2;
    const playerY = player.y * CELL_SIZE + CELL_SIZE / 2;
    const img = playerImageRef.current;

    if (img && img.complete) {
      const dir = directionRef.current.x !== 0 || directionRef.current.y !== 0
        ? directionRef.current
        : lastDirectionRef.current;
      ctx.save();
      ctx.translate(playerX, playerY);
      if (dir.x === 1 && dir.y === 0) {
        // Right
      } else if (dir.x === -1 && dir.y === 0) {
        // Left - mirror horizontally to keep eyes orientation
        ctx.scale(-1, 1);
      } else if (dir.x === 0 && dir.y === 1) {
        // Down
        ctx.rotate(Math.PI / 2);
      } else if (dir.x === 0 && dir.y === -1) {
        // Up
        ctx.rotate(-Math.PI / 2);
      }
      ctx.drawImage(img, -CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.fillStyle = '#6A5ACD';
      ctx.arc(playerX, playerY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    enemyRefs.current.forEach((enemy) => {
      ctx.beginPath();
      ctx.fillStyle = '#e32636';
      ctx.arc(
        enemy.x * CELL_SIZE + CELL_SIZE / 2,
        enemy.y * CELL_SIZE + CELL_SIZE / 2,
        10,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }, []);

  useEffect(() => {
    const setDirectionFromKeys = () => {
      const keys = pressedKeysRef.current;
      if (keys.ArrowUp) directionRef.current = { x: 0, y: -1 };
      else if (keys.ArrowDown) directionRef.current = { x: 0, y: 1 };
      else if (keys.ArrowLeft) directionRef.current = { x: -1, y: 0 };
      else if (keys.ArrowRight) directionRef.current = { x: 1, y: 0 };
      else directionRef.current = { x: 0, y: 0 };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        collectRequestedRef.current = true;
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        pressedKeysRef.current[e.key] = true;
        if (e.key === 'ArrowUp') lastDirectionRef.current = { x: 0, y: -1 };
        if (e.key === 'ArrowDown') lastDirectionRef.current = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft') lastDirectionRef.current = { x: -1, y: 0 };
        if (e.key === 'ArrowRight') lastDirectionRef.current = { x: 1, y: 0 };
        setDirectionFromKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        pressedKeysRef.current[e.key] = false;
        setDirectionFromKeys();
      }
    };

    const handleBlur = () => {
      pressedKeysRef.current = {};
      directionRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isWinRef.current) {
        draw();
        return;
      }
      if (gameOver) {
        draw();
        return;
      }
      updatePlayer();
      updateEnemies();
      checkCollisions();
      checkPills();
      draw();
    }, 120);
    return () => clearInterval(interval);
  }, [draw, gameOver, updatePlayer, updateEnemies, checkCollisions, checkPills]);

  const progressDisplay = [
    collected[0] ?? '_',
    collected[1] ?? '_',
    '.',
    collected[2] ?? '_',
    collected[3] ?? '_',
    '.',
    collected[4] ?? '_',
    collected[5] ?? '_',
    collected[6] ?? '_',
    collected[7] ?? '_',
  ].join(' ');

  return (
    <>
      {showFireworks && (
        <Fireworks
          message={celebrationMessage ?? 'Ура!'}
          onComplete={() => setShowFireworks(false)}
        />
      )}
      <div className="pacman-digits">
        <div className="progress-display">{progressDisplay}</div>
        <canvas
          ref={canvasRef}
          width={GRID[0].length * CELL_SIZE}
          height={GRID.length * CELL_SIZE}
          className="game-canvas"
        />
        <div className="hint-text">Нажмите пробел, чтобы подобрать цифру</div>
        <div className="hint-text">Движение на ←, →, ↑, ↓</div>
        {gameOver && (
          <div className="game-over">
            <div className="game-over-text">Гейм овер</div>
            <button className="restart-button" onClick={initGame}>
              Начать заново
            </button>
          </div>
        )}
      </div>
    </>
  );
};
