import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedLayout from './Protected';
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