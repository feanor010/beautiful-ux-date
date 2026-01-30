import { useState } from 'react';
import './ReverseSelects.css';

// Example 2: Selects in reverse order (year, month, day)
export const ReverseSelects = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="reverse-selects">
      <div className="selects-container">
        <div className="select-group">
          <label>Год</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="select-field">
            <option value="">Выберите год</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <label>Месяц</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="select-field">
            <option value="">Выберите месяц</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <label>День</label>
          <select value={day} onChange={(e) => setDay(e.target.value)} className="select-field">
            <option value="">Выберите день</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
