import { useState, useEffect } from 'react';

function CountdownTimer({ endTime, onExpire }) {
  const calculateSecondsLeft = () => Math.max(0, Math.floor((new Date(endTime) - new Date()) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft());
  const [hasExpired, setHasExpired] = useState(false);

  // Reset the countdown when the question changes
  useEffect(() => {
    setSecondsLeft(calculateSecondsLeft());
    setHasExpired(false);
  }, [endTime]);

  useEffect(() => {
    if (hasExpired) return;
    // Handle Time up when countdown ends
    if (secondsLeft <= 0) {
      setHasExpired(true);
      onExpire();
      return;
    }
    // Update count every second
    const interval = setInterval(() => {
      const updated = calculateSecondsLeft();
      setSecondsLeft(updated);
      if (updated <= 0) {
        setHasExpired(true);
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  } , [secondsLeft, endTime, onExpire, hasExpired]);

  return (
    <div className="absolute top-20 right-4 px-6 py-3 text-black text-8xl font-extrabold z-50">
      {secondsLeft <= 3 ? (
        <span className="text-red-600">{secondsLeft}</span>
      ) : (
        secondsLeft
      )}
    </div>
  );
}

export default CountdownTimer; 
  