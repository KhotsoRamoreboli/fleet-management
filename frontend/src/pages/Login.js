
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', width: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚗</div>
          <h1 style={{ color: '#1a1f36', fontSize: '24px', marginBottom: '4px' }}>FleetOS</h1>
          <p style={{ color: '#8892b0', fontSize: '14px' }}>LEC Fleet Management System</p>
        </div>

        {error && (
          <div style={{ background: '#fde8e8', color: '#e74c3c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#1a1f36', fontWeight: '500', marginBottom: '6px' }}>Email</label>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='admin@lec.co.ls'
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#1a1f36', fontWeight: '500', marginBottom: '6px' }}>Password</label>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Enter your password'
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '12px', background: '#4f8ef7', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

export default Login;
