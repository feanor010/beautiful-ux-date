import { useState, useMemo } from 'react';
import { baseExamples, secretExample } from './data/examples';
import './App.css';
import logo from './assets/logo.svg';
import { secretLevel } from './config/secretLevel';

function App() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(baseExamples[0].id);
  const [isDateCorrect, setIsDateCorrect] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const visibleExamples = useMemo(
    () => (secretUnlocked ? [...baseExamples, secretExample] : baseExamples),
    [secretUnlocked],
  );

  const selectedExample = visibleExamples.find(ex => ex.id === selectedExampleId);
  const ExampleComponent = selectedExample?.component;
  const currentIndex = visibleExamples.findIndex(ex => ex.id === selectedExampleId);
  const isLastExample = currentIndex === visibleExamples.length - 1;

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
    if (currentIndex < visibleExamples.length - 1) {
      setSelectedExampleId(visibleExamples[currentIndex + 1].id);
      setIsDateCorrect(false);
    }
  };

  return (
    <div className="app">
      <img src={logo} className="app-logo" alt="Logo" />
      <header className="app-header">
        <h1>Пожалуйста, введите вашу дату рождения</h1>
      </header>

      <nav className="examples-nav">
        <div className="nav-container">
          {visibleExamples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => {
                setSelectedExampleId(example.id);
                setIsDateCorrect(false);
              }}
              className={`nav-button ${example.navLabel === secretLevel.navLabel ? 'secret' : ''} ${selectedExampleId === example.id ? 'active' : ''}`}
            >
              <span className="nav-number">{example.navLabel ?? index + 1}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {ExampleComponent && (
          <div className="example-container">
            <ExampleComponent onDateCorrect={handleDateCorrect} onDateComplete={handleDateComplete} />
            {isDateCorrect && !isLastExample && (
              <button onClick={handleNext} className="next-button">
                Дальше
              </button>
            )}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
