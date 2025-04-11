import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
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
      <nav className="p-4 bg-gray-100 mb-4 flex justify-between items-center">
        <div>
          {/* Maybe add a Home link or Logo here? */}
        </div>
        <div>
          {token ? (
            <>
              <Link to="/dashboard" className="mr-4 text-blue-600 hover:underline">Dashboard</Link>
              <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Logout
              </button>
            </>
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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default Pages;