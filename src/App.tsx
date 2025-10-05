import { useState } from 'react';
import HomePage from './components/HomePage';
import SolarSystem from './components/SolarSystem';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden">
      {!started ? (
        <HomePage onStart={() => setStarted(true)} />
      ) : (
        <SolarSystem />
      )}
    </div>
  );
}

export default App;
