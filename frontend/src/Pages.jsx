import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import Register from './Register';
import Login from './Login';
import Home from './Home';
import Dashboard from './pages/Dashboard';
import EditGame from './pages/EditGame';
import EditQuestion from './pages/EditQuestion';
import Join from './JoinGame';
import Play from './Play'
import Lobby from './Lobby';

function Pages() {
  const [token, setToken] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
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
    setToken(playerId);
    // navigate('/play');
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
      <nav className="p-4 bg-gray-100 mb-4 flex justify-between items-center">
        <div>
          {token && (
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          )}
        </div>
        <div>
          {token ? (
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/register" className="mr-4 text-blue-600 hover:underline">Register</Link>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/register" element={<Register token={token} successJob={successJob} />} />
        <Route path="/login" element={<Login token={token} successJob={successJob} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/join" element={<Join joinSession={joinSession}/>} />
        <Route path="/play" element={<Play playerId={playerId} />} />
        <Route path="/lobby" element={<Lobby />} />

      </Routes>
    </>
  );
}

export default Pages;