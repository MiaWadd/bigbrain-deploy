import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SessionPopup from './SessionPopup';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function GameCard({ game, onDelete }) {
  const navigate = useNavigate();
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [sessionId, setSessionId] = useState(game.active || null);
  const [isActive, setIsActive] = useState(!!game.active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total duration
  const calculateTotalDuration = (questions) => {
    if (!Array.isArray(questions)) return 0;
    return questions.reduce((total, question) => total + (parseInt(question.time) || 0), 0);
  };

  // Check if game has an active session
  const checkSessionStatus = async () => {
    // First check if game has an active session in its data
    if (game.active) {
      setSessionId(game.active);
      setIsActive(true);
      return;
    }

    // Then check session status if we have a sessionId
    if (sessionId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/session/${sessionId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setIsActive(response.status === 200);
      } catch (err) {
        setIsActive(false);
        setSessionId(null);
      }
    }
  };

  // Start a new game session
  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
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
      const currentGame = activeSessionResponse.data.games.find(g => g.id === game.id);
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

  // Check session status on mount and when sessionId changes
  useEffect(() => {
    checkSessionStatus();
  }, [game.active, sessionId]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thumbnail */}
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={`${game.name} thumbnail`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
              e.target.alt = "Invalid thumbnail";
            }}
          />
        ) : (
          <span className="text-gray-400 text-sm">No Thumbnail</span>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
        
        <div className="mb-4 space-y-1">
          <p className="text-gray-600">Questions: {game.questions?.length || 0}</p>
          <p className="text-gray-600">Duration: {calculateTotalDuration(game.questions)}s</p>
          {isActive && (
            <p className="text-green-600 font-medium">
              Session Active • ID: {sessionId}
            </p>
          )}
        </div>