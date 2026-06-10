import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Alerts from './pages/Alerts';
import Trips from './pages/Trips';
import './App.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'auto', background: '#f5f6fa' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/trips" element={<Trips />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;