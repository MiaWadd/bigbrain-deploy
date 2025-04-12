import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Register from './Register';
import Login from './Login';
import Home from './Home';
import Join from './JoinGame';
import Play from './Play'

function Pages() {
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    setSessionId(localStorage.getItem('sessionId'));
  }, []);

  const updateToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/home');
  }

  const joinSession = (sessionId) => {
    localStorage.setItem('sessionId', sessionId);
    setToken(sessionId);
    navigate('/play');
  }

  const logout = async () => {
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold">BigBrain</h1>
        {token && (
          <>
            <button onClick={logout} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
              Logout
            </button>        
          </>
        )}
      </nav>
      <hr />
      <Routes>
        <Route path="/register" element={<Register token={token} updateToken={updateToken} />} />
        <Route path="/login" element={<Login token={token} updateToken={updateToken} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/join" element={<Join joinSession={joinSession}/>} />
        <Route path="/play" element={<Play sessionId={sessionId} />} />
      </Routes>
    </>
  );
}

export default Pages;