import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CreateGameModal from '../components/CreateGameModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import GameCard from '../components/GameCard';
import Navbar from '../components/Navbar';

// Define the backend URL
const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function Dashboard({ token, updateToken }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteGame, setDeleteGame] = useState(null); // Store game to be deleted
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
        const sortedGames = response.data.games.sort((a, b) => {
          // Handle cases where name might be undefined or not a string
          const nameA = typeof a?.name === 'string' ? a.name.toLowerCase() : '';
          const nameB = typeof b?.name === 'string' ? b.name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });
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

  // Function to generate a random ID
  const generateGameId = () => {
    return Math.floor(Math.random() * 1000000) + 1;
  };

  // Function to handle game creation
  const handleCreateGame = async (gameData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {

      // const ownerEmail = games.length > 0 ? games[0].owner : null;
      const ownerEmail = localStorage.getItem('email');
      if (!ownerEmail) {
        setError('Could not determine game owner. Please try refreshing the page.');
        return;
      }

      const newGame = {
        id: generateGameId(),
        name: gameData.name,
        questions: gameData.questions || [],
        thumbnail: gameData.thumbnail || "",
        owner: ownerEmail,
        active: false,
        createdAt: new Date().toISOString(),
      };

      const updatedGames = [...games, newGame];

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

      setGames(updatedGames);
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

  // Function to handle game deletion
  const handleDeleteGame = async () => {
    if (!deleteGame) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      // Filter out the game to be deleted
      const updatedGames = games.filter(game => (game.id || game.gameId) !== (deleteGame.id || deleteGame.gameId));

      // Update the backend
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
      setError(null); // Clear any existing errors
      
      // Close the delete modal
      setDeleteGame(null);
    } catch (err) {
      console.error("Error deleting game:", err);
      let errorMessage = 'Failed to delete game.';
      if (err.response) {
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.error || 'Server error'}`;
        if (err.response.status === 400 && err.response.data?.error?.includes('owned by other admins')) {
          errorMessage = 'Cannot delete games owned by other admins.';
        }
      } else if (err.request) {
        errorMessage = 'Failed to delete game: No response from server.';
      } else {
        errorMessage = `Failed to delete game: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

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
    <div className="min-h-screen bg-gray-100">
      <Navbar showLogout={true} onLogout={() => {
        updateToken(null);
        navigate('/login');
      }} />

      {/* Main Content */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No games found. Create one!</p>
          ) : (
            games.map((game) => (
              <GameCard
                key={game.id || game.gameId}
                game={game}
                onDelete={() => setDeleteGame(game)}
              />
            ))
          )}
        </div>

        <CreateGameModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateGame={handleCreateGame}
        />

        <DeleteConfirmationModal
          isOpen={deleteGame !== null}
          onClose={() => setDeleteGame(null)}
          onConfirm={handleDeleteGame}
          gameName={deleteGame?.name || ''}
        />
      </div>
    </div>
  );
}

export default Dashboard; 