import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CountdownTimer({ duration, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
        return;
    }
  
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);
  
  return (
		<>
			<div className="absolute top-20 right-4 px-6 py-3 text-black text-8xl font-extrabold z-50">
    		{secondsLeft}
  		</div>
		</>
	);
}


function Play({ playerId }) {
  const navigate = useNavigate();
  const [playerValid, setPlayerValid] = useState(false);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState('');
  const [timesUp, setTimesUp] = useState(false);

  playerId = 130896241;
  useEffect(() => {
    // if (!localStorage.getItem('playerId')) {
			if (!playerId) {
      alert("Please join a game first");
      navigate('/join');
    } else {
      setPlayerValid(true);
    }
  }, [navigate]); 

  useEffect(() => {
    if (playerValid && playerId) {
      currState();
    }
  }, [playerValid, playerId]);

  const currState = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/status`);
      console.log(response.data.started);
      if (response.data.started) {
        console.log("get question number");
        try {
                const response = await axios.get(`http://localhost:5005/play/${playerId}/question`, {
                });
                console.log(response.data);
                setGameHasStarted(true);
                setDuration(response.data.question.duration);
                setImage("./assets.react.svg");
                setAnswers(response.data.question.answers);
                setQuestion(response.data.question.question);           

              } catch (err) {
                if (err.response.data.error === "Session has not started yet") {
                    setGameHasStarted(false);
                }
                console.log(err);
                // alert(err.response.data.error);
              }
              
        // Make the API call to fetch question number or anything else you need
      }
    } catch (err) {
        console.log("invaid game go to join game");
      console.log(err);
      alert(err.response.data.error);
			navigate('/join');
    }
  };

  const handleTimeUp = async () => {
    console.log("Time's up! Locking in answer / showing result.");
    setTimesUp(true);
    try {
        const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`)
        console.log(response.data.answerIds);
    } catch (error) {
         console.log(error);
    }
    // You can lock UI, or send final answer here
  };

  const handleAnswerClick = async (selectedAnswer) => {
    console.log("Selected answer:", selectedAnswer);
    // Send answer to server here using axios.post(...)
    try {
        const response = await axios.put(`http://localhost:5005/play/${playerId}/answer`, {
            answers: [ "answer 1" ],
        });
        console.log(response);
    } catch (error) {
         console.log(error);
    }

  };

  return (
    <>
    {playerValid && (
      <>
        {gameHasStarted ? (
          <>
            <CountdownTimer duration={duration} onExpire={handleTimeUp} />
            {image && (
                <img
                src={image}
                alt="Question visual"
                className="mx-auto mt-6 max-w-xl max-h-96"
                />
            )}
             <h3 className="mt-5 text-center text-black text-4xl font-bold">{question}</h3>

            {!timesUp && (
                // {answers.length > 0 && (
                    <div className="mt-6 flex flex-col gap-4 items-center">
                {answers.map((answer, idx) => (
                <button
                    key={idx}
                    onClick={() => handleAnswerClick(answer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 w-3/4 max-w-xl"
                >
                    {answer}
                </button>
                ))}
            </div>
)}
            {/* )} */}
            
          </>
        ) : (
          <p className="text-center text-2xl font-semibold mt-10">Waiting for game to start ...</p>
        )}
      </>
    )}
  </>
  );
}

export default Play;

