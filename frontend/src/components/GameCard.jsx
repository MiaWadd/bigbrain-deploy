import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SessionPopup from './SessionPopup';
import StopGamePopup from './StopGamePopup';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function GameCard({ game, onDelete }) {
  const navigate = useNavigate();
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [showStopPopup, setShowStopPopup] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (game?.active) {
      setSessionId(game.active);
      setIsActive(true);
    }
  }, [game]);

  // Check session status on mount and when sessionId changes //TODO DOes this work here?
  useEffect(() => {
    if (game?.id) {
      checkSessionStatus();
    }
  }, [game?.active, sessionId]);

  if (!game || typeof game !== 'object') {
    return null;
  }

  // Calculate total duration
  const calculateTotalDuration = (questions) => {
    if (!Array.isArray(questions)) return 0;
    return questions.reduce((total, question) => total + (parseInt(question.duration) || 0), 0);
  };

  // Check if game has an active session
  const checkSessionStatus = async () => {
    if (!game?.id) return;

    // First check if game has an active session in its data
    if (game?.active) {
      setSessionId(game.active);
      setIsActive(true);
      return;
    }

    // Then check session status if we have a sessionId
    if (sessionId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_URL}/admin/session/${sessionId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setIsActive(response.status === 200);
      } catch {
        setIsActive(false);
        setSessionId(null);
      }
    }
  };

  // Start a new game session
  const startGame = async () => {
    if (!game?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${API_URL}/admin/game/${game.id}/mutate`,
        { mutationType: 'START' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      // After starting the game, we need to get the active session ID
      const activeSessionResponse = await axios.get(
        `${API_URL}/admin/games`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      // Find the current game in the response and get its active session
      const currentGame = activeSessionResponse.data?.games?.find(g => g.id === game.id);
      const newSessionId = currentGame?.active;
                          
      if (newSessionId) {
        setSessionId(newSessionId);
        setIsActive(true);
        setShowSessionPopup(true);
      } else {
        throw new Error('No session ID received from server');
      }
    } catch (err) {
      console.error('Start game error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start game session');
      setIsActive(false);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Stop the game session
  const stopGame = async () => {
    if (!game?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${API_URL}/admin/game/${game.id}/mutate`,
        { mutationType: 'END' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setIsActive(false);
      setSessionId(null);
      setShowStopPopup(true);
    } catch (err) {
      console.error('Stop game error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to stop game session');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to view results for the most recent ended session
  const handleViewResults = () => {
    if (!game?.id) return;

    // If we have an active session that was just stopped, use that
    if (sessionId) {
      navigate(`/session/${sessionId}/results`);
      return;
    }

    // Otherwise, try to use the most recent old session
    if (game?.oldSessions && Array.isArray(game.oldSessions) && game.oldSessions.length > 0) {
      const latestSessionId = game.oldSessions[game.oldSessions.length - 1];
      navigate(`/session/${latestSessionId}/results`);
    } else {
      console.error('Could not determine session ID for results viewing.', game);
      setError('No session results available to view');
    }
  };

  // // Check session status on mount and when sessionId changes
  // useEffect(() => {
  //   if (game?.id) {
  //     checkSessionStatus();
  //   }
  // }, [game?.active, sessionId]);

  const gameName = typeof game?.name === 'string' ? game.name : 'Untitled Game';
  const gameId = game?.id;
  const questions = Array.isArray(game?.questions) ? game.questions : [];
  const oldSessions = Array.isArray(game?.oldSessions) ? game.oldSessions : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thumbnail */}
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {game?.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={`${gameName} thumbnail`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
              e.target.alt = "Invalid thumbnail";
            }}
          />
        ) : (
          <span className="text-gray-700 text-sm">No Thumbnail</span>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-2">{gameName}</h2>
        
        <div className="mb-4 space-y-1">
          <p className="text-gray-600">Questions: {questions.length}</p>
          <p className="text-gray-600">Duration: {calculateTotalDuration(questions)}s</p>
          {isActive && sessionId && (
            <p className="text-green-700 font-medium">
              Session Active • ID: {sessionId}
              <button
                onClick={() => navigate(`/session/${sessionId}`)}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Control Session
              </button>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {gameId && (
            <button
              onClick={() => navigate(`/game/${gameId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
          )}
          
          {isActive ? (
            <button
              onClick={stopGame}
              disabled={loading}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 ${
                loading
                  ? 'bg-red-500 text-white cursor-wait'
                  : 'bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              {loading ? 'Stopping...' : 'Stop Game'}
            </button>
          ) : (
            <button
              onClick={startGame}
              disabled={loading}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 ${
                loading
                  ? 'bg-green-500 text-white cursor-wait'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          )}

          {gameId && (
            <button
              onClick={() => onDelete(gameId)}
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              Delete
            </button>
          )}

          {oldSessions.length > 0 && gameId && (
            <button
              onClick={() => navigate(`/game/${gameId}/sessions`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Past Sessions ({oldSessions.length})
            </button>
          )}
        </div>

        {showSessionPopup && sessionId && (
          <SessionPopup
            sessionId={sessionId}
            onClose={() => setShowSessionPopup(false)}
          />
        )}

        {showStopPopup && (
          <StopGamePopup
            onClose={() => setShowStopPopup(false)}
            onViewResults={handleViewResults}
          />
        )}
      </div>
    </div>
  );
}

export default GameCard; 