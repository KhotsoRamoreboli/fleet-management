import React, { useEffect, useState } from "react";
import axios from "axios";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = () => {
    axios.get("http://localhost:5000/api/alerts").then(res => setAlerts(res.data));
  };

  const handleResolve = (id) => {
    axios.put(`http://localhost:5000/api/alerts/${id}/resolve`).then(fetchAlerts);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ marginBottom: "24px", color: "#1a1f36" }}>Alerts</h1>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", background: alert.severity === "critical" ? "#fde8e8" : "#fef3cd", color: alert.severity === "critical" ? "#e74c3c" : "#f39c12" }}>{alert.severity}</span>
              <div>
                <div style={{ fontSize: "14px", color: "#1a1f36" }}>{alert.message}</div>
                <div style={{ fontSize: "12px", color: "#8892b0" }}>{alert.type}</div>
              </div>
            </div>
            <div>
              {alert.resolved ? <span style={{ color: "#2ecc71" }}>Resolved</span> : <button onClick={() => handleResolve(alert.id)} style={{ background: "#e8f8f0", color: "#2ecc71", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>Mark Resolved</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;