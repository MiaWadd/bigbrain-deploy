import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function PastSessions({ token, updateToken }) {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/games`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const foundGame = response.data.games.find(g => String(g.id) === String(gameId));
        if (foundGame) {
          setGame(foundGame);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId, token]);

  const handleViewResults = (sessionId) => {
    navigate(`/session/${sessionId}/results`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar showLogout={true} onLogout={() => {
          updateToken(null);
          navigate('/login');
        }} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar showLogout={true} onLogout={() => {
          updateToken(null);
          navigate('/login');
        }} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar showLogout={true} onLogout={() => {
        updateToken(null);
        navigate('/login');
      }} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Past Sessions - {game?.name}</h1>
          <button
            onClick={() => navigate(`/game/${gameId}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Game
          </button>
        </div>

        {game?.oldSessions && game.oldSessions.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...game.oldSessions].reverse().map((sessionId) => (
                  <tr key={sessionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sessionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewResults(sessionId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-white shadow-md rounded-lg">
            <p className="text-gray-500">No past sessions found for this game.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PastSessions; 