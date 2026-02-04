import type { DateInputExample } from '../types';
import {
  BinaryInput,
  ButtonGrid,
  ProgressiveSelects,
  PacmanDigits, DrunkInput, ExistentialCaptcha,
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
];
