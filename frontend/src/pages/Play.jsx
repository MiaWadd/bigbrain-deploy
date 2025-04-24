import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import CountdownTimer from '../components/QuestionCountdown';

const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single-choice',
  MULTIPLE_CHOICE: 'multiple-choice',
  JUDGEMENT: 'judgement',
};

function Play() {
  const navigate = useNavigate();
  // Game varaibles 
  const [playerId, setPlayerId] = useState('');
  const [gameHasStarted, setGameHasStarted] = useState(false);
  // Question variables
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState('');
  const [timesUp, setTimesUp] = useState(false);
  const [questionType, setQuestionType] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [currQuestion, setCurrQuestion] = useState(null);
  const [points, setPoints] = useState([]);
  const [duration, setDuration] = useState([]);
  const [error, setError] = useState(null);

  // If no playerId, redirect to join game
  useEffect(() => {
    if (!localStorage.getItem('playerId')) {
      navigate('/join');
    } else {
      setPlayerId(localStorage.getItem('playerId'));
    }
  }, [navigate]); 

  // Restore points and duration upon refresh
  useEffect(() => {
    const savedPoints = JSON.parse(localStorage.getItem('points') || '[]');
    const savedDuration = JSON.parse(localStorage.getItem('duration') || '[]');
    setPoints(savedPoints);
    setDuration(savedDuration);
  }, []);

  // Inital game load
  useEffect(() => {
    if (playerId) {
      loadGame();
    }
  }, [playerId]);

  const loadGame = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/status`);
      if (response.data.started) {
        setGameHasStarted(true);
        await loadQuestion();
      } else {
        setGameHasStarted(false);
        navigate('/lobby');
      }
    } catch (err) {
      console.log(err);
      console.log(playerId, err.response.data.error );
      console.log(err.response.data.error === "Session ID is not an active session");
      if (playerId && err.response.data.error === "Session ID is not an active session") {
        // Game is complete
        setGameHasStarted(false);
        navigate('/results');
      } else {
        navigate('/join');
      }
    }
  };

  // Load question every sesond to determine if the game has progressed
  useEffect(() => {
    if (!playerId || !gameHasStarted) return;
    const interval = setInterval(() => {
      loadQuestion();
    }, 1000);
    return () => clearInterval(interval);
  }, [playerId, gameHasStarted, currQuestion]);
  
  const loadQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/question`);
      const questionData = response.data.question;
      // If this is the first question or the question has changed, update variables
      if (!currQuestion || currQuestion.id !== questionData.id) {
        setCurrQuestion(questionData);
        const startTime = new Date(questionData.isoTimeLastQuestionStarted);
        setEndTime(new Date(startTime.getTime() + questionData.duration * 1000));
        setQuestion(questionData.text);
        setQuestionType(questionData.type);
        setSelectedAnswers([]);
        setCorrectAnswers([]);
        setTimesUp(false);
        if (questionData.type === 'judgement') {
          // Ensure False is index 0 and True is index 1
          setAnswers(['False', 'True']);
        } else {
          setAnswers(questionData.answers);
        }
        if (questionData.media.type === 'image') {
          setImage(questionData.media.url);
          setVideo('');
        } else if (questionData.media.type === 'youtube') {
          setVideo(questionData.media.url);
          setImage('');
        } else {
          setImage('');
          setVideo('');
        }
        const updatedPoints = [...points, questionData.points];
        const updatedDuration = [...duration, questionData.duration];
        setPoints(updatedPoints);
        setDuration(updatedDuration);
        localStorage.setItem('points', JSON.stringify(updatedPoints));
        localStorage.setItem('duration', JSON.stringify(updatedDuration));
      }
    } catch (err) {
      if (err.response.data.error === "Session has not started yet") {
        setGameHasStarted(false);
        navigate('/lobby');
      }
      // Game has completed
      if (err.response.data.error === "Session ID is not an active session" && gameHasStarted) {
        setGameHasStarted(false);
        navigate('/results');
      }
    }
  };
  

  const handleTimeUp = async () => {
    setError(null);
    setTimesUp(true);
    setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
        setCorrectAnswers(response.data.answers);
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  };

  const handleAnswerClick = async (selectedAnswer) => {
    setError(null);
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
    if (updatedSelection.length === 0) {
      setError('Must select at least one answer');
    } else {
      setSelectedAnswers(updatedSelection);
      try {
        await axios.put(`http://localhost:5005/play/${playerId}/answer`, {
          answers: updatedSelection,
        });
      } catch (error) {
        console.log(error);
      }
    }

    
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {playerId && (
        <>
          {gameHasStarted && (
            <>
              {endTime && <CountdownTimer endTime={endTime} onExpire={handleTimeUp} />}
              <div className="pt-30">
                {image && (	
                  <img src={image} alt="Image for question" className="mx-auto mt-6 max-w-xl max-h-96"/>
                )}
                {video && (	
                  <ReactPlayer 
                    url={video} 
                    playing={true} 
                    loop={true} 
                    controls={false} 
                    muted={true}
                    alt="Image for video" 
                    className="mx-auto mt-6 max-w-xl max-h-96"
                  />
                )}
                <h3 className="mt-5 text-center text-black text-4xl font-bold">{question}</h3>
                {questionType === QUESTION_TYPES.MULTIPLE_CHOICE && (
                  <p className='text-center'>(Select Multiple)</p>
                )}
                <div className="mt-6 flex flex-col gap-4 items-center">
                  {answers.map((answer, index) => {
                    const isSelected = selectedAnswers.includes(index);
                    const isCorrect = correctAnswers.includes(index);
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
                        onClick={() => !timesUp && handleAnswerClick(index)}
                        className={`${bgColor} ${baseStyle}`}
                        disabled={timesUp}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Play;
