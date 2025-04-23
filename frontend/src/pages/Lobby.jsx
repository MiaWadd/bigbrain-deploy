import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

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
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [error, setError] = useState(null);

  // Check for playerId in localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      navigate('/join');
    }
  }, [navigate]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for game status
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) return;

    const poll = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/play/${storedPlayerId}/status`);
        
        // If game has started, navigate to play screen
        if (response.data.started) {
          clearInterval(poll);
          navigate('/play');
        }

        // If game has ended, navigate to results
        if (response.data.ended) {
          clearInterval(poll);
          navigate('/results');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        // Only set error if it's not the expected "waiting" message
        if (errorMessage !== "Session has not started yet") {
          setError(errorMessage);
          console.error('Error polling game status:', errorMessage);
        }
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 max-w-md w-full text-center">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => navigate('/join')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Join Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-20">
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
    </div>
  );
}
