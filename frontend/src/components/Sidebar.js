import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/vehicles', label: 'Vehicles', icon: '🚛' },
  { path: '/drivers', label: 'Drivers', icon: '👤' },
  { path: '/alerts', label: 'Alerts', icon: '🔔' },
  { path: '/trips', label: 'Trips', icon: '🗺️' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' }, 
  { path: '/fuel', label: 'Fuel Analytics', icon: '⛽' },
  { path: '/reports', label: 'Reports', icon: '📄' },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  return (
    <div style={{ width: '220px', background: '#1a1f36', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 0', minHeight: '100vh' }}>
      <div style={{ padding: '0 20px 30px', borderBottom: '1px solid #2d3561' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>🚗 FleetOS</div>
        <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '4px' }}>LEC Fleet Management</div>
      </div>

      <nav style={{ padding: '20px 0', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px',
            color: location.pathname === item.path ? '#fff' : '#8892b0',
            background: location.pathname === item.path ? '#2d3561' : 'transparent',
            textDecoration: 'none', fontSize: '14px',
            borderLeft: location.pathname === item.path ? '3px solid #4f8ef7' : '3px solid transparent',
          }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #2d3561' }}>
        <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500', marginBottom: '4px' }}>{user?.name}</div>
        <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '12px' }}>{user?.role}</div>
        <button onClick={onLogout} style={{
          width: '100%', padding: '8px', background: '#e74c3c', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
        }}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;