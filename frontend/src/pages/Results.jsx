import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Results() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [points, setPoints] = useState(0);
  const [duration, setDuration] = useState(0);


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
      let points = new Array(response.data.length).fill(0);
      let duration = new Array(response.data.length).fill(1);
      try {
        points = JSON.parse(localStorage.getItem('points'));
        duration = JSON.parse(localStorage.getItem('duration')); 
      } catch {
        setError("Could not fetch results");
      }

      setPoints(points);
      setDuration(duration);
    } catch (error) {
      if (error?.response?.data?.error === 'Session has not started yet') {
        navigate('/lobby');
      } else if (error?.response?.data?.error === 'Session is ongoing, cannot get results yet') {
        navigate('/play');
      } else {
        setError(error?.response?.data?.error);
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
      <div className="text-5xl font-bold mb-10 mt-10 flex flex-col items-center justify-center">
      {(() => {
        let total = 0;
        resultsData.map((item, index) => {
          const start = new Date(item.questionStartedAt);
          const end = new Date(item.answeredAt);
          const timeTaken = ((end - start) / 1000).toFixed(2);
          let adv = ((1 - ((timeTaken / duration[index]) / 2)) * points[index]).toFixed(2);
          if (isNaN(adv) || !item.correct) {
            adv = 0;
          }
          total += parseFloat(adv);
        });
        return total;
      })()}
    </div>
      <div className="space-y-4 px-4 max-w-xl mx-auto">
        {resultsData.map((item, index) => {
          const start = new Date(item.questionStartedAt);
          const end = new Date(item.answeredAt);
          const timeTaken = ((end - start) / 1000).toFixed(2);
          const adv = ((1 - ((timeTaken / duration[index]) / 2)) * points[index]).toFixed(2);
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
      <p className='text-center mt-10'>
        Score Calculation: ( 1 - ( &#123;&nbsp;response time&nbsp; / &nbsp;question duration&nbsp;&#125;&nbsp; / 2 )) &nbsp;x&nbsp;&#123;&nbsp;points&nbsp;&#125;
      </p>
    </>
  );
}

export default Results;