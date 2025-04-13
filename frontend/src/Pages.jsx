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
import Dashboard from './pages/Dashboard';

function Pages() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const successJob = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
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
        <Route path="/register" element={<Register token={token} successJob={successJob} />} />
        <Route path="/login" element={<Login token={token} successJob={successJob} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default Pages;