import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/Navbar';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function Register({ updateToken, token }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const register = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      try {
        const response = await axios.post(`${API_URL}/admin/auth/register`, {
          email: email,
          password: password,
          name: name,
        });

        // Check if we have a valid response with token
        if (response?.data?.token) {
          updateToken(response.data.token);
          localStorage.setItem('email', email);
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Register error:', err);
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else if (err.response?.status === 400) {
          setError('Invalid registration details');
        } else {
          setError('Failed to register. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }   
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-10 mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5">
        <div className='w-full'>
          <h1 className="text-3xl text-center font-large text-black">Register</h1>   
          <form onSubmit={register}>
            <div className="max-w-sm mx-auto mt-5">
              <label htmlFor="register-name" className="text-md font-normal text-black">Name</label>
              <input
                id='register-name'
                value={name} 
                onChange={e => setName(e.target.value)}
                type="text"
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label htmlFor="register-email" className="text-md font-normal text-black">Email</label>
              <input
                id='register-email'
                value={email} 
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label htmlFor="register-password" className="text-md font-normal text-black">Password</label>
              <input
                id='register-password'
                value={password} 
                onChange={e => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label htmlFor="register-confirm-password" className="text-md font-normal text-black">Confirm Password</label>
              <input
                id='register-confirm-password'
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                type="password"
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button 
              type='submit'
              disabled={loading} 
              className={`mt-5 px-4 py-2 w-full rounded-lg ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form> 
          <p className="mt-5 text-center text-md font-normal text-black">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline hover:text-blue-700">Login</Link>
          </p>              
        </div>
      </div>
    </div>
  );
}

export default Register;