import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const quotes = [
  "Waiting for players...",
  "Grab a snack while you wait...",
  "Fetching questions...",
  "Waiting for game to start...",
  "Try some meditations...",
  "I'm borded too...",
  "Please give us good marks...",
];
// TODO: Check that game has not finished as well as has not started. 
export default function Lobby({ playerId }) {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [error, setError] = useState(null);

  // playerId = 374173910; //TODO update
  // If no playerId, redirect to join game
  useEffect(() => {
    if (!localStorage.getItem('playerId')) {
    // if (!playerId) {
      navigate('/join');
    }
  }, [navigate]); 

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5005/play/${playerId}/question`);
        // if (response.data.message === " ") {
          clearInterval(poll);
          navigate('/play');
        // }
        console.log(response);
      } catch (error) {
        if (error.response.data.error !== "Session has not started yet") {
          console.error(error.response.data.error);
        }
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [playerId]);

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
