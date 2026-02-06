import { useState, useMemo } from 'react';
import { baseExamples, secretExample } from './data/examples';
import './App.css';
import logo from './assets/logo.svg';
import { secretLevel } from './config/secretLevel';
import { Credits } from './components/Credits';

const INSTRUCTION_STEP = 0;

function App() {
  const [currentStep, setCurrentStep] = useState(INSTRUCTION_STEP);
  const [isDateCorrect, setIsDateCorrect] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const visibleExamples = useMemo(
    () => (secretUnlocked ? [...baseExamples, secretExample] : baseExamples),
    [secretUnlocked],
  );

  const selectedExampleId = currentStep === INSTRUCTION_STEP
    ? visibleExamples[0].id
    : visibleExamples[currentStep - 1]?.id ?? visibleExamples[0].id;
  const selectedExample = visibleExamples.find(ex => ex.id === selectedExampleId);
  const ExampleComponent = selectedExample?.component;
  const currentIndex = currentStep === INSTRUCTION_STEP ? -1 : currentStep - 1;
  const isLastExample = currentIndex === visibleExamples.length - 1;
  const isOnSecretStep = selectedExampleId === secretExample.id;

  const handleDateCorrect = (isCorrect: boolean) => {
    setIsDateCorrect(isCorrect);
  };

  const handleDateComplete = (date: string) => {
    const lastBaseId = baseExamples[baseExamples.length - 1].id;
    if (selectedExampleId === lastBaseId && date === secretLevel.date) {
      setSecretUnlocked(true);
    }
  };

  const handleNext = () => {
    if (currentStep === INSTRUCTION_STEP) {
      setCurrentStep(1);
    } else if (currentIndex < visibleExamples.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsDateCorrect(false);
    }
  };

  const handleStepSelect = (step: number) => {
    setCurrentStep(step);
    if (step !== INSTRUCTION_STEP) setIsDateCorrect(false);
  };

  return (
    <div className="app">
      {showCredits && (
        <Credits onClose={() => setShowCredits(false)} />
      )}
      <img src={logo} className="app-logo" alt="Logo" />
      <header className="app-header">
        <h1>Пожалуйста, введите вашу дату рождения</h1>
      </header>

      <nav className="examples-nav">
        <div className="nav-container">
          <button
            onClick={() => handleStepSelect(INSTRUCTION_STEP)}
            className={`nav-button nav-button-instruction ${currentStep === INSTRUCTION_STEP ? 'active' : ''}`}
            title="Инструкция"
          >
            <span className="nav-number">0</span>
          </button>
          {visibleExamples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => handleStepSelect(index + 1)}
              className={`nav-button ${example.navLabel === secretLevel.navLabel ? 'secret' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
            >
              <span className="nav-number">{example.navLabel ?? index + 1}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {currentStep === INSTRUCTION_STEP ? (
          <div className="instruction-container">
            <h2 className="instruction-title">Инструкция</h2>
            <p className="instruction-intro">
              Перед тобой коллекция интерфейсов ввода даты рождения — намеренно неудобных и «творческих».
              Твоя задача: составить рейтинг от <strong>1 — самый неудобный</strong> до <strong>10 — самый приемлемый</strong>.
            </p>
            <ol className="instruction-rules">
              <li>Хотя бы один раз попытайся пройти каждый шаг.</li>
              <li>Если у тебя совсем не получается — можешь перейти на следующий шаг.</li>
            </ol>
            <button onClick={handleNext} className="instruction-start-button">
              Поехали
            </button>
          </div>
        ) : ExampleComponent && (
          <div className="example-container">
            <ExampleComponent onDateCorrect={handleDateCorrect} onDateComplete={handleDateComplete} />
            {isDateCorrect && !isLastExample && (
              <button onClick={handleNext} className="next-button">
                Дальше
              </button>
            )}
            {isOnSecretStep && (
              <button
                type="button"
                className="credits-trigger-button"
                onClick={() => setShowCredits(true)}
              >
                Титры
              </button>
            )}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
