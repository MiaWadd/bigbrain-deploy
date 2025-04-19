import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function JoinGame({ joinSession }) {
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // If URL already has sessionId, populate it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionFromURL = params.get('session');
    if (sessionFromURL) {
      setSessionId(sessionFromURL);
    }
  }, [location]);

  const joinGame = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/play/join/${sessionId}`, {
        name: name,
      });

      // Check if we have a valid response with playerId
      if (response?.data?.playerId) {
        // Store playerId in localStorage
        localStorage.setItem('playerId', response.data.playerId);
        // Navigate to lobby to wait for game to start
        navigate('/lobby');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Join game error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Session ID is not valid');
      } else if (err.response?.status === 403) {
        setError('Session is not active');
      } else {
        setError('Failed to join game. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-10 mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5">
        <div className='w-full'>
          <h1 className="text-3xl text-center font-large text-black">Join a Game</h1>   
          <form onSubmit={joinGame}>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black">Session ID</label>
              <input
                value={sessionId} 
                onChange={e => setSessionId(e.target.value)}
                required
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black">Name</label>
              <input
                value={name} 
                onChange={e => setName(e.target.value)}
                required
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button 
              type='submit' 
              disabled={loading}
              className={`mt-5 px-4 py-2 w-full rounded-lg ${
                loading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>          
        </div>
      </div>
    </>
  );
}

export default JoinGame;
