import { useEffect, useState } from 'react';

const quotes = [
  "Waiting for players...",
  "Grab a snack while you wait...",
  "Fetching questions...",
  "Waiting for game to start...",
  "Try some meditations...",
  "I'm borded too...",
  "Please give us good marks...",
];

export default function Lobby() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>      
      <h1 className="text-5xl font-bold mb-20 mt-30 flex flex-col items-center justify-center">
        Lobby
      </h1>
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-8 mb-10 justify-center">
          <div className="bubble bubble-red"></div>
          <div className="bubble bubble-yellow"></div>
          <div className="bubble bubble-green"></div>
        </div>
        <p className="text-xl font-medium text-center px-6 transition-opacity duration-500 ease-in-out">
          {quotes[quoteIndex]}
        </p>
      </div>
    </>
  );
}
