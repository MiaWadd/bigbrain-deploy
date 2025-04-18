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
        console.log('Available games:', response.data.games); // Debug log
        console.log('Looking for session:', sessionId); // Debug log
        throw new Error('Could not find game associated with this session');
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