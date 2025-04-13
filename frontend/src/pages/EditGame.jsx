import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [questions, setQuestions] = useState([]);

  // Fetch game data
  const fetchGame = async () => {
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
        const foundGame = response.data.games.find(g => String(g.id) === String(gameId));
        if (foundGame) {
          setGame(foundGame);
          setNewName(foundGame.name);
          setThumbnail(foundGame.thumbnail || '');
          setQuestions(foundGame.questions || []);
        } else {
          setError('Game not found');
        }
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch game');
    } finally {
      setLoading(false);
    }
  };

  // Update game data
  const updateGame = async (updatedData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data && Array.isArray(response.data.games)) {
        const updatedGames = response.data.games.map(g => 
          String(g.id) === String(gameId) ? { ...g, ...updatedData } : g
        );

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
        setGame(prev => ({ ...prev, ...updatedData }));
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update game');
    }
  };

  // Handle name update
  const handleNameUpdate = async () => {
    if (newName.trim() === '') return;
    await updateGame({ name: newName.trim() });
    setEditingName(false);
  };

  // Handle thumbnail update
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        await updateGame({ thumbnail: base64String });
        setThumbnail(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = async () => {
    const newQuestion = {
      id: Date.now(), // Temporary ID
      text: 'New Question',
      duration: 30,
      points: 5,
      correctAnswers: [],
      type: 'multiple-choice',
      answers: [],
    };

    const updatedQuestions = [...questions, newQuestion];
    await updateGame({ questions: updatedQuestions });
    setQuestions(updatedQuestions);
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    await updateGame({ questions: updatedQuestions });
    setQuestions(updatedQuestions);
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  if (loading) {
    return <div className="p-8 text-center">Loading game...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchGame}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!game) {
    return <div className="p-8 text-center">Game not found</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Game</h1>
      </div>

      {/* Game Metadata Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Game Details</h2>
        
        {/* Game Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Name
          </label>
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter game name"
              />
              <button
                onClick={handleNameUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNewName(game.name);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-gray-900">{game.name}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail
          </label>
          <div className="flex items-start gap-4">
            <div className="w-40 h-40 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Game thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">No thumbnail</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a new thumbnail image
              </p>
            </div>
          </div>
        </div>
      </div>