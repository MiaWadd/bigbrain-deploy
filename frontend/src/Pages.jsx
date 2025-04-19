console.log("Pages.jsx loaded");


import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditGame from './pages/EditGame';
import EditQuestion from './pages/EditQuestion';
import Play from './pages/Play'
import Lobby from './pages/Lobby';
import Results from './pages/Results';
import Join from './pages/Join';


function Pages() {
  console.log("Pages.jsx loaded");

  const [token, setToken] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    setPlayerId(localStorage.getItem('playerId'));
  }, []);

  const updateToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
  }

  const joinSession = (playerId) => {
    localStorage.setItem('playerId', playerId);
    setPlayerId(playerId);
  }

  const logout = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.error("No token found for logout");
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login');
      return;
    }
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        }
      });
    } catch (err) {
      console.error("Logout API call failed:", err.response?.data?.error || err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login');
    }
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register token={token} updateToken={updateToken} />} />
        <Route path="/login" element={<Login token={token} updateToken={updateToken} />} />
        <Route path="/join" element={<Join playerId={playerId} joinSession={joinSession}/>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<EditGame />} />
        <Route path="/game/:gameId/question/:questionId" element={<EditQuestion />} />
        <Route path="/lobby" element={<Lobby playerId={playerId} />} />
        <Route path="/play" element={<Play />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </>
  );
}

export default Pages;