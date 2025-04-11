import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

// Define the backend URL
const BACKEND_PORT = 5005; // Assuming 5005 as discussed
const API_URL = `http://localhost:${BACKEND_PORT}`;

function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to fetch games
  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      // Optional: redirect to login
      // navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      // Assuming the API returns { games: [...] }
      // Add validation here if the structure might differ
      if (response.data && Array.isArray(response.data.games)) {
          // Sort games by createdAt or name? Let's sort by name for now.
          const sortedGames = response.data.games.sort((a, b) => a.name.localeCompare(b.name));
          setGames(sortedGames);
      } else {
          console.error("Unexpected API response structure:", response.data);
          setError('Failed to fetch games: Invalid data format received.');
          setGames([]); // Clear games on bad format
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      let errorMessage = 'Failed to fetch games.';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.error || 'Server error'}`;
        if (err.response.status === 403) {
           errorMessage += " Check if your token is valid or expired.";
           // Optionally clear token and redirect to login if 401/403
           // localStorage.removeItem('token');
           // navigate('/login');
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Failed to fetch games: No response from server. Is the backend running?';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Failed to fetch games: ${err.message}`;
      }
      setError(errorMessage);
      setGames([]); // Clear games on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []); // Empty dependency array means this runs once on mount

  const calculateTotalDuration = (questions) => {
    if (!Array.isArray(questions)) return 0; // Handle cases where questions might be missing or not an array
    return questions.reduce((total, question) => total + (question.duration || 0), 0);
  };

  // --- Render Logic --- 

  if (loading) {
    return <div className="p-8 text-center">Loading games...</div>;
  }

  if (error) {
    return (
        <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            {/* Optionally add a retry button */}
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
          // TODO: Implement create game modal functionality
          onClick={() => alert('Create New Game clicked - Placeholder')}
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
              {/* Thumbnail Section */}
              <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail} // Assuming thumbnail is a base64 string or URL
                    alt={`${game.name} thumbnail`}
                    className="object-cover h-full w-full"
                    // Add error handling for broken images if necessary
                    onError={(e) => { e.target.onerror = null; e.target.src=""; e.target.alt="Invalid thumbnail"; /* Optionally replace with a placeholder */ }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Thumbnail</span>
                )}
              </div>
              {/* Content Section */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={game.name}>{game.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Questions: {Array.isArray(game.questions) ? game.questions.length : 0}</p>
                <p className="text-sm text-gray-600 mb-4">Duration: {calculateTotalDuration(game.questions)}s</p>
                {/* Actions Section - Push to bottom */}
                <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-200">
                   {/* Use Link for navigation to edit page */}
                   <Link
                    to={`/game/${game.id || game.gameId}`} // Use game.id or game.gameId based on API
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    // TODO: Implement delete game functionality
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

      {/* Placeholder for Create/Delete Modals */}
    </div>
  );
}

export default Dashboard; 