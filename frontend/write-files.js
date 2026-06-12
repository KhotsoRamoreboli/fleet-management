const fs = require('fs');

fs.writeFileSync('src/pages/Dashboard.js', `
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#4f8ef7', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
    axios.get('http://localhost:5000/api/alerts').then(res => setAlerts(res.data));
    axios.get('http://localhost:5000/api/trips').then(res => setTrips(res.data));
    axios.get('http://localhost:5000/api/maintenance').then(res => setMaintenance(res.data));
  }, []);

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const pendingMaintenance = maintenance.filter(m => m.status === 'scheduled').length;

  const vehicleStatusData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'active').length },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length },
    { name: 'Inactive', value: vehicles.filter(v => v.status === 'inactive').length },
  ].filter(d => d.value > 0);

  const fuelData = vehicles.map(v => ({ name: v.plate, fuel: parseFloat(v.fuel_level) }));

  const tripData = trips.slice(0, 5).map(t => ({
    name: t.plate,
    distance: parseFloat(t.distance),
    fuel: parseFloat(t.fuel_used)
  }));

  const metrics = [
    { label: 'Total Vehicles', value: vehicles.length, sub: activeVehicles + ' active', color: '#4f8ef7', bg: '#eef4ff', icon: '🚛' },
    { label: 'Drivers', value: drivers.length, sub: availableDrivers + ' available', color: '#2ecc71', bg: '#edfbf3', icon: '👤' },
    { label: 'Active Alerts', value: alerts.filter(a => !a.resolved).length, sub: criticalAlerts + ' critical', color: '#e74c3c', bg: '#fef0f0', icon: '🔔' },
    { label: 'Maintenance', value: maintenance.length, sub: pendingMaintenance + ' scheduled', color: '#f39c12', bg: '#fef9ec', icon: '🔧' },
    { label: 'Total Trips', value: trips.length, sub: trips.reduce((s, t) => s + parseFloat(t.distance || 0), 0).toFixed(0) + ' km', color: '#9b59b6', bg: '#f5eeff', icon: '🗺️' },
  ];

  return (
    <div style={{ padding: '30px', background: '#f5f6fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#1a1f36', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>Fleet Dashboard</h1>
        <p style={{ color: '#8892b0', fontSize: '14px' }}>{new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid ' + m.color, transition: 'transform 0.2s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#8892b0', marginBottom: '8px', fontWeight: '500' }}>{m.label}</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: m.color, lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '6px' }}>{m.sub}</div>
              </div>
              <div style={{ background: m.bg, borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{m.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        
        {/* Fuel Levels Chart */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36' }}>Fuel Levels</h2>
            <span style={{ fontSize: '12px', color: '#8892b0', background: '#f5f6fa', padding: '4px 10px', borderRadius: '99px' }}>All vehicles</span>
          </div>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={fuelData} barSize={28}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='name' tick={{ fontSize: 12, fill: '#8892b0' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#8892b0' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey='fuel' name='Fuel %' radius={[6, 6, 0, 0]}
                fill='url(#fuelGradient)' />
              <defs>
                <linearGradient id='fuelGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#4f8ef7' stopOpacity={1} />
                  <stop offset='100%' stopColor='#a8c8ff' stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Status Pie */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Vehicle Status</h2>
          <ResponsiveContainer width='100%' height={180}>
            <PieChart>
              <Pie data={vehicleStatusData} cx='50%' cy='50%' innerRadius={50} outerRadius={80} paddingAngle={4} dataKey='value'>
                {vehicleStatusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {vehicleStatusData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8892b0' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Trip Distance Chart */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Trip Distance vs Fuel</h2>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={tripData} barSize={20}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#8892b0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8892b0' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey='distance' name='Distance (km)' fill='#2ecc71' radius={[4, 4, 0, 0]} />
              <Bar dataKey='fuel' name='Fuel (L)' fill='#f39c12' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36' }}>Recent Alerts</h2>
            <span style={{ fontSize: '12px', background: '#fde8e8', color: '#e74c3c', padding: '3px 10px', borderRadius: '99px', fontWeight: '500' }}>{alerts.filter(a => !a.resolved).length} active</span>
          </div>
          {alerts.slice(0, 4).map(alert => (
            <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f5f6fa' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50', flexShrink: 0,
                background: alert.severity === 'critical' ? '#e74c3c' : alert.severity === 'warning' ? '#f39c12' : '#4f8ef7' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#1a1f36', fontWeight: '500' }}>{alert.message}</div>
                <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>{alert.type}</div>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                background: alert.resolved ? '#e8f8f0' : '#fde8e8',
                color: alert.resolved ? '#2ecc71' : '#e74c3c' }}>
                {alert.resolved ? 'resolved' : 'active'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Recent Trips */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Recent Trips</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              {['Vehicle','Route','Distance'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', color: '#8892b0', fontWeight: '500' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {trips.slice(0, 4).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f5f6fa' }}>
                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: '500', color: '#1a1f36' }}>{t.plate}</td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#8892b0' }}>{t.start_location} → {t.end_location}</td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#4f8ef7', fontWeight: '500' }}>{t.distance} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Maintenance */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1f36', marginBottom: '16px' }}>Upcoming Maintenance</h2>
          {maintenance.filter(m => m.status === 'scheduled').slice(0, 4).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f6fa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fef9ec', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔧</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1f36' }}>{m.plate} — {m.type}</div>
                  <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>M {m.cost}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#f39c12', fontWeight: '500' }}>{new Date(m.scheduled_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
`);

console.log('Dashboard.js written successfully!');