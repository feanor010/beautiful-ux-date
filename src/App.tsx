import { useState } from 'react';
import { examples } from './data/examples';
import './App.css';

function App() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(examples[0].id);
  const [isDateCorrect, setIsDateCorrect] = useState(false);

  const selectedExample = examples.find(ex => ex.id === selectedExampleId);
  const ExampleComponent = selectedExample?.component;
  const currentIndex = examples.findIndex(ex => ex.id === selectedExampleId);
  const isLastExample = currentIndex === examples.length - 1;

  const handleDateCorrect = (isCorrect: boolean) => {
    setIsDateCorrect(isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < examples.length - 1) {
      setSelectedExampleId(examples[currentIndex + 1].id);
      setIsDateCorrect(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Пожалуйста, введите вашу дату рождения</h1>
      </header>

      <nav className="examples-nav">
        <div className="nav-container">
          {examples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => {
                setSelectedExampleId(example.id);
                setIsDateCorrect(false);
              }}
              className={`nav-button ${selectedExampleId === example.id ? 'active' : ''}`}
            >
              <span className="nav-number">{index + 1}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {ExampleComponent && (
          <div className="example-container">
            <ExampleComponent onDateCorrect={handleDateCorrect} />
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
