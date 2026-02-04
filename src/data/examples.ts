import type { DateInputExample } from '../types';
import {
  BinaryInput,
  ButtonGrid,
  ProgressiveSelects,
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
    id: 'binary-input',
    title: 'Бинарный Аккумулятор',
    description: 'Соберите дату из битов. Осторожно, контакты отходят!',
    component: BinaryInput,
  },
];
