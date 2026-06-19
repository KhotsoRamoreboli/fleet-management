import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Alerts from "./pages/Alerts";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Fuel from "./pages/Fuel";
import Reports from "./pages/Reports";
import Incidents from "./pages/Incidents";
import JobCards from "./pages/JobCards";
import Inspections from "./pages/Inspections";
import PoolBookings from "./pages/PoolBookings";
import Vendors from "./pages/Vendors";
import Documents from "./pages/Documents";
import ScheduledReports from "./pages/ScheduledReports";
import GPSTracking from "./pages/GPSTracking";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, overflow: "auto", background: "#f5f6fa" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/jobcards" element={<JobCards />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/poolbookings" element={<PoolBookings />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/scheduledreports" element={<ScheduledReports />} />
            <Route path="/gps" element={<GPSTracking />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;