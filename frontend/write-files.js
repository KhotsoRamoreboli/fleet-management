const fs = require('fs');

fs.writeFileSync('src/pages/Dashboard.js', `
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
    axios.get('http://localhost:5000/api/alerts').then(res => setAlerts(res.data));
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#1a1f36', marginBottom: '24px' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #4f8ef7' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f8ef7' }}>{vehicles.length}</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Total Vehicles</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #2ecc71' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>{drivers.length}</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Total Drivers</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #e74c3c' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>{alerts.filter(a => !a.resolved).length}</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Active Alerts</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '16px', color: '#1a1f36' }}>Fleet Overview</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f5f6fa' }}>
            <th style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>Plate</th>
            <th style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>Make</th>
            <th style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>Model</th>
            <th style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>Fuel</th>
          </tr></thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{v.plate}</td>
                <td style={{ padding: '10px' }}>{v.make}</td>
                <td style={{ padding: '10px' }}>{v.model}</td>
                <td style={{ padding: '10px' }}><span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', background: v.status === 'active' ? '#e8f8f0' : '#fef3cd', color: v.status === 'active' ? '#2ecc71' : '#f39c12' }}>{v.status}</span></td>
                <td style={{ padding: '10px' }}>{v.fuel_level}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
`);

console.log('Dashboard.js written successfully!');