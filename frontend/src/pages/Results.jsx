import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Results({ playerId }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState([]);

  // TODO: Update this
  playerId = 374173910;

  useEffect(() => {
    if (!playerId) {
      navigate('/join');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5005/play/${playerId}/results`
        );
        setResultsData(response.data);
      } catch (error) {
        if (error.response.data.error === 'Session has not started yet') {
          console.log('Redirect to lobby');
          navigate('/lobby');
        } else if (error.response.data.error === 'Session is ongoing, cannot get results yet') {
          console.log('Redirect to play');
          navigate('/play');
        } else {
          console.error(error);
          setError(error.response.data.error);
        }
      }
    };
    fetchResults();
  }, [playerId, navigate]);

  return (
    <>
      {error && (
        <div className="text-red-500 text-center font-semibold">{error}</div>
      )}
      <h1 className="text-5xl font-bold mb-20 mt-30 flex flex-col items-center justify-center">
        Your Results
      </h1>
      <div className="space-y-4 px-4 max-w-xl mx-auto">
        {resultsData.map((item, index) => {
          const start = new Date(item.questionStartedAt);
          const end = new Date(item.answeredAt);
          const timeTaken = ((end - start) / 1000).toFixed(2);
          return (
            <div key={index} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Question {index + 1}</p>
                <p>Time Taken: {timeTaken} seconds</p>
                <p>
                  Result:{' '}
                  <span className={item.correct ? 'text-green-600' : 'text-red-600'}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </p>
              </div>
              <div className="text-4xl font-bold text-right text-black">
                10 TODO
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
