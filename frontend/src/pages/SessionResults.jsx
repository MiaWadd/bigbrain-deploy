import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

// --- Helper Function to Calculate Stats ---
const processApiResults = (apiData) => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { players: [], questionResults: [], totalPlayers: 0 };
  }

  // 1. Calculate Player Scores
  const playersWithScores = apiData.map(player => {
    const score = player.answers.reduce((acc, answer) => acc + (answer.correct ? 1 : 0), 0);
    // Assuming score is just the count of correct answers for now.
    // This could be enhanced later if questions have point values.
    return { ...player, score }; 
  });

  // 2. Calculate Question Results (Correct % and Avg Time)
  const numQuestions = apiData[0].answers.length;
  const questionResults = [];

  for (let i = 0; i < numQuestions; i++) {
    let correctCount = 0;
    let totalAnswerTime = 0;
    let answeredCount = 0;

    apiData.forEach(player => {
      const answer = player.answers[i];
      if (answer.correct) {
        correctCount++;
      }
      if (answer.questionStartedAt && answer.answeredAt) {
        const startTime = new Date(answer.questionStartedAt).getTime();
        const endTime = new Date(answer.answeredAt).getTime();
        if (!isNaN(startTime) && !isNaN(endTime) && endTime >= startTime) {
            totalAnswerTime += (endTime - startTime) / 1000; // Time in seconds
            answeredCount++;
        }
      }
    });

    const correctPercentage = (apiData.length > 0) ? (correctCount / apiData.length) * 100 : 0;
    const averageAnswerTime = (answeredCount > 0) ? totalAnswerTime / answeredCount : 0;

    questionResults.push({
      questionIndex: i,
      correctPercentage: parseFloat(correctPercentage.toFixed(1)), // Round to 1 decimal
      averageAnswerTime: parseFloat(averageAnswerTime.toFixed(1)), // Round to 1 decimal
    });
  }

  return {
    players: playersWithScores,
    questionResults: questionResults,
    totalPlayers: apiData.length,
  };
};


function SessionResults({ token, updateToken }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [processedData, setProcessedData] = useState({ players: [], questionResults: [], totalPlayers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const response = await axios.get(`${API_URL}/admin/session/${sessionId}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        console.log("Raw API Response:", response.data);
        
        // Pass response.data.results (the array) to the processor
        const processed = processApiResults(response.data.results);
        console.log("Processed Data:", processed);
        setProcessedData(processed);
        
      } catch (err) {
        console.error("Error fetching session results:", err);
        setError(err.response?.data?.error || 'Failed to fetch session results.');
        setProcessedData({ players: [], questionResults: [], totalPlayers: 0 }); // Reset data on error
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId, token]);

  // Logout handler for Navbar
  const handleLogout = () => {
    updateToken(null);
    navigate('/login');
  };

  // --- Prepare data for components (now uses processedData) ---

  const topPlayers = processedData.players
    ?.sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const chartLabels = processedData.questionResults?.map((q, index) => `Q${index + 1}`);

  const correctnessData = {
    labels: chartLabels,
    datasets: [
      {
        label: '% Correct',
        data: processedData.questionResults?.map(q => q.correctPercentage),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const answerTimeData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Average Answer Time (s)',
        data: processedData.questionResults?.map(q => q.averageAnswerTime),
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        }
      },
      tooltip: {
          callbacks: {
              label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                      label += ': ';
                  }
                  if (context.parsed.y !== null) {
                      // Add '%' for correctness chart, 's' for time chart
                      label += context.parsed.y + (context.dataset.label.includes('%') ? '%' : 's');
                  }
                  return label;
              }
          }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Add '%' for correctness chart y-axis
          callback: function(value, index, ticks) {
            return this.chart.options.plugins.title.text.includes('%') ? value + '%' : value;
          }
        }
      },
    },
  });