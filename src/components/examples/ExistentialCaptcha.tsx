import { useState } from 'react';
import './ExistentialCaptcha.css';
import { Fireworks } from '../Fireworks';
import { isSpecialDate } from '../../utils/dateCheck';
import type { DateInputExampleProps } from '../../types';

const CAPTCHA_IMAGES = [
    { id: 1, url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=200', sad: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200', sad: false },
    { id: 3, url: 'https://images.unsplash.com/photo-1493839523149-2864fca44919?w=200', sad: true },
    { id: 4, url: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=200', sad: true },
    { id: 5, url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=200', sad: false },
    { id: 6, url: 'https://images.unsplash.com/photo-1445262102387-5fbb30a5e59d?w=200', sad: true },
    { id: 7, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200', sad: false },
    { id: 8, url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=200', sad: false },
    { id: 9, url: 'https://images.unsplash.com/photo-1504194104404-433180773017?w=200', sad: true },
];

const PROMPTS = [
    "Выберите все изображения, на которых чувствуется тщетность бытия.",
    "Отметьте квадраты, где одиночество достигло своего пика.",
    "Где на этих фото скрыта меланхолия упущенных возможностей?",
    "Выберите изображения, подтверждающие конечность всего сущего."
];

export const ExistentialCaptcha = ({ onDateCorrect }: DateInputExampleProps) => {
    const [date, setDate] = useState('');
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [promptIdx, setPromptIdx] = useState(0);
    const [error, setError] = useState('');
    const [showFireworks, setShowFireworks] = useState(false);

    const handleConfirm = () => {
        if (date.length < 6) {
            setError('Слишком короткая жизнь для такой даты...');
            return;
        }
        setError('');
        setPromptIdx(Math.floor(Math.random() * PROMPTS.length));
        setSelected([]);
        setShowCaptcha(true);
    };

    const toggleImage = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const verify = () => {
        const selectedData = CAPTCHA_IMAGES.filter(img => selected.includes(img.id));
        const isSadEnough = selectedData.every(img => img.sad) && selectedData.length >= 3;

        if (isSadEnough) {
            setShowCaptcha(false);
            if (isSpecialDate(date)) {
                setShowFireworks(true);
                onDateCorrect?.(true);
            } else {
                setError('Дата верна, но ваше мироощущение всё еще слишком позитивно. Попробуйте снова.');
                setDate('');
            }
        } else {
            setError('Вы слишком счастливы для этой даты. Система не может вас идентифицировать.');
            setShowCaptcha(false);
            setSelected([]);
        }
    };

    return (
        <>
            {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}

            <div className="existential-container">
                <div className="existential-header">
                    <h3>Вспомните момент своего появления...</h3>
                </div>

                <div className="date-input-zone">
                    <input
                        type="text"
                        className="existential-field"
                        placeholder="ДД.ММ.ГГГГ"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Подтвердить существование
                    </button>
                    <div className="snarky-message">{error}</div>
                </div>

                {showCaptcha && (
                    <div className="captcha-modal">
                        <div className="captcha-box">
                            <div className="captcha-instruction">
                                <p>Подтвердите, что вы не оптимист:</p>
                                <strong>{PROMPTS[promptIdx]}</strong>
                            </div>

                            <div className="captcha-grid">
                                {CAPTCHA_IMAGES.map(img => (
                                    <div
                                        key={img.id}
                                        className={`captcha-item ${selected.includes(img.id) ? 'selected' : ''}`}
                                        onClick={() => toggleImage(img.id)}
                                    >
                                        <img src={img.url} alt="existential crisis" />
                                    </div>
                                ))}
                            </div>

                            <div className="captcha-footer">
                                <button className="verify-btn" onClick={verify}>ПОДТВЕРДИТЬ</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};