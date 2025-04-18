import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single-choice',
  MULTIPLE_CHOICE: 'multiple-choice',
  JUDGEMENT: 'judgement',
};

// Adds countdown to top right of screen
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
  // Game varaibles 
  const [playerValid, setPlayerValid] = useState(false);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  // Question variables
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState('');
  const [timesUp, setTimesUp] = useState(false);
  const [questionType, setQuestionType] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  // playerId = 374173910; //TODO update
  // If no playerId, redirect to join game
  useEffect(() => {
    if (!localStorage.getItem('playerId')) {
    // if (!playerId) {
      console.log("no playerID");
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
      console.log(response.data)
      if (response.data.started) {
        try {
          const response = await axios.get(`http://localhost:5005/play/${playerId}/question`);
          console.log(response);
          setGameHasStarted(true);
          setDuration(response.data.question.duration);
          setImage("./assets.react.svg"); // TODO CHAGE
          setQuestion(response.data.question.text);   
          setQuestionType(response.data.question.type);  
          if (response.data.question.type === 'judgement') {
            setAnswers(['True', "False"]);
          } else {
            setAnswers(response.data.question.answers);
          }    
        } catch (err) {
          console.log(err);
          if (err.response.data.error === "Session has not started yet") {
            setGameHasStarted(false);
            navigate('/lobby');
          }
        }
      } else {

        console.log("Game has not started.. need to play around to find out when this is");
        setGameHasStarted(false);
        navigate('/lobby');
      }
    } catch {
      // Player is not a part of the game
      navigate('/join');
    }
  };

  const handleTimeUp = async () => {
    console.log("Time's up! Locking in answer / showing result.");
    setTimesUp(true);
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      console.log(response.data.answerIds);
      setCorrectAnswers(response.data.answerIds);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnswerClick = async (selectedAnswer) => {
    let updatedSelection = [];
    // If it is  single choice or judegment question, change the selected answer by either removing an already selected or selecting a new one
    if (questionType === QUESTION_TYPES.SINGLE_CHOICE || questionType === QUESTION_TYPES.JUDGEMENT) {
      if (selectedAnswers.includes(selectedAnswer)) {
        updatedSelection = [];
      } else {
        updatedSelection = [selectedAnswer];
      }
    } else {
      // If it is multiple choice, either add to the list of asnwers, or remove if it was already selected
      if (selectedAnswers.includes(selectedAnswer)) {
        updatedSelection = selectedAnswers.filter(a => a !== selectedAnswer);
      } else {
        updatedSelection = selectedAnswers.concat(selectedAnswer);
      }
    }
    setSelectedAnswers(updatedSelection);
    try {
      await axios.put(`http://localhost:5005/play/${playerId}/answer`, {
        answers: updatedSelection,
      });
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
                <img src={image} alt="Image for question" className="mx-auto mt-6 max-w-xl max-h-96"/>
              )}
              <h3 className="mt-5 text-center text-black text-4xl font-bold">{question}</h3>
              <div className="mt-6 flex flex-col gap-4 items-center">
                {answers.map((answer, index) => {
                  const isSelected = selectedAnswers.includes(answer);
                  const isCorrect = correctAnswers.includes(answer);
                  let baseStyle = "text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 w-3/4 max-w-xl";
                  let bgColor = "bg-blue-600 hover:bg-blue-700";
                  if (timesUp && isCorrect) {
                    bgColor = "bg-green-600";
                  } else if (isSelected) {
                    bgColor = "bg-blue-800";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !timesUp && handleAnswerClick(answer)}
                      className={`${bgColor} ${baseStyle}`}
                      disabled={timesUp}
                    >
                      {answer}
                    </button>
                  );
                })}
              </div>
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
