import { useState, useEffect, useRef } from 'react';
import './DrunkInput.css';
import { Fireworks } from '../Fireworks';
import type { DateInputExampleProps } from '../../types';
import { getCelebrationMessage } from "../../utils/celebrations.ts";

export const DrunkInput = ({ onDateCorrect, onDateComplete }: DateInputExampleProps) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [drunkPos, setDrunkPos] = useState({ x: 0, y: 0 });
    const [isSober, setIsSober] = useState(false);
    const [values, setValues] = useState({ day: '', month: '', year: '' });
    const [offsets, setOffsets] = useState([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
    const [showFireworks, setShowFireworks] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
    const requestRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const stateRef = useRef({ mousePos, isSober, drunkPos });

    useEffect(() => {
        stateRef.current = { mousePos, isSober, drunkPos };
    }, [mousePos, isSober, drunkPos]);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const animate = () => {
            timeRef.current += 0.05;
            const t = timeRef.current;
            const { mousePos: mPos, isSober: sober, drunkPos: dPos } = stateRef.current;

            let nextDrunkPos = { x: 0, y: 0 };

            if (sober) {
                nextDrunkPos = {
                    x: dPos.x + (mPos.x - dPos.x) * 0.2,
                    y: dPos.y + (mPos.y - dPos.y) * 0.2
                };
            } else {
                const driftX = Math.sin(t * 0.7) * 50;
                const driftY = Math.cos(t * 0.5) * 50;
                const targetX = mPos.x + driftX;
                const targetY = mPos.y + driftY;

                nextDrunkPos = {
                    x: dPos.x + (targetX - dPos.x) * 0.05,
                    y: dPos.y + (targetY - dPos.y) * 0.05
                };
            }

            setDrunkPos(nextDrunkPos);

            if (!sober) {
                const newOffsets = inputRefs.current.map(ref => {
                    if (!ref) return { x: 0, y: 0 };
                    const rect = ref.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const dist = Math.hypot(nextDrunkPos.x - centerX, nextDrunkPos.y - centerY);

                    if (dist < 120) {
                        const angle = Math.atan2(centerY - nextDrunkPos.y, centerX - nextDrunkPos.x);
                        return {
                            x: Math.cos(angle) * 60,
                            y: Math.sin(angle) * 60
                        };
                    }
                    return { x: 0, y: 0 };
                });
                setOffsets(newOffsets);
            } else {
                setOffsets([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    const handleBrine = () => {
        setIsSober(true);
        setTimeout(() => setIsSober(false), 1000);
    };

    const handleSubmit = () => {
        const dateStr = `${values.day.padStart(2, '0')}.${values.month.padStart(2, '0')}.${values.year}`;
        onDateComplete?.(dateStr);
        const message = getCelebrationMessage(dateStr);

        if (message) {
            setCelebrationMessage(message);
            setShowFireworks(true);
            onDateCorrect?.(true);
        } else {
            alert("Ты меня... ик... уважаешь? Дата не та!");
        }
    };

    return (
        <>
            {showFireworks && (
                <Fireworks
                    message={celebrationMessage ?? 'Ура!'}
                    onComplete={() => setShowFireworks(false)}
                />
            )}

            <div
                className="custom-cursor"
                style={{
                    left: 0,
                    top: 0,
                    transform: `translate(${drunkPos.x}px, ${drunkPos.y}px)`
                }}
            >
                🥴
            </div>

            <div
                className={`drunk-container ${!isSober ? 'hallucinating' : ''}`}
                onMouseMove={handleMouseMove}
                ref={containerRef}
            >
                <div className="drunk-form">
                    <div className="drunk-label">К0гда 3спавНился, увАЖаемый?!</div>

                    <div className="drunk-input-group">
                        {(['day', 'month', 'year'] as const).map((field, idx) => (
                            <div
                                key={field}
                                ref={el => { inputRefs.current[idx] = el; }}
                                className="drunk-field-wrapper"
                                style={{ transform: `translate(${offsets[idx].x}px, ${offsets[idx].y}px)` }}
                            >
                                <input
                                    type="text"
                                    className="drunk-field"
                                    placeholder={field === 'year' ? 'Год?' : '...'}
                                    value={values[field]}
                                    onChange={e => setValues({ ...values, [field]: e.target.value })}
                                    maxLength={field === 'year' ? 4 : 2}
                                    tabIndex={-1}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        className={`brine-button ${isSober ? 'sobering' : ''}`}
                        onClick={handleBrine}
                        tabIndex={-1}
                    >
                        Выпить рассол
                    </button>

                    <button
                        className="submit-drunk"
                        onClick={handleSubmit}
                        tabIndex={-1}
                    >
                        Я всё... ик... ввёл
                    </button>

                    <div className="drunk-status">
                        {isSober ? "О, полегчало... Быстрее, пока не накрыло!" : "Всё плывет... Где тут кнопки? Почему их две?"}
                    </div>
                </div>

                <div className="troll-box">
                    <div className="speech-bubble">
                        Слышь, вкинь дичь какую-нибудь, чисто по фану!
                    </div>
                    <div className="troll-emoji">🤪</div>
                </div>
            </div>
        </>
    );
};