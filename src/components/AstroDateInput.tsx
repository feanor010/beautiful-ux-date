import { useState, useCallback } from 'react';
import { Moon, LunarPhase } from 'lunarphase-js';
import './AstroDateInput.css';
import { Fireworks } from './Fireworks';
import { getCelebrationMessage } from '../utils/celebrations';
import type { DateInputExampleProps } from '../types';

// Данные для выбора
const ZODIACS = [
  { name: 'Овен', icon: '♈', months: [2, 3] }, { name: 'Телец', icon: '♉', months: [3, 4] },
  { name: 'Близнецы', icon: '♊', months: [4, 5] }, { name: 'Рак', icon: '♋', months: [5, 6] },
  { name: 'Лев', icon: '♌', months: [6, 7] }, { name: 'Дева', icon: '♍', months: [7, 8] },
  { name: 'Весы', icon: '♎', months: [8, 9] }, { name: 'Скорпион', icon: '♏', months: [9, 10] },
  { name: 'Стрелец', icon: '♐', months: [10, 11] }, { name: 'Козерог', icon: '♑', months: [11, 0] },
  { name: 'Водолей', icon: '♒', months: [0, 1] }, { name: 'Рыбы', icon: '♓', months: [1, 2] }
];

const EASTERN_ANIMALS = [
  { name: 'Крыса', icon: '🐀', offset: 4 }, { name: 'Бык', icon: '🐂', offset: 5 },
  { name: 'Тигр', icon: '🐅', offset: 6 }, { name: 'Кролик', icon: '🐇', offset: 7 },
  { name: 'Дракон', icon: '🐉', offset: 8 }, { name: 'Змея', icon: '🐍', offset: 9 },
  { name: 'Лошадь', icon: '🐎', offset: 10 }, { name: 'Коза', icon: '🐐', offset: 11 },
  { name: 'Обезьяна', icon: '🐒', offset: 0 }, { name: 'Петух', icon: '🐓', offset: 1 },
  { name: 'Собака', icon: '🐕', offset: 2 }, { name: 'Свинья', icon: '🐖', offset: 3 }
];

const MOON_PHASES: { name: string; icon: string; phase: LunarPhase }[] = [
  { name: 'Новолуние', icon: '🌑', phase: LunarPhase.NEW },
  { name: 'Растущий серп', icon: '🌒', phase: LunarPhase.WAXING_CRESCENT },
  { name: 'Первая четверть', icon: '🌓', phase: LunarPhase.FIRST_QUARTER },
  { name: 'Растущая луна', icon: '🌔', phase: LunarPhase.WAXING_GIBBOUS },
  { name: 'Полнолуние', icon: '🌕', phase: LunarPhase.FULL },
  { name: 'Убывающая луна', icon: '🌖', phase: LunarPhase.WANING_GIBBOUS },
  { name: 'Последняя четверть', icon: '🌗', phase: LunarPhase.LAST_QUARTER },
  { name: 'Убывающий серп', icon: '🌘', phase: LunarPhase.WANING_CRESCENT },
];

const DECADES = [
  { name: '1960-е', start: 1960 }, { name: '1970-е', start: 1970 },
  { name: '1980-е', start: 1980 }, { name: '1990-е', start: 1990 },
  { name: '2000-е', start: 2000 }
];

const WEEK_OF_MONTH = [
  { name: '1–7 число', range: [1, 7] }, { name: '8–14 число', range: [8, 14] },
  { name: '15–21 число', range: [15, 21] }, { name: '22–31 число', range: [22, 31] }
];

// Допустимые диапазоны дат для каждого знака (месяц 1–12, день). Тропический зодиак.
const ZODIAC_DATE_RANGES: { month: number; dayMin: number; dayMax: number }[][] = [
  [{ month: 3, dayMin: 21, dayMax: 31 }, { month: 4, dayMin: 1, dayMax: 19 }],   // Овен
  [{ month: 4, dayMin: 20, dayMax: 30 }, { month: 5, dayMin: 1, dayMax: 20 }],   // Телец
  [{ month: 5, dayMin: 21, dayMax: 31 }, { month: 6, dayMin: 1, dayMax: 20 }],   // Близнецы
  [{ month: 6, dayMin: 21, dayMax: 30 }, { month: 7, dayMin: 1, dayMax: 22 }],   // Рак
  [{ month: 7, dayMin: 23, dayMax: 31 }, { month: 8, dayMin: 1, dayMax: 22 }],   // Лев
  [{ month: 8, dayMin: 23, dayMax: 31 }, { month: 9, dayMin: 1, dayMax: 22 }],   // Дева
  [{ month: 9, dayMin: 23, dayMax: 30 }, { month: 10, dayMin: 1, dayMax: 22 }],  // Весы
  [{ month: 10, dayMin: 23, dayMax: 31 }, { month: 11, dayMin: 1, dayMax: 21 }], // Скорпион
  [{ month: 11, dayMin: 22, dayMax: 30 }, { month: 12, dayMin: 1, dayMax: 21 }], // Стрелец
  [{ month: 12, dayMin: 22, dayMax: 31 }, { month: 1, dayMin: 1, dayMax: 19 }],  // Козерог
  [{ month: 1, dayMin: 20, dayMax: 31 }, { month: 2, dayMin: 1, dayMax: 18 }],   // Водолей
  [{ month: 2, dayMin: 19, dayMax: 29 }, { month: 3, dayMin: 1, dayMax: 20 }],   // Рыбы
];

// Китайский Новый год: первый день года по животному. До этой даты — предыдущее животное.
// Источник: chinese-year.com
const CHINESE_NEW_YEAR: Record<number, { month: number; day: number }> = {
  1960: { month: 1, day: 28 }, 1970: { month: 2, day: 6 }, 1980: { month: 2, day: 16 },
  1961: { month: 2, day: 15 }, 1971: { month: 1, day: 27 }, 1981: { month: 2, day: 5 },
  1962: { month: 2, day: 5 },  1972: { month: 2, day: 15 }, 1982: { month: 1, day: 25 },
  1963: { month: 1, day: 25 }, 1973: { month: 2, day: 3 },  1983: { month: 2, day: 13 },
  1964: { month: 2, day: 13 }, 1974: { month: 1, day: 23 }, 1984: { month: 2, day: 2 },
  1965: { month: 2, day: 2 },  1975: { month: 2, day: 11 }, 1985: { month: 2, day: 20 },
  1966: { month: 1, day: 21 }, 1976: { month: 1, day: 31 }, 1986: { month: 2, day: 9 },
  1967: { month: 2, day: 9 },  1977: { month: 2, day: 18 }, 1987: { month: 1, day: 29 },
  1968: { month: 1, day: 30 }, 1978: { month: 2, day: 7 },  1988: { month: 2, day: 17 },
  1969: { month: 2, day: 17 }, 1979: { month: 1, day: 28 }, 1989: { month: 2, day: 6 },
  1990: { month: 1, day: 27 }, 2000: { month: 2, day: 5 },  2010: { month: 2, day: 14 },
  1991: { month: 2, day: 15 }, 2001: { month: 1, day: 24 }, 2011: { month: 2, day: 3 },
  1992: { month: 2, day: 4 },  2002: { month: 2, day: 12 }, 2012: { month: 1, day: 23 },
  1993: { month: 1, day: 23 }, 2003: { month: 2, day: 1 },  2013: { month: 2, day: 10 },
  1994: { month: 2, day: 10 }, 2004: { month: 1, day: 22 }, 2014: { month: 1, day: 31 },
  1995: { month: 1, day: 31 }, 2005: { month: 2, day: 9 },  2015: { month: 2, day: 19 },
  1996: { month: 2, day: 19 }, 2006: { month: 1, day: 29 }, 2016: { month: 2, day: 8 },
  1997: { month: 2, day: 7 },  2007: { month: 2, day: 18 }, 2017: { month: 1, day: 28 },
  1998: { month: 1, day: 28 }, 2008: { month: 2, day: 7 },  2018: { month: 2, day: 16 },
  1999: { month: 2, day: 16 }, 2009: { month: 1, day: 26 }, 2019: { month: 2, day: 5 },
};

// Животное по дате (день, месяц 1–12, год). Учитывает китайский новый год.
const getEasternAnimalIndex = (day: number, month1: number, year: number): number => {
  const cny = CHINESE_NEW_YEAR[year];
  const effectiveYear = cny
    ? (month1 < cny.month || (month1 === cny.month && day < cny.day)) ? year - 1 : year
    : year;
  return (effectiveYear - 4) % 12;
};

// Годы в декаде, соответствующие животному. Учитываем, что до CNY — животное прошлого года.
const getMatchingYears = (animalIndex: number, decadeIndex: number): number[] => {
  const dec = DECADES[decadeIndex >= 0 ? decadeIndex : 0];
  const years: number[] = [];
  for (let y = dec.start; y < dec.start + 10; y++) {
    if ((y - 4) % 12 === animalIndex) years.push(y);
    const cny = CHINESE_NEW_YEAR[y];
    if (cny && (y - 1 - 4) % 12 === animalIndex) {
      if (!years.includes(y)) years.push(y);
    }
  }
  return years;
};

// Парсинг DD.MM.YYYY в Date (полдень локально)
const parseDate = (str: string): Date => {
  const [d, m, y] = str.split('.').map(Number);
  return new Date(y, m - 1, d);
};

// Все даты DD.MM.YYYY, подходящие под выбор (зодиак + животное + луна + декада + неделя)
const getMatchingDates = (s: Selections): string[] => {
  if (s.zodiac < 0 || s.animal < 0 || s.moon < 0 || s.decade < 0 || s.week < 0) return [];
  const years = getMatchingYears(s.animal, s.decade);
  if (years.length === 0) return [];
  const [dayMin, dayMax] = WEEK_OF_MONTH[s.week].range;
  if (dayMin > dayMax) return [];
  const targetPhase = MOON_PHASES[s.moon].phase;
  const zodiacRanges = ZODIAC_DATE_RANGES[s.zodiac];
  const dates: string[] = [];
  for (const r of zodiacRanges) {
    const dMin = Math.max(r.dayMin, dayMin);
    const dMax = Math.min(r.dayMax, dayMax);
    if (dMin > dMax) continue;
    for (let d = dMin; d <= dMax; d++) {
      for (const y of years) {
        if (getEasternAnimalIndex(d, r.month, y) !== s.animal) continue;
        const dateStr = `${d.toString().padStart(2, '0')}.${r.month.toString().padStart(2, '0')}.${y}`;
        const dateObj = parseDate(dateStr);
        if (Moon.lunarPhase(dateObj) === targetPhase) {
          dates.push(dateStr);
        }
      }
    }
  }
  return dates;
};

type Selections = { zodiac: number; animal: number; moon: number; decade: number; week: number };

const INITIAL_SELECTIONS: Selections = {
  zodiac: -1,
  animal: -1,
  moon: -1,
  decade: -1,
  week: -1,
};

const TOTAL_STEPS = 6; // zodiac, animal, moon, decade, week, final

// Валидация DD.MM.YYYY
const isValidDateStr = (str: string): boolean => {
  const m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return false;
  const [, day, month, year] = m.map(Number);
  if (month < 1 || month > 12 || day < 1 || year < 1900 || year > 2100) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

export const AstroDateInput = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Selections>(INITIAL_SELECTIONS);
  const [candidateDates, setCandidateDates] = useState<string[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [moonHintInput, setMoonHintInput] = useState('');
  const [moonHint, setMoonHint] = useState<{ name: string; icon: string } | null>(null);

  const generateCandidateDates = useCallback((s: Selections) => {
    const matching = getMatchingDates(s);
    if (matching.length === 0) return [];
    const unique = [...new Set(matching)];
    return unique.sort(() => Math.random() - 0.5);
  }, []);

  const handleSelect = (key: keyof Selections, index: number) => {
    const nextSelections = { ...selections, [key]: index };
    setSelections(nextSelections);
    setTimeout(() => {
      const nextStep = step + 1;
      if (nextStep === TOTAL_STEPS - 1) {
        setCandidateDates(generateCandidateDates(nextSelections));
      } else {
        setCandidateDates([]);
      }
      setStep(nextStep);
    }, 400);
  };

  const handleMoonHint = () => {
    const trimmed = moonHintInput.trim();
    if (!trimmed) {
      setMoonHint(null);
      return;
    }
    if (!isValidDateStr(trimmed)) {
      setMoonHint(null);
      return;
    }
    const phase = Moon.lunarPhase(parseDate(trimmed));
    const found = MOON_PHASES.find((p) => p.phase === phase);
    if (found) setMoonHint({ name: found.name, icon: found.icon });
    else setMoonHint(null);
  };

  const checkFinalDate = (date: string) => {
    onDateComplete?.(date);
    const message = getCelebrationMessage(date);
    if (message) {
      setCelebrationMessage(message);
      setShowFireworks(true);
      onDateCorrect?.(true);
    } else {
      alert("Звезды говорят, что это не ваш день. Попробуйте еще раз.");
      setStep(0);
      setSelections(INITIAL_SELECTIONS);
      setCandidateDates([]);
      setMoonHintInput('');
      setMoonHint(null);
      onDateCorrect?.(false);
    }
  };

  const starPositions = Array.from({ length: 60 }, (_, i) => ({
    left: `${(i * 17 + 13) % 100}%`,
    top: `${(i * 23 + 7) % 100}%`,
    delay: `${(i * 0.15) % 3}s`,
    size: i % 3 === 0 ? 2 : i % 3 === 1 ? 1.5 : 1,
  }));

  return (
    <div className="astro-container">
      <div className="astro-stars" aria-hidden>
        {starPositions.map((s, i) => (
          <span
            key={i}
            className="astro-star"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
              width: s.size,
              height: s.size,
            }}
          />
        ))}
      </div>
      {showFireworks && (
        <Fireworks message={celebrationMessage ?? 'Судьба предрешена!'} onComplete={() => setShowFireworks(false)} />
      )}

      <div className="astro-card">
        <div className="astro-card-glow" />
        <div className="astro-progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="astro-step astro-step-enter">
            <h3>Выберите ваш знак Зодиака</h3>
            <div className="astro-grid">
              {ZODIACS.map((z, i) => (
                <button key={z.name} className="astro-item astro-item-stagger" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => handleSelect('zodiac', i)}>
                  <span className="astro-icon">{z.icon}</span>
                  <span className="astro-label">{z.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="astro-step astro-step-enter">
            <h3>Ваш покровитель по восточному календарю</h3>
            <div className="astro-grid">
              {EASTERN_ANIMALS.map((a, i) => (
                <button key={a.name} className="astro-item astro-item-stagger" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => handleSelect('animal', i)}>
                  <span className="astro-icon">{a.icon}</span>
                  <span className="astro-label">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="astro-step astro-step-enter">
            <h3>Фаза Луны в миг вашего рождения</h3>
            <div className="astro-grid">
              {MOON_PHASES.map((p, i) => (
                <button key={p.name} className="astro-item astro-item-stagger" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => handleSelect('moon', i)}>
                  <span className="astro-icon">{p.icon}</span>
                  <span className="astro-label">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="astro-moon-hint">
              <span className="astro-moon-hint-text">Не знаете свою фазу луны?</span>
              <div className="astro-moon-hint-row">
                <input
                  type="text"
                  className="astro-moon-hint-input"
                  placeholder="ДД.ММ.ГГГГ"
                  value={moonHintInput}
                  onChange={(e) => setMoonHintInput(e.target.value)}
                  onBlur={handleMoonHint}
                  onKeyDown={(e) => e.key === 'Enter' && handleMoonHint()}
                />
                {moonHint && (
                  <span className="astro-moon-hint-result">
                    {moonHint.icon} {moonHint.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="astro-step astro-step-enter">
            <h3>Десятилетие вашего рождения</h3>
            <div className="astro-grid">
              {DECADES.map((d, i) => (
                <button key={d.name} className="astro-item astro-item-stagger" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => handleSelect('decade', i)}>
                  <span className="astro-label">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="astro-step astro-step-enter">
            <h3>Неделя месяца, когда вы появились на свет</h3>
            <div className="astro-grid">
              {WEEK_OF_MONTH.map((w, i) => (
                <button key={w.name} className="astro-item astro-item-stagger" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => handleSelect('week', i)}>
                  <span className="astro-label">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="astro-step astro-step-enter">
            <h3>Звезды сошлись. Выберите вашу дату:</h3>
            {candidateDates.length > 0 ? (
              <div className="astro-final-list">
                {candidateDates.map((date, i) => (
                  <button key={date} className="astro-date-button astro-date-stagger" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => checkFinalDate(date)}>
                    ✨ {date} ✨
                  </button>
                ))}
              </div>
            ) : (
              <div className="astro-empty-state">
                <p>По вашим выбором даты не найдены. Проверьте фазу Луны, неделю месяца и другие параметры — они должны соответствовать вашей дате рождения.</p>
                <button className="astro-date-button" onClick={() => { setStep(0); setSelections(INITIAL_SELECTIONS); setCandidateDates([]); setMoonHintInput(''); setMoonHint(null); }}>
                  Начать заново
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};