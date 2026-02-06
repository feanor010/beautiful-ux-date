import { useState } from 'react';
import './ExistentialCaptcha.css';
import { Fireworks } from '../Fireworks';
import type { DateInputExampleProps } from '../../types';
import { getCelebrationMessage } from "../../utils/celebrations.ts";

const CAPTCHA_IMAGES = [
    { id: 1, url: 'https://avatars.mds.yandex.net/i?id=8cb0b8114d7e6aeff8359f79ca64ca65_l-5351088-images-thumbs&n=13', sad: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300', sad: false },
    { id: 3, url: 'https://avatars.mds.yandex.net/i?id=68dd57bf741b76b95e52b505c7dd28fe0916c042-5298414-images-thumbs&n=13', sad: true },
    { id: 4, url: 'https://avatars.mds.yandex.net/i?id=ef808dd0a0c5ca1df96dd722590f0af8_l-4400724-images-thumbs&n=13', sad: true },
    { id: 5, url: 'https://img.freepik.com/free-photo/group-fluffy-gray-kittens-looking-curious-ready-play_157027-4498.jpg?semt=ais_hybrid', sad: false },
    { id: 6, url: 'https://avatars.mds.yandex.net/i?id=6bf9e18fbc39bdd7f28fb91f7564966e_l-17799811-images-thumbs&n=13', sad: true },
    { id: 7, url: 'https://avatars.mds.yandex.net/i?id=2a0000019b70303a632ae2d97a5925e9539f-18249724-yarec&n=13', sad: false },
    { id: 8, url: 'https://vkplay.ru/pre_0x736_resize/hotbox/content_files/gallery/31/19/c69aa4e5.jpeg?quality=85', sad: true },
    { id: 9, url: 'https://avatars.mds.yandex.net/i?id=928b3740e21e18b8557e8c503ec085d6_l-9848534-images-thumbs&n=13', sad: false },
];

const PROMPTS = [
    "Выберите все изображения, на которых время остановилось навсегда.",
    "Отметьте квадраты, где тишина стала невыносимой.",
    "Где на этих фото запечатлен распад надежды?",
    "Выберите изображения, которые вызывают желание смотреть в стену часами."
];

export const ExistentialCaptcha = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
    const [date, setDate] = useState('');
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [promptIdx, setPromptIdx] = useState(0);
    const [error, setError] = useState('');
    const [showFireworks, setShowFireworks] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

    const handleConfirm = () => {
        if (date.length < 6) {
            setError('Слишком мало цифр для такой долгой боли...');
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
        const isSadEnough = selectedData.length >= 3 && selectedData.every(img => img.sad);

        if (isSadEnough) {
            setShowCaptcha(false);
            onDateComplete?.(date);
            const message = getCelebrationMessage(date);
            if (message) {
                setCelebrationMessage(message);
                setShowFireworks(true);
                onDateCorrect?.(true);
            } else {
                setError('Дата верна, но ваше существование всё еще под вопросом. Попробуйте снова.');
                setDate('');
            }
        } else {
            setError('Вы слишком счастливы для этой системы. Идентификация невозможна.');
            setShowCaptcha(false);
            setSelected([]);
        }
    };

    return (
        <>
            <div className="noise-overlay"></div>
            {showFireworks && (
                <Fireworks
                    message={celebrationMessage ?? 'Ура!'}
                    onComplete={() => setShowFireworks(false)}
                />
            )}

            <div className="existential-container">
                <div className="existential-header">
                    <h3>Вспомните момент своего появления...</h3>
                </div>

                <div className="date-input-zone">
                    <input
                        type="text"
                        className="existential-field"
                        placeholder="00.00.0000"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Подтвердить тщетность
                    </button>
                    <div className="snarky-message">{error}</div>
                </div>

                {showCaptcha && (
                    <div className="captcha-modal">
                        <div className="captcha-box">
                            <div className="captcha-instruction">
                                <p>Проверка на человечность:</p>
                                <strong>{PROMPTS[promptIdx]}</strong>
                            </div>

                            <div className="captcha-grid">
                                {CAPTCHA_IMAGES.map(img => (
                                    <div
                                        key={img.id}
                                        className={`captcha-item ${selected.includes(img.id) ? 'selected' : ''}`}
                                        onClick={() => toggleImage(img.id)}
                                    >
                                        <img src={img.url} alt="void" />
                                    </div>
                                ))}
                            </div>

                            <div className="captcha-footer">
                                <span style={{ color: '#444', fontSize: '0.7rem' }}>Выбора нет</span>
                                <button className="verify-btn" onClick={verify}>ПРИНЯТЬ</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};