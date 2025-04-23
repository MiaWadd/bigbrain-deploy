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
  const [game, setGame] = useState(null);

  // Question state with proper initialization
  const [questionData, setQuestionData] = useState({
    text: '',
    type: QUESTION_TYPES.SINGLE_CHOICE,
    timeLimit: 30,
    points: 5,
    answers: ['', ''],
    correctAnswers: [],
    media: {
      type: null,
      url: '',
    },
  });

  // Fetch game and question data
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

      if (!response.data || !Array.isArray(response.data.games)) {
        setError('Invalid response format from server');
        setLoading(false);
        return;
      }

      const game = response.data.games.find(g => String(g.id) === String(gameId));
      if (!game) {
        setError('Game not found');
        setLoading(false);
        return;
      }

      // Ensure questions have consistent ID format
      const questionsWithIds = game.questions.map((q, index) => ({
        ...q,
        id: q.id || `q${index + 1}`
      }));
      game.questions = questionsWithIds;

      // Find the question using string comparison
      const question = game.questions.find(q => String(q.id) === String(questionId));
      if (!question) {
        setError('Question not found');
        setLoading(false);
        return;
      }

      // Ensure all required fields are present in the question data
      const processedQuestion = {
        text: question.text || '',
        type: question.type || QUESTION_TYPES.SINGLE_CHOICE,
        timeLimit: question.timeLimit || question.duration || 30,
        points: question.points || 5,
        answers: question.answers || ['', ''],
        correctAnswers: question.correctAnswers || [],
        media: question.media || { type: null, url: '' },
      };

      setGame(game);
      setQuestionData(processedQuestion);
      setError(null);
    } catch (err) {
      console.error('Error fetching game:', err);
      setError(err.response?.data?.error || 'Failed to fetch game. Please try again.');
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

  // Handle media upload
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionData(prev => ({
          ...prev,
          media: {
            type: 'image',
            url: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle YouTube URL
  const handleYoutubeUrl = (url) => {
    setQuestionData(prev => ({
      ...prev,
      media: {
        type: 'youtube',
        url: url,
      },
    }));
  };

  useEffect(() => {
    fetchGame();
  }, [gameId, questionId]);

  if (loading) {
    return <div className="p-8 text-center">Loading question...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate(`/game/${gameId}`)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(`/game/${gameId}`)}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Back to Game
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Question</h1>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Question Type */}
        <div>
          <label for="question-type" className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
           id="question-type"
            value={questionData.type}
            onChange={(e) => {
              setQuestionData(prev => ({
                ...prev,
                type: e.target.value,
                correctAnswers: [], // Reset correct answers when type changes
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={QUESTION_TYPES.SINGLE_CHOICE}>Single Choice</option>
            <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
            <option value={QUESTION_TYPES.JUDGEMENT}>Judgement</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            value={questionData.text}
            onChange={(e) => setQuestionData(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter your question"
          />
        </div>

        {/* Time Limit and Points */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label for="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (seconds)
            </label>
            <input
              id="duration"
              type="number"
              value={questionData.timeLimit}
              onChange={(e) => setQuestionData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="points" className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              id="points"
              type="number"
              value={questionData.points}
              onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Media Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Optional)
          </label>
          <div className="space-y-4">
            {/* YouTube URL */}
            <div>
              <input
                type="url"
                placeholder="YouTube URL"
                value={questionData.media.type === 'youtube' ? questionData.media.url : ''}
                onChange={(e) => handleYoutubeUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Preview */}
            {questionData.media.url && (
              <div className="mt-2">
                {questionData.media.type === 'image' ? (
                  <img
                    src={questionData.media.url}
                    alt="Question media"
                    className="max-h-40 object-contain"
                  />
                ) : (
                  <div className="text-sm text-gray-500">YouTube video URL added</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Answers */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {questionData.type === QUESTION_TYPES.JUDGEMENT ? 'Statement' : 'Answers'}
            </label>
            {questionData.type !== QUESTION_TYPES.JUDGEMENT && questionData.answers.length < 6 && (
              <button
                onClick={() => setQuestionData(prev => ({
                  ...prev,
                  answers: [...prev.answers, ''],
                }))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Answer
              </button>
            )}
          </div>
          <div className="space-y-2">
            {questionData.type === QUESTION_TYPES.JUDGEMENT ? (
              // Judgement question - single statement with true/false
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={questionData.answers[0] || ''}
                  onChange={(e) => {
                    setQuestionData(prev => ({
                      ...prev,
                      answers: [e.target.value],
                      correctAnswers: prev.correctAnswers, // Maintain current true/false state
                    }));
                  }}
                  placeholder="Enter the statement to judge as true or false"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">False</label>
                  <div 
                    className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer ${
                      questionData.correctAnswers.includes(0) ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => {
                      setQuestionData(prev => ({
                        ...prev,
                        correctAnswers: prev.correctAnswers.includes(0) ? [] : [0],
                      }));
                    }}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        questionData.correctAnswers.includes(0) ? 'translate-x-7' : ''
                      }`}
                    />
                  </div>
                  <label className="text-sm font-medium text-gray-700">True</label>
                </div>
              </div>
            ) : (
              // Multiple choice or single choice questions
              questionData.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type={questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE ? 'checkbox' : 'radio'}
                    checked={questionData.correctAnswers.includes(index)}
                    onChange={(e) => {
                      let newCorrectAnswers;
                      if (questionData.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
                        newCorrectAnswers = e.target.checked
                          ? [...questionData.correctAnswers, index]
                          : questionData.correctAnswers.filter(i => i !== index);
                      } else {
                        newCorrectAnswers = e.target.checked ? [index] : [];
                      }
                      setQuestionData(prev => ({
                        ...prev,
                        correctAnswers: newCorrectAnswers,
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...questionData.answers];
                      newAnswers[index] = e.target.value;
                      setQuestionData(prev => ({
                        ...prev,
                        answers: newAnswers,
                      }));
                    }}
                    placeholder={`Answer ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {questionData.answers.length > 2 && (
                    <button
                      onClick={() => {
                        const newAnswers = questionData.answers.filter((_, i) => i !== index);
                        const newCorrectAnswers = questionData.correctAnswers
                          .filter(i => i !== index)
                          .map(i => i > index ? i - 1 : i);
                        setQuestionData(prev => ({
                          ...prev,
                          answers: newAnswers,
                          correctAnswers: newCorrectAnswers,
                        }));
                      }}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={saveQuestion}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditQuestion; 