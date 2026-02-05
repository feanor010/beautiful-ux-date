import type { DateInputExample } from '../types';
import {
  ButtonGrid,
  LockedSlotsDateInput,
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
    id: 'locked-slots',
    title: 'Слоты с блокировкой',
    description: 'Слоты как в коде из SMS: случайные цифры + замок на каждый слот',
    component: LockedSlotsDateInput,
  },
];
