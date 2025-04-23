// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import EditGame from './pages/EditGame';
// import EditQuestion from './pages/EditQuestion';
// import Join from './pages/Join';
// import Lobby from './pages/Lobby';
// import SessionControl from './pages/SessionControl';
// import Play from './pages/Play';
// import Results from './pages/Results';
// import SessionResults from './pages/SessionResults';
// import PastSessions from './pages/PastSessions';


// function App() {
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   // Function to update token
//   const updateToken = (newToken) => {
//     if (newToken) {
//       localStorage.setItem('token', newToken);
//     } else {
//       localStorage.removeItem('token');
//     }
//     setToken(newToken);
//   };

//   // Check token on mount
//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []);

//   return (
//     <Router>
//       <Routes>
//         {/* Public */}
//         <Route 
//           path="/login" 
//           element={<Login updateToken={updateToken} token={token} />} 
//         />
//         <Route 
//           path="/register" 
//           element={<Register updateToken={updateToken} token={token} />} 
//         />
//         <Route path="/join" element={<Join />} />
//         <Route path="/lobby" element={<Lobby />} />
//         <Route path="/play" element={<Play />} />
//         <Route path="/results" element={<Results />} />
//         <Route 
//           path="/session/:sessionId" 
//           element={
//             token ? (
//               <SessionControl token={token} updateToken={updateToken} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         {/* Protected */}
//         <Route 
//           path="/dashboard" 
//           element={
//             token ? (
//               <Dashboard />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route 
//           path="/game/:gameId" 
//           element={
//             token ? (
//               <EditGame token={token} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route 
//           path="/game/:gameId/question/:questionId" 
//           element={
//             token ? (
//               <EditQuestion token={token} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route 
//           path="/game/:gameId/sessions" 
//           element={
//             token ? (
//               <PastSessions token={token} updateToken={updateToken} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route 
//           path="/session/:sessionId/results" 
//           element={
//             token ? (
//               <SessionResults token={token} updateToken={updateToken} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route path="/" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedLayout from './Protected'; // 👈 import this
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditGame from './pages/EditGame';
import EditQuestion from './pages/EditQuestion';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import SessionControl from './pages/SessionControl';
import Play from './pages/Play';
import Results from './pages/Results';
import SessionResults from './pages/SessionResults';
import PastSessions from './pages/PastSessions';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<Join />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/play" element={<Play />} />
        <Route path="/results" element={<Results />} />

        {/* Protected routes go under ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:gameId" element={<EditGame />} />
          <Route path="/game/:gameId/question/:questionId" element={<EditQuestion />} />
          <Route path="/game/:gameId/sessions" element={<PastSessions />} />
          <Route path="/session/:sessionId" element={<SessionControl />} />
          <Route path="/session/:sessionId/results" element={<SessionResults />} />
        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;