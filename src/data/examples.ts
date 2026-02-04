import type { DateInputExample } from '../types';
import {
  ButtonGrid,
  ProgressiveSelects,
  PacmanDigits,
} from '../components/examples';

export const examples: DateInputExample[] = [
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
    id: 'pacman-digits',
    title: 'Пакман с цифрами',
    description: 'Соберите цифры, избегая врагов',
    component: PacmanDigits,
  },
];
