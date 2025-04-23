import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Results() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('playerId')) {
      navigate('/join');
    } else {
      setPlayerId(localStorage.getItem('playerId'));
    }
  }, [navigate]); 

  useEffect(() => {
    if (playerId) {
      fetchResults();
    }
  }, [playerId]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/play/${playerId}/results`
      );
      setResultsData(response.data);
    } catch (error) {
      if (error.response.data.error === 'Session has not started yet') {
        navigate('/lobby');
      } else if (error.response.data.error === 'Session is ongoing, cannot get results yet') {
        navigate('/play');
      } else {
        console.error(error);
        setError(error.response.data.error);
      }
    }
  };

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
          const points = JSON.parse(localStorage.getItem('points'))[index];
          const duration = JSON.parse(localStorage.getItem('duration'))[index]; 
          const adv = ((1 - ((timeTaken / duration) / 2)) * points).toFixed(2);
          return (
            <div key={index} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Question {index + 1}</p>
                <p>Time Taken: {timeTaken} seconds</p>
                <p>
                  Result:{' '}
                  <span className={item.correct ? 'text-green-800' : 'text-red-800'}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </p>
              </div>
              <div className="text-4xl font-bold text-right text-black">
                {item.correct? adv : 0}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Results;