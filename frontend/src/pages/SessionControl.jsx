import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StopGamePopup from '../components/StopGamePopup';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

export default function SessionControl({ token }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStopPopup, setShowStopPopup] = useState(false);
  const [gameId, setGameId] = useState(null);

  // Get initial game ID
  const fetchGameId = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // Find the game that has this active session
      // Convert sessionId to string for comparison since URL params are strings
      const game = response.data.games.find(g => String(g.active) === String(sessionId));

      if (game) {
        console.log('Found game:', game); // Debug log
        setGameId(game.id);
        return game.id;
      } else {
        const game = response.data.games.find(g => (g.oldSessions.includes(Number(sessionId))));
        console.log('Found game:', game); // Debug log
        if (!game) {
          throw new Error('Could not find game associated with this session');
        }
      }
    } catch (err) {
      console.error('Error fetching game ID:', err);
      console.error('Full error details:', err.response || err); // Debug log
      setError(err.response?.data?.error || 'Failed to find associated game');
      return null;
    }
  };

  // Fetch current question status
  const fetchStatus = async () => {
    try {
      // If we don't have a game ID yet, try to fetch it
      if (!gameId) {
        const fetchedGameId = await fetchGameId();
        if (!fetchedGameId) {
          setError('Could not find game associated with this session');
          setLoading(false);
          return;
        }
      }

      const response = await axios.get(`${API_URL}/admin/session/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setCurrentQuestion(response.data.question);
      setTimeLeft(response.data.timeLeft);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch session status');
      setLoading(false);
    }
  };

  // Initial setup
  useEffect(() => {
    if (!sessionId || !token) return;

    const setup = async () => {
      // First get the game ID
      const fetchedGameId = await fetchGameId();
      if (fetchedGameId) {
        // Then start polling for status
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
      }
    };

    setup();
  }, [sessionId, token]);

  // Advance to next question
  const handleAdvance = async () => {
    if (!gameId) {
      setError('Game ID not available. Please try refreshing the page.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/game/${gameId}/mutate`,
        { mutationType: 'ADVANCE' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      await fetchStatus(); // Refresh status after advancing
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to advance question');
    } finally {
      setActionLoading(false);
    }
  };

  // Stop the session
  const handleStop = async () => {
    if (!gameId) {
      setError('Game ID not available. Please try refreshing the page.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/game/${gameId}/mutate`,
        { mutationType: 'END' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      setShowStopPopup(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to stop session');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle viewing results after stopping
  const handleViewResults = () => {
    setShowStopPopup(false);
    navigate(`/results/${gameId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 max-w-md w-full text-center">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Session Control</h1>
            <div className="text-gray-600">Session ID: {sessionId}</div>
          </div>

          {currentQuestion && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Question</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-lg mb-2">{currentQuestion.text}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-gray-600">
                    Question {currentQuestion.number} of {currentQuestion.total}
                  </div>
                  <div className="text-gray-600">
                    Time Left: {timeLeft}s
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAdvance}
              disabled={actionLoading}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 ${
                actionLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {actionLoading ? 'Processing...' : 'Advance to Next Question'}
            </button>
            <button
              onClick={handleStop}
              disabled={actionLoading}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                actionLoading
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {actionLoading ? 'Processing...' : 'Stop Session'}
            </button>
          </div>
        </div>
      </div>

      {showStopPopup && (
        <StopGamePopup
          onClose={() => setShowStopPopup(false)}
          onViewResults={handleViewResults}
        />
      )}
    </div>
  );
} 