import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditGame from './pages/EditGame';
import EditQuestion from './pages/EditQuestion';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import SessionControl from './pages/SessionControl';
import Play from './pages/Play';
import Results from './pages/Results';
import SessionResults from './pages/SessionResults';
import PastSessions from './pages/PastSessions';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Function to update token
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // Check token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login updateToken={updateToken} token={token} />} 
        />
        <Route 
          path="/register" 
          element={<Register updateToken={updateToken} token={token} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            token ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/game/:gameId" 
          element={
            token ? (
              <EditGame token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/game/:gameId/question/:questionId" 
          element={
            token ? (
              <EditQuestion token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/game/:gameId/sessions" 
          element={
            token ? (
              <PastSessions token={token} updateToken={updateToken} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/join" element={<Join />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/play" element={<Play />} />
        <Route path="/results" element={<Results />} />
        <Route 
          path="/session/:sessionId" 
          element={
            token ? (
              <SessionControl token={token} updateToken={updateToken} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/session/:sessionId/results" 
          element={
            token ? (
              <SessionResults token={token} updateToken={updateToken} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;