
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MentalHealthPlatform from './components/MentalHealthPlatform';
import TherapistChatSession from './components/TherapistChatSession';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="bg-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">AI Mental Health Platform</h1>
            <div className="space-x-4">
              <Link 
                to="/" 
                className="hover:bg-purple-700 px-3 py-2 rounded transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={() => {
                  const width = 800;
                  const height = 600;
                  const left = (window.screen.width - width) / 2;
                  const top = (window.screen.height - height) / 2;
                  window.open(
                    '/therapist-chat',
                    'TherapistChatSession',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                  );
                }}
                className="hover:bg-purple-700 px-3 py-2 rounded transition-colors cursor-pointer"
              >
                Chat Session
              </button>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<MentalHealthPlatform />} />
          <Route path="/chat" element={<TherapistChatSession />} />
          <Route path="/therapist-chat" element={<TherapistChatSession />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;