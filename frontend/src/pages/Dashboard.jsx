import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CreateGameModal from '../components/CreateGameModal';

// Define the backend URL
const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Function to fetch games
  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.data && Array.isArray(response.data.games)) {
        const sortedGames = response.data.games.sort((a, b) => a.name.localeCompare(b.name));
        setGames(sortedGames);
      } else {
        console.error("Unexpected API response structure:", response.data);
        setError('Failed to fetch games: Invalid data format received.');
        setGames([]);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      let errorMessage = 'Failed to fetch games.';
      if (err.response) {
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.error || 'Server error'}`;
        if (err.response.status === 403) {
          errorMessage += " Check if your token is valid or expired.";
        }
      } else if (err.request) {
        errorMessage = 'Failed to fetch games: No response from server. Is the backend running?';
      } else {
        errorMessage = `Failed to fetch games: ${err.message}`;
      }
      setError(errorMessage);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a random ID (you might want to use a more robust method)
  const generateGameId = () => {
    return Math.floor(Math.random() * 1000000) + 1;
  };

  // Function to handle game creation
  const handleCreateGame = async (gameName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      // Get the owner email from existing games
      // If no games exist yet, we'll need to get it from somewhere else (maybe stored during login?)
      const ownerEmail = games.length > 0 ? games[0].owner : null;
      
      if (!ownerEmail) {
        setError('Could not determine game owner. Please try refreshing the page.');
        return;
      }

      // Create new game object
      const newGame = {
        id: generateGameId(),
        name: gameName,
        questions: [], // Initialize with empty questions array
        thumbnail: "", // Initialize with empty thumbnail
        owner: ownerEmail, // Use the owner email from existing games
        active: false, // Add any other required fields
        createdAt: new Date().toISOString(), // Add timestamp
      };

      // Create updated games array with the new game
      const updatedGames = [...games, newGame];

      // Send the entire updated games array to the backend
      await axios.put(
        `${API_URL}/admin/games`,
        { games: updatedGames },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local state
      setGames(updatedGames);
      
      // Close the modal
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error creating game:", err);
      let errorMessage = 'Failed to create game.';
      if (err.response) {
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.error || 'Server error'}`;
        if (err.response.status === 400 && err.response.data?.error?.includes('owned by other admins')) {
          errorMessage = 'Cannot modify games owned by other admins. Please check the owner email.';
        }
      } else if (err.request) {
        errorMessage = 'Failed to create game: No response from server.';
      } else {
        errorMessage = `Failed to create game: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  const calculateTotalDuration = (questions) => {
    if (!Array.isArray(questions)) return 0;
    return questions.reduce((total, question) => total + (question.duration || 0), 0);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading games...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchGames}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Game
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No games found. Create one!</p>
        ) : (
          games.map((game) => (
            <div key={game.id || game.gameId} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
              <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    alt={`${game.name} thumbnail`}
                    className="object-cover h-full w-full"
                    onError={(e) => { e.target.onerror = null; e.target.src=""; e.target.alt="Invalid thumbnail"; }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Thumbnail</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={game.name}>{game.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Questions: {Array.isArray(game.questions) ? game.questions.length : 0}</p>
                <p className="text-sm text-gray-600 mb-4">Duration: {calculateTotalDuration(game.questions)}s</p>
                <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-200">
                  <Link
                    to={`/game/${game.id || game.gameId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => alert(`Delete game ${game.name} clicked - Placeholder`)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGame={handleCreateGame}
      />
    </div>
  );
}

export default Dashboard; 