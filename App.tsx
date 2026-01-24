import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { DailyRecord } from './pages/DailyRecord';
import { Archive } from './pages/Archive';

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<DailyRecord />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
