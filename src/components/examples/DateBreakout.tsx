import { useCallback, useEffect, useRef, useState } from 'react';
import './DateBreakout.css';
import { Fireworks } from '../Fireworks';
import { getCelebrationMessage } from '../../utils/celebrations';
import type { DateInputExampleProps } from '../../types';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 8;
const BLOCK_COLS = 10;
const BLOCK_ROWS = 3;
const BLOCK_WIDTH = GAME_WIDTH / BLOCK_COLS - 4;
const BLOCK_HEIGHT = 28;

// Blocks contain random digits from 0 to 9

const getRandomDigits = (count: number): string[] => {
  // Гарантируем наличие всех цифр от 0 до 9
  const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const digits: string[] = [...allDigits];
  
  // Если нужно больше цифр, добавляем случайные
  while (digits.length < count) {
    digits.push(Math.floor(Math.random() * 10).toString());
  }
  
  // Перемешиваем массив
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  
  // Возвращаем только нужное количество
  return digits.slice(0, count);
};

const randomBallVelocity = (): { vx: number; vy: number } => {
  const angleDeg = -140 + Math.random() * 100;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    vx: BALL_SPEED * Math.cos(angleRad),
    vy: BALL_SPEED * Math.sin(angleRad),
  };
};

interface Block {
  id: number;
  digit: string;
  x: number;
  y: number;
  alive: boolean;
  spawnTime: number;
  targetY: number;
}

interface FallingDigit {
  id: number;
  digit: string;
  x: number;
  y: number;
  vy: number;
}

const BALL_SPEED = 5;
const PADDLE_SPEED = 10;
const FALL_SPEED = 2.5;

export const DateBreakout = ({ onDateCorrect }: DateInputExampleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [collectedDigits, setCollectedDigits] = useState<string[]>([]);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [lives, setLives] = useState(9);
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
    collected: [] as string[],
    score: 0,
    nextFallingId: 0,
    lastBlockRespawn: Date.now(),
    gameWon: false,
    gameLost: false,
  });

  const keysRef = useRef({ left: false, right: false });
  const animationRef = useRef<number>(0);

  const initBlocks = useCallback((): Block[] => {
    const blocks: Block[] = [];
    let id = 0;
    const now = Date.now();
    for (let row = 0; row < BLOCK_ROWS; row++) {
      const rowDigits = getRandomDigits(BLOCK_COLS);
      for (let col = 0; col < BLOCK_COLS; col++) {
        const targetY = 24 + row * (BLOCK_HEIGHT + 4);
        blocks.push({
          id: id++,
          digit: rowDigits[col],
          x: col * (GAME_WIDTH / BLOCK_COLS) + 2,
          y: targetY + 50, // Начинаем ниже для анимации
          alive: true,
          spawnTime: now + (row * 50) + (col * 10), // Задержка для каскадного эффекта
          targetY: targetY,
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
    const rowDigits = getRandomDigits(BLOCK_COLS);
    const now = Date.now();
    for (let col = 0; col < BLOCK_COLS; col++) {
      s.blocks.push({
        id: s.nextBlockId++,
        digit: rowDigits[col],
        x: col * (GAME_WIDTH / BLOCK_COLS) + 2,
        y: newY + 50, // Начинаем ниже для анимации
        alive: true,
        spawnTime: now + (col * 10), // Задержка для каскадного эффекта
        targetY: newY,
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
      collected: [],
      score: 0,
      nextFallingId: 0,
      nextBlockId: blocks.length,
      lastBlockRespawn: Date.now(),
      gameWon: false,
      gameLost: false,
    };
    setCollectedDigits([]);
    setCelebrationMessage(null);
    setLives(9);
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
    // Проверяем только gameStarted и gameOver, won проверяем через s.gameWon в gameLoop
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const s = stateRef.current;
      
      // Проверяем, не завершена ли игра победой или проигрышем
      // Используем только флаги из ref, так как состояния React обновляются асинхронно
      if (s.gameWon || s.gameLost) {
        console.log('[DateBreakout] gameLoop: игра завершена, s.gameWon:', s.gameWon, 's.gameLost:', s.gameLost);
        cancelAnimationFrame(animationRef.current);
        return;
      }
      
      s.paddleWidth = PADDLE_WIDTH;

      // Paddle
      if (keysRef.current.left) s.paddleX = Math.max(0, s.paddleX - PADDLE_SPEED);
      if (keysRef.current.right) s.paddleX = Math.min(GAME_WIDTH - s.paddleWidth, s.paddleX + PADDLE_SPEED);

      // Ball
      s.ballX += s.ballVx;
      s.ballY += s.ballVy;

      // Walls
      if (s.ballX - BALL_RADIUS <= 0 || s.ballX + BALL_RADIUS >= GAME_WIDTH) s.ballVx *= -1;
      if (s.ballY - BALL_RADIUS <= 0) s.ballVy *= -1;
      if (s.ballY + BALL_RADIUS >= GAME_HEIGHT) {
        // Потеря жизни
        setLives((prevLives) => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            // Поражение - жизни закончились
            s.gameLost = true; // Устанавливаем синхронно в ref
            document.exitPointerLock();
            setGameOver(true);
            setGameStarted(false);
            cancelAnimationFrame(animationRef.current);
            return 0;
          } else {
            // Перезапуск мяча
            const { vx, vy } = randomBallVelocity();
            s.ballX = GAME_WIDTH / 2;
            s.ballY = GAME_HEIGHT - 80;
            s.ballVx = vx;
            s.ballVy = vy;
            s.paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
            return newLives;
          }
        });
        
        // Если игра завершена, выходим из gameLoop немедленно
        if (s.gameLost) {
          return;
        }
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

      // Blocks - проверка коллизий (используем targetY для точности)
      s.blocks.forEach((b) => {
        if (!b.alive) return;
        const blockY = b.y === b.targetY ? b.y : b.targetY; // Используем целевую позицию для коллизий
        const bx = b.x + BLOCK_WIDTH / 2;
        const by = blockY + BLOCK_HEIGHT / 2;
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
        }
      });

      // Falling digits
      const paddleLeft = s.paddleX;
      const paddleRight = s.paddleX + s.paddleWidth;

      s.fallingDigits = s.fallingDigits.filter((fd) => {
        fd.y += fd.vy;
        if (fd.y >= paddleY - 10 && fd.y <= paddleY + PADDLE_HEIGHT + 20) {
          const fdCenter = fd.x + 12;
          if (fdCenter >= paddleLeft && fdCenter <= paddleRight) {
            const newCollected = [...s.collected, fd.digit];
            s.collected = newCollected;
            setCollectedDigits(newCollected);
            // Проверяем дату только если собрано ровно 8 цифр (полная дата)
            if (newCollected.length === 8) {
              const dateStr = formatCollected(newCollected);
              console.log('[DateBreakout] Проверка полной даты:', dateStr, 'Собрано цифр:', newCollected.length, 'Цифры:', newCollected);
              const message = getCelebrationMessage(dateStr);
              console.log('[DateBreakout] Результат проверки:', message ? 'ПРАВИЛЬНАЯ ДАТА' : 'НЕПРАВИЛЬНАЯ ДАТА', 'message:', message);
              
              if (message) {
                // Правильная дата - победа!
                console.log('[DateBreakout] ПОБЕДА! Устанавливаем s.gameWon = true');
                s.gameWon = true; // Устанавливаем флаг в ref для немедленной остановки цикла
                document.exitPointerLock();
                const finalScore = s.score + 500;
                setLeaderboard((prev) => {
                  const next = [...prev, finalScore].sort((a, b) => b - a).slice(0, 5);
                  try {
                    localStorage.setItem('dateBreakoutScores', JSON.stringify(next));
                  } catch {
                    // Игнорируем ошибки localStorage
                  }
                  return next;
                });
                setCelebrationMessage(message);
                setWon(true);
                setGameStarted(false);
                setShowFireworks(true);
                onDateCorrect?.(true);
                // Отменяем анимацию немедленно
                console.log('[DateBreakout] Отменяем анимацию, animationRef.current:', animationRef.current);
                cancelAnimationFrame(animationRef.current);
                // Прерываем выполнение gameLoop, устанавливая флаг и выходя из всех циклов
                console.log('[DateBreakout] Возвращаем false из filter (победа)');
                return false; // Удаляем цифру из fallingDigits
              } else {
                // Неправильная дата - поражение!
                console.log('[DateBreakout] НЕПРАВИЛЬНАЯ ДАТА - ПОРАЖЕНИЕ! Устанавливаем s.gameLost = true');
                s.gameLost = true; // Устанавливаем флаг в ref для немедленной остановки цикла
                document.exitPointerLock();
                setGameOver(true);
                setGameStarted(false);
                onDateCorrect?.(false);
                // Отменяем анимацию немедленно
                console.log('[DateBreakout] Отменяем анимацию при поражении, animationRef.current:', animationRef.current);
                cancelAnimationFrame(animationRef.current);
                console.log('[DateBreakout] Возвращаем false из filter (поражение)');
                return false; // Удаляем цифру из fallingDigits
              }
            } else {
              console.log('[DateBreakout] Собрано цифр:', newCollected.length, 'из 8, дата:', formatCollected(newCollected));
            }
            return false;
          }
        }
        return fd.y < GAME_HEIGHT + 30;
      });

      // Проверяем, не завершена ли игра после обработки fallingDigits
      if (s.gameWon || s.gameLost) {
        cancelAnimationFrame(animationRef.current);
        return;
      }

      // Если все блоки разбиты — появляется новый ряд
      if (s.blocks.every((b) => !b.alive)) {
        spawnNewRow(s);
      }

      // Проверяем, не завершена ли игра перед пересозданием блоков
      if (s.gameWon || s.gameLost) {
        cancelAnimationFrame(animationRef.current);
        return;
      }

      // Пересоздание всех блоков каждые 15 секунд
      const now = Date.now();
      if (now - s.lastBlockRespawn >= 15000) {
        // Проверяем, не находится ли мяч в области блоков перед пересозданием
        const ballInBlockArea = s.ballY < 24 + BLOCK_ROWS * (BLOCK_HEIGHT + 4);
        
        // Если мяч в области блоков, не пересоздаем блоки, чтобы избежать коллизий
        if (!ballInBlockArea) {
          s.blocks = [];
          const respawnNow = Date.now();
          for (let row = 0; row < BLOCK_ROWS; row++) {
            const rowDigits = getRandomDigits(BLOCK_COLS);
            for (let col = 0; col < BLOCK_COLS; col++) {
              const targetY = 24 + row * (BLOCK_HEIGHT + 4);
              s.blocks.push({
                id: s.nextBlockId++,
                digit: rowDigits[col],
                x: col * (GAME_WIDTH / BLOCK_COLS) + 2,
                y: targetY + 50, // Начинаем ниже для анимации
                alive: true,
                spawnTime: respawnNow + (row * 50) + (col * 10), // Задержка для каскадного эффекта
                targetY: targetY,
              });
            }
          }
          s.lastBlockRespawn = now;
        } else {
          // Если мяч в области блоков, откладываем пересоздание на следующий кадр
          // Обновляем таймер только если прошло больше 16 секунд (даем запас)
          if (now - s.lastBlockRespawn >= 16000) {
            s.lastBlockRespawn = now - 1000; // Откладываем на 1 секунду
          }
        }
      }

      // Проверяем, не завершена ли игра перед отрисовкой
      if (s.gameWon || s.gameLost) {
        cancelAnimationFrame(animationRef.current);
        return;
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const currentTime = Date.now();
      s.blocks.forEach((b) => {
        if (!b.alive) return;
        
        // Анимация появления
        const timeSinceSpawn = currentTime - b.spawnTime;
        const animationDuration = 600; // 600ms для анимации
        const progress = Math.min(1, Math.max(0, timeSinceSpawn / animationDuration));
        
        // Easing функция для плавной анимации
        const easeOutBounce = (t: number): number => {
          if (t < 1 / 2.75) {
            return 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
          } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
          } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
          }
        };
        
        const easedProgress = easeOutBounce(progress);
        
        // Позиция Y с анимацией
        const currentY = b.targetY + (b.y - b.targetY) * (1 - easedProgress);
        
        // Масштаб с анимацией
        const scale = 0.3 + easedProgress * 0.7;
        const scaledWidth = BLOCK_WIDTH * scale;
        const scaledHeight = BLOCK_HEIGHT * scale;
        const offsetX = (BLOCK_WIDTH - scaledWidth) / 2;
        const offsetY = (BLOCK_HEIGHT - scaledHeight) / 2;
        
        // Свечение при появлении
        const glowIntensity = progress < 1 ? (1 - progress) * 0.8 : 0;
        
        // Сохраняем контекст
        ctx.save();
        
        // Применяем свечение
        if (glowIntensity > 0) {
          ctx.shadowBlur = 20 * glowIntensity;
          ctx.shadowColor = `rgba(74, 105, 189, ${glowIntensity})`;
        }
        
        // Градиент с учетом анимации
        const gradient = ctx.createLinearGradient(
          b.x + offsetX, 
          currentY + offsetY, 
          b.x + offsetX + scaledWidth, 
          currentY + offsetY + scaledHeight
        );
        const baseColor = progress < 1 ? '#6a8bd5' : '#4a69bd';
        const darkColor = progress < 1 ? '#2e4a7f' : '#1e3a5f';
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, darkColor);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = progress < 1 
          ? `rgba(255,255,255,${0.4 + progress * 0.6})` 
          : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        
        roundRect(ctx, b.x + offsetX, currentY + offsetY, scaledWidth, scaledHeight, 6);
        ctx.fill();
        ctx.stroke();
        
        // Текст с учетом масштаба
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          b.digit, 
          b.x + BLOCK_WIDTH / 2, 
          currentY + BLOCK_HEIGHT / 2
        );
        
        // Обновляем позицию блока для коллизий
        if (progress < 1) {
          b.y = currentY;
        } else {
          b.y = b.targetY;
        }
        
        ctx.restore();
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

      // Продолжаем цикл только если игра не завершена
      if (!s.gameWon && !s.gameLost) {
        animationRef.current = requestAnimationFrame(gameLoop);
      } else {
        // Если игра завершена, отменяем анимацию
        console.log('[DateBreakout] Перед requestAnimationFrame: игра завершена, s.gameWon:', s.gameWon, 's.gameLost:', s.gameLost);
        cancelAnimationFrame(animationRef.current);
      }
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
  }, [gameStarted, gameOver, onDateCorrect, spawnNewRow, lives]);

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
        // Останавливаем игру при нажатии ESC
        if (gameStarted && !gameOver && !won) {
          setGameStarted(false);
          stateRef.current.gameWon = false;
          cancelAnimationFrame(animationRef.current);
        }
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
  }, [gameStarted, gameOver, won]);

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
      <p className="date-breakout-desc">
        Управление: ← → или мышь. Курсор заперт в области игры до проигрыша или Esc.
      </p>

      <div className="date-breakout-status">
        <div className="status-row">
          <span>Собрано: {displayDate}</span>
          <span className="lives-display">Жизни: {lives}</span>
        </div>
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
