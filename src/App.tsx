import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import { HomePage } from './pages/HomePage';
import { RoomPage } from './pages/RoomPage';

export function App() {
  /* Call useWebSocket ONE TIME here to persist between routes - very important */
  const websocketState = useWebSocket();

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage {...websocketState} />} />
        <Route path='/room/:roomId' element={<RoomPage {...websocketState} />} />
      </Routes>
    </Router>
  );
}
