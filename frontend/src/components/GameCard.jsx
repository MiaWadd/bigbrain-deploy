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

  