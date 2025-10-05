import { useEffect, useRef } from 'react';
import SpaceCanvas from './SpaceCanvas';

interface HomePageProps {
  onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <>
      <SpaceCanvas />
      <div className="relative z-10 h-screen w-screen flex items-center justify-center flex-col">
        <h1 className="text-5xl md:text-6xl font-bold tracking-wider mb-4 text-white text-center px-4"
            style={{
              fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
              textShadow: '0 0 24px #ffd700'
            }}>
          🌌 Space Encyclopedia
        </h1>
        <p className="text-xl md:text-2xl mt-4 text-gray-300 text-center px-4"
           style={{
             fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
             textShadow: '0 0 12px rgba(192, 40, 252, 0.5)'
           }}>
          Step into the universe. Explore planets, stars, and cosmic mysteries.
        </p>
        <button
          onClick={onStart}
          className="mt-8 px-8 py-4 text-2xl text-white border-none rounded-full cursor-pointer transition-all duration-200 hover:opacity-90"
          style={{
            background: 'linear-gradient(90deg, #8f2fff 0%, #c028fc 100%)',
            boxShadow: '0 0 24px rgba(192, 40, 252, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(90deg, #c028fc 0%, #8f2fff 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(90deg, #8f2fff 0%, #c028fc 100%)';
          }}
        >
          Get Started
        </button>
      </div>
    </>
  );
}
