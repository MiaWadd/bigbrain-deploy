import React, { useState } from 'react';

function CreateGameModal({ isOpen, onClose, onCreateGame }) {
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonError, setJsonError] = useState('');

  const validateGameData = (data) => {
    // Check if data has required fields
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Game name is required and must be a string');
    }

    if (!Array.isArray(data.questions)) {
      throw new Error('Questions must be an array');
    }

    // Validate each question
    data.questions.forEach((question, index) => {
      if (!question.type || !['single-choice', 'multiple-choice', 'judgement'].includes(question.type)) {
        throw new Error(`Question ${index + 1}: Invalid question type`);
      }

      if (!question.text || typeof question.text !== 'string') {
        throw new Error(`Question ${index + 1}: Question text is required`);
      }

      if (!Number.isInteger(question.points) || question.points < 0) {
        throw new Error(`Question ${index + 1}: Points must be a positive integer`);
      }

      if (!Number.isInteger(question.duration) || question.duration < 0) {
        throw new Error(`Question ${index + 1}: Duration must be a positive integer`);
      }

      if (!Array.isArray(question.answers) || question.answers.length < 2) {
        throw new Error(`Question ${index + 1}: At least 2 answers are required`);
      }

      if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
        throw new Error(`Question ${index + 1}: At least one correct answer is required`);
      }

      // Validate correct answers are within bounds
      question.correctAnswers.forEach(answerIndex => {
        if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.answers.length) {
          throw new Error(`Question ${index + 1}: Invalid correct answer index`);
        }
      });

      // Additional validation for specific question types
      if (question.type === 'single-choice' && question.correctAnswers.length !== 1) {
        throw new Error(`Question ${index + 1}: Single choice questions must have exactly one correct answer`);
      }

      if (question.type === 'judgement') {
        if (question.answers.length !== 2) {
          throw new Error(`Question ${index + 1}: Judgement questions must have exactly 2 answers`);
        }
        if (question.correctAnswers.length !== 1) {
          throw new Error(`Question ${index + 1}: Judgement questions must have exactly one correct answer`);
        }
      }
    });

    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setJsonFile(file);
    setJsonError('');

    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        validateGameData(data);
        setGameName(data.name);
      } catch (err) {
        setJsonError(err.message);
        setJsonFile(null);
        e.target.value = null; // Reset file input
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setJsonError('');
    
    if (!gameName.trim()) {
      setError('Game name is required');
      return;
    }

    try {
      let gameData = { name: gameName };

      if (jsonFile) {
        const text = await jsonFile.text();
        const data = JSON.parse(text);
        validateGameData(data);
        gameData = data;
      }

      // Call the parent handler with the game data
      onCreateGame(gameData);
      
      // Reset form
      setGameName('');
      setJsonFile(null);
      if (e.target.querySelector('input[type="file"]')) {
        e.target.querySelector('input[type="file"]').value = null;
      }
    } catch (err) {
      setJsonError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-2">
              Game Name
            </label>
            <input
              type="text"
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter game name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="jsonFile" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Game Data (Optional)
            </label>
            <input
              type="file"
              id="jsonFile"
              accept=".json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {jsonError && <p className="mt-1 text-sm text-red-600">{jsonError}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Upload a JSON file containing complete game data. The file should include game name, questions, and answers.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGameModal; 