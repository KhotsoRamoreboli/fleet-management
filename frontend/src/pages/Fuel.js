
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Fuel() {
  const [levels, setLevels] = useState([]);
  const [consumption, setConsumption] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/fuel/levels').then(res => setLevels(res.data));
    axios.get('http://localhost:5000/api/fuel/consumption').then(res => setConsumption(res.data));
  }, []);

  const totalFuel = consumption.reduce((sum, v) => sum + parseFloat(v.total_fuel || 0), 0);
  const totalDistance = consumption.reduce((sum, v) => sum + parseFloat(v.total_distance || 0), 0);
  const totalTrips = consumption.reduce((sum, v) => sum + parseInt(v.total_trips || 0), 0);

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#1a1f36', marginBottom: '24px' }}>Fuel Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #4f8ef7' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f8ef7' }}>{totalFuel.toFixed(1)} L</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Total Fuel Used</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #2ecc71' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>{totalDistance.toFixed(0)} km</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Total Distance</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #9b59b6' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9b59b6' }}>{totalTrips}</div>
          <div style={{ color: '#8892b0', marginTop: '4px' }}>Total Trips</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', color: '#1a1f36', marginBottom: '16px' }}>Fuel Levels by Vehicle</h2>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={levels}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='plate' />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey='fuel_level' fill='#4f8ef7' name='Fuel Level %' />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', color: '#1a1f36', marginBottom: '16px' }}>Fuel Consumed per Vehicle</h2>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={consumption}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='plate' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='total_fuel' fill='#2ecc71' name='Fuel Used (L)' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', color: '#1a1f36', marginBottom: '16px' }}>Vehicle Fuel Summary</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f5f6fa' }}>
            {['Vehicle','Total Trips','Total Distance','Fuel Used','Avg per Trip'].map(h => (
              <th key={h} style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {consumption.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{v.plate} - {v.make}</td>
                <td style={{ padding: '10px' }}>{v.total_trips}</td>
                <td style={{ padding: '10px' }}>{v.total_distance} km</td>
                <td style={{ padding: '10px' }}>{parseFloat(v.total_fuel).toFixed(1)} L</td>
                <td style={{ padding: '10px' }}>{(v.total_fuel / v.total_trips).toFixed(1)} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Fuel;
