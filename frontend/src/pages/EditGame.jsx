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