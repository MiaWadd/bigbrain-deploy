import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';


// A unique route must exist for this screen
// A user is able to enter a session by either:

// Navigating to a pre-determined URL they know about, then entering a session ID that an admin provides; or
// TODO Just following a URL the admin provides that includes the session ID in it


// After players are there, they need to enter their own name to attempt to join the session. If successful, they're taken to 2.4.2.
// TODO -> verifiy name?


function JoinGame({ joinSession }) {
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const location = useLocation();

  const [error, setError] = useState(null);

  // If URL already has sessionId, populate it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionFromURL = params.get('sessionId');
    if (sessionFromURL) {
      setSessionId(sessionFromURL);
    }
  }, [location]);

  const joinGame = async (e) => {
    e.preventDefault();
    try {
      let sessionId = '938344'; //TODO Update
      const response = await axios.post(`http://localhost:5005/play/join/${sessionId}`, {
        name: name,
      });
      joinSession(response.data.playerId);
    } catch (err) {
      if (err.response.data.error === "Session ID is not an active session") {
        setError('Session ID is not vaild');
      } else {
        setError(err.response.data.error);
      }
    }
  }
  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className=" mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-10 mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <div className='w-full'>
          <h1 className="text-3xl text-center font-large text-black dark:text-white">Join a Game</h1>   
          <form onSubmit={joinGame}>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Session ID</label>
              <input
                value={sessionId} 
                onChange={e => setSessionId(e.target.value)}
                required
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Name</label>
              <input
                value={name} 
                onChange={e => setName(e.target.value)}
                required
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button type='submit' className="mt-5 px-4 py-2 w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600" >{"Join Game"}</button>
          </form>          
        </div>
      </div>
    </>
  )
}

export default JoinGame;