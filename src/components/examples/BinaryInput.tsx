import { useState, useEffect, useCallback } from 'react';
import './BinaryInput.css';
import { Fireworks } from '../Fireworks';
import type { DateInputExampleProps } from '../../types';
import { getCelebrationMessage } from "../../utils/celebrations.ts";

const BITS = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

export const BinaryInput = ({ onDateCorrect }: DateInputExampleProps) => {
    const [switches, setSwitches] = useState<boolean[]>(new Array(12).fill(false));
    const [stage, setStage] = useState<'day' | 'month' | 'year' | 'done'>('day');
    const [values, setValues] = useState({ day: '', month: '', year: '' });
    const [showFireworks, setShowFireworks] = useState(false);
    const [isAlarm, setIsAlarm] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

    const currentSum = switches.reduce((acc, isOn, index) => {
        return acc + (isOn ? BITS[index] : 0);
    }, 0);

    const triggerAlarm = () => {
        setIsAlarm(true);
        setTimeout(() => setIsAlarm(false), 400);
    };

    useEffect(() => {
        if (stage === 'done') return;

        const gravityInterval = setInterval(() => {
            setSwitches(prev => {
                const activeIndices = prev.map((isOn, idx) => isOn ? idx : -1).filter(idx => idx !== -1);

                if (activeIndices.length > 0) {
                    const dropChance = 0.05 + (activeIndices.length * 0.03);

                    if (Math.random() < dropChance) {
                        const randomActiveIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)];
                        const newSwitches = [...prev];
                        newSwitches[randomActiveIndex] = false;
                        triggerAlarm();
                        return newSwitches;
                    }
                }
                return prev;
            });
        }, 400);

        return () => clearInterval(gravityInterval);
    }, [stage]);

    const toggleSwitch = (index: number) => {
        setSwitches(prev => {
            const newSwitches = [...prev];
            newSwitches[index] = !newSwitches[index];
            return newSwitches;
        });
    };

    const handleReset = useCallback(() => {
        setValues({ day: '', month: '', year: '' });
        setStage('day');
        setSwitches(new Array(12).fill(false));
        setIsAlarm(false);
        setCelebrationMessage(null);
        onDateCorrect?.(false);
    }, [onDateCorrect]);

    const checkFinalDate = (finalValues: { day: string, month: string, year: string }) => {
        const dateStr = `${finalValues.day.padStart(2, '0')}.${finalValues.month.padStart(2, '0')}.${finalValues.year}`;
        const message = getCelebrationMessage(dateStr);

        if (message) {
            setCelebrationMessage(message);
            setShowFireworks(true);
            onDateCorrect?.(true);
        } else {
            setTimeout(() => {
                alert(`КРИТИЧЕСКИЙ СБОЙ: ДАННЫЕ ${dateStr} ОТКЛОНЕНЫ`);
                handleReset();
            }, 500);
        }
    };

    const handleCommit = () => {
        const val = currentSum.toString();
        let isValid = false;

        if (stage === 'day') isValid = currentSum >= 1 && currentSum <= 31;
        if (stage === 'month') isValid = currentSum >= 1 && currentSum <= 12;
        if (stage === 'year') isValid = currentSum >= 1900 && currentSum <= new Date().getFullYear();

        if (!isValid) {
            triggerAlarm();
            return;
        }

        const newValues = { ...values, [stage]: val };
        setValues(newValues);
        setSwitches(new Array(12).fill(false));

        if (stage === 'day') setStage('month');
        else if (stage === 'month') setStage('year');
        else if (stage === 'year') {
            setStage('done');
            checkFinalDate(newValues);
        }
    };

    const getInstruction = () => {
        switch (stage) {
            case 'day': return 'Наберите ДЕНЬ (1-31)';
            case 'month': return 'Наберите МЕСЯЦ (1-12)';
            case 'year': return 'Наберите ГОД (1900+)';
            case 'done': return 'ОБРАБОТКА ПОТОКА...';
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
            <div className={`binary-input ${isAlarm ? 'shake' : ''}`}>
                <div className="status-panel">
                    <div className={`status-light ${isAlarm ? 'alarm' : ''}`}></div>
                </div>

                <div className="lcd-display">
                    <div className="stage-indicator">
                        <span className={stage === 'day' ? 'active' : values.day ? 'done' : ''}>ДЕНЬ</span>
                        <span className="divider">:</span>
                        <span className={stage === 'month' ? 'active' : values.month ? 'done' : ''}>МЕСЯЦ</span>
                        <span className="divider">:</span>
                        <span className={stage === 'year' ? 'active' : values.year ? 'done' : ''}>ГОД</span>
                    </div>
                    <div className="current-value">
                        СУММА: {currentSum}
                    </div>
                    <div className="instruction">
                        {getInstruction()}
                    </div>
                </div>

                <div className="switches-container">
                    {switches.map((isOn, index) => (
                        <div key={index} className="switch-wrapper">
                            <div className="bit-label">{BITS[index]}</div>
                            <div
                                className={`toggle-switch ${isOn ? 'on' : 'off'}`}
                                onClick={() => toggleSwitch(index)}
                            >
                                <div className="switch-handle"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="controls">
                    <button className="commit-btn" onClick={handleCommit} disabled={stage === 'done'}>
                        ЗАФИКСИРОВАТЬ
                    </button>
                    <button className="reset-btn" onClick={handleReset}>
                        СБРОС
                    </button>
                </div>

                <div className="alarm-text">
                    ВНИМАНИЕ: КРИТИЧЕСКИЙ ИЗНОС МЕХАНИЗМОВ
                </div>
            </div>
        </>
    );
};