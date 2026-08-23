import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import AIAssistantModal from './components/AIAssistantModal';
import { setCredentials } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    // Persistent Session Rehydration (Do not clear unless explicit logout)
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, token, accessToken: token }));
      } catch (e) {
        console.error('Session rehydration error:', e);
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-emerald-50/40 font-sans text-emerald-950">
        <Navbar onOpenAiAssistant={() => setIsAiModalOpen(true)} />
        <AIAssistantModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
        <main className="flex-1">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;