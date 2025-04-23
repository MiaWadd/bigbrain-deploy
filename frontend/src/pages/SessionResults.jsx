import { useState, useEffect } from 'react';
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

const getGame = async ({ sessionId }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/games`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (response.data && Array.isArray(response.data.games)) {
      const games = response.data.games;
      const game = games.filter(game => game.oldSessions.includes(Number(sessionId)));
      return game;
    } else {
      return [];
    }
  } catch {
    return [];
  } 
}
// --- Helper Function to Calculate Stats ---
const processApiResults = async (apiData, sessionId) => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { players: [], questionResults: [], totalPlayers: 0 };
  }
  // 0. Get game data
  const game = await getGame({ sessionId });

  // 1. Calculate Player Scores
  const playersWithScores =  apiData.map((player, index) => {
    if (game.length === 0) {
      return { ...player, score: parseFloat(0) };
    }
    let points = game[0].questions[index].points;
    let duration = game[0].questions[index].duration;
    const score = player.answers.reduce((acc, answer) => {      
      const start = new Date(answer.questionStartedAt);
      const end = new Date(answer.answeredAt);
      const timeTaken = ((end - start) / 1000).toFixed(2);
      const adjustedPoints = ((1 - ((timeTaken / duration) / 2)) * points).toFixed(2);
      return Number(acc) + Number(adjustedPoints);
    }, 0);
    return { ...player, score: parseFloat(score.toFixed(2)) }; 
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


function SessionResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [processedData, setProcessedData] = useState({ players: [], questionResults: [], totalPlayers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem('token');
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
        // Pass response.data.results (the array) to the processor
        const results = response.data.results
        const processed = await processApiResults(results, sessionId);
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
  }, [sessionId]);

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
          callback: function(value) {
            return this.chart.options.plugins.title.text.includes('%') ? value + '%' : value;
          }
        }
      },
    },
  });

  // --- Render component ---

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar showLogout={true} onLogout={() => {
        localStorage.setItem('token', '');
        navigate('/login');
      }} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Session Results</h1>
        <p className="mb-6 text-center text-gray-600">Session ID: {sessionId}</p>

        {loading && (
          <div className="text-center py-10">
            <p className="text-xl">Loading results...</p>
            {/* Optional: Add a spinner here */}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {/* Top 5 Players Table */}
            <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">Top 5 Players</h2>
              {topPlayers && topPlayers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topPlayers.map((player, index) => (
                      <tr key={player.name || index} className={index < 3 ? 'bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500">No player scores found.</p>
              )}
            </div>

            {/* Charts Section */}
            {processedData.questionResults && processedData.questionResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Correctness Chart */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <Bar options={chartOptions('Question Correctness (%)')} data={correctnessData} />
                </div>

                {/* Answer Time Chart */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <Line options={chartOptions('Average Answer Time (seconds)')} data={answerTimeData} />
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-700 py-6">No question analysis data available.</p>
            )}
            
            {/* Bonus Information */}
            <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
              <p className="text-gray-700">Total Players: <span className="font-medium">{processedData.totalPlayers}</span></p>
              {/* Add more summary stats here if available/calculable from data */}
            </div>

          </div>
        )}
        <p className='text-center mt-10'>
          Score Calculation: ( 1 - ( &#123;&nbsp;response time&nbsp; / &nbsp;question duration&nbsp;&#125;&nbsp; / 2 )) &nbsp;x&nbsp;&#123;&nbsp;points&nbsp;&#125;
        </p>
      </div>
    </div>
  );
}

export default SessionResults; 