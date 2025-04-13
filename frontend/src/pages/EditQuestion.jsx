import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single-choice',
  MULTIPLE_CHOICE: 'multiple-choice',
  JUDGEMENT: 'judgement',
};

function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Question state
  const [questionData, setQuestionData] = useState({
    text: '',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    timeLimit: 30,
    points: 5,
    answers: ['', ''], // Start with 2 empty answers
    correctAnswers: [], // Indices of correct answers
    media: {
      type: null, // 'youtube' or 'image'
      url: '',
    },
  });

  // Fetch game and question data
  const fetchQuestion = async () => {
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
        const game = response.data.games.find(g => String(g.id) === String(gameId));
        if (!game) {
          setError('Game not found');
          return;
        }

        const question = game.questions.find(q => String(q.id) === String(questionId));
        if (!question) {
          setError('Question not found');
          return;
        }

        // Initialize state with existing question data
        setQuestionData({
          text: question.text || '',
          type: question.type || QUESTION_TYPES.SINGLE_CHOICE,
          timeLimit: question.timeLimit || question.duration || 30,
          points: question.points || 5,
          answers: question.answers || ['', ''],
          correctAnswers: question.correctAnswers || [],
          media: question.media || { type: null, url: '' },
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  // Save question changes
  const saveQuestion = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    // Validate question data
    if (!questionData.text.trim()) {
      setError('Question text is required');
      return;
    }

    if (questionData.type === QUESTION_TYPES.JUDGEMENT) {
      if (!questionData.answers[0]?.trim()) {
        setError('Statement is required for judgement questions');
        return;
      }
    } else {
      if (questionData.answers.filter(a => a.trim()).length < 2) {
        setError('At least 2 non-empty answers are required');
        return;
      }
    }

    if (questionData.answers.length > 6) {
      setError('Maximum 6 answers allowed');
      return;
    }

    if (questionData.correctAnswers.length === 0) {
      setError('At least one correct answer is required');
      return;
    }

    if (questionData.type === QUESTION_TYPES.SINGLE_CHOICE && questionData.correctAnswers.length > 1) {
      setError('Single choice questions can only have one correct answer');
      return;
    }

    if (questionData.type === QUESTION_TYPES.JUDGEMENT && questionData.correctAnswers.length > 1) {
      setError('Judgement questions can only have one correct answer');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.get(`${API_URL}/admin/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data && Array.isArray(response.data.games)) {
        const games = response.data.games;
        const gameIndex = games.findIndex(g => String(g.id) === String(gameId));
        
        if (gameIndex === -1) {
          setError('Game not found');
          return;
        }

        const game = games[gameIndex];
        const questionIndex = game.questions.findIndex(q => String(q.id) === String(questionId));
        
        // Prepare the updated question
        const updatedQuestion = {
          ...game.questions[questionIndex],
          ...questionData,
          id: questionId,
          duration: questionData.timeLimit, // Ensure duration is set for compatibility
        };

        // Update the question in the game
        const updatedQuestions = [...game.questions];
        if (questionIndex === -1) {
          updatedQuestions.push(updatedQuestion);
        } else {
          updatedQuestions[questionIndex] = updatedQuestion;
        }

        // Update the game with the new questions
        const updatedGame = {
          ...game,
          questions: updatedQuestions,
        };

        // Update all games
        const updatedGames = [...games];
        updatedGames[gameIndex] = updatedGame;

        // Send update to backend
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

        setError(null);
        // Navigate back to game edit page
        navigate(`/game/${gameId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };