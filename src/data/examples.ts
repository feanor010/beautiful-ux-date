import type { DateInputExample } from '../types';
import {
  AstroDateInput,
  BinaryInput,
  ButtonGrid,
  LockedSlotsDateInput,
  DateBreakout,
  ProgressiveSelects,
  PacmanDigits,
  DrunkInput,
  ExistentialCaptcha,
  PhilosophicalQuiz,
  SecretLevel,
} from '../components/examples';
import { secretLevel } from '../config/secretLevel';

export const baseExamples: DateInputExample[] = [
  {
    id: 'button-grid',
    title: 'Кнопки в случайном порядке',
    description: 'Выбор чисел через кнопки, расположенные случайным образом',
    component: ButtonGrid,
  },
  {
    id: 'progressive-selects',
    title: 'Прогрессивный выбор с таймером',
    description: 'Поэтапный выбор с кнопками и таймером',
    component: ProgressiveSelects,
  },
  {
    id: 'locked-slots',
    title: 'Слоты с блокировкой',
    description: 'Слоты как в коде из SMS: случайные цифры + замок на каждый слот',
    component: LockedSlotsDateInput,
  },
  {
    id: 'pacman-digits',
    title: 'Пакман с цифрами',
    description: 'Соберите цифры, избегая врагов',
    component: PacmanDigits,
  },
  {
    id: 'drunk-input',
    title: 'Пьяный курсор',
    description: 'Попробуйте попасть по кнопкам, когда всё плывет и двоится.',
    component: DrunkInput,
  },
  {
    id: 'binary-input',
    title: 'Бинарный Аккумулятор',
    description: 'Соберите дату из битов. Осторожно, контакты отходят!',
    component: BinaryInput,
  },
  {
    id: 'date-lottery',
    title: 'Лотерея Судьбы',
    description: 'Выбей свой джекпот! Но берегись полиции и азарта.',
    component: ExistentialCaptcha,
  },
  {
    id: 'astro-oracle',
    title: 'Астрологический Оракул',
    description: 'Найдите свою дату рождения по звездам, лунному циклу и восточному календарю.',
    component: AstroDateInput,
  },
  {
    id: 'date-breakout',
    title: 'Дата через Breakout',
    description: 'Разбейте блоки с цифрами, ловите падающие цифры паддлом и соберите дату',
    component: DateBreakout,
  },
  {
    id: 'philosophical-quiz',
    title: 'Философский опросник',
    description: 'Ответьте на вечные вопросы, а в конце введите дату рождения.',
    component: PhilosophicalQuiz,
  },
];

export const secretExample: DateInputExample = {
  id: 'secret-annie',
  title: secretLevel.title,
  description: '',
  component: SecretLevel,
  navLabel: secretLevel.navLabel,
};
