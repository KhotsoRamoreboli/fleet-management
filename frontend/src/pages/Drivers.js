import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', licence_number: '', phone: '', email: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = () => {
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/drivers', form).then(() => {
      fetchDrivers();
      setShowForm(false);
      setForm({ name: '', licence_number: '', phone: '', email: '' });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this driver?')) {
      axios.delete(`http://localhost:5000/api/drivers/${id}`).then(fetchDrivers);
    }
  };

  const statusColor = (status) => {
    if (status === 'available') return { bg: '#e8f8f0', text: '#2ecc71' };
    if (status === 'on_trip') return { bg: '#e8f0fd', text: '#4f8ef7' };
    return { bg: '#fef3cd', text: '#f39c12' };
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1a1f36' }}>Drivers</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#4f8ef7', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
        }}>+ Add Driver</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1f36' }}>New Driver</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { field: 'name', label: 'Full Name' },
              { field: 'licence_number', label: 'Licence Number' },
              { field: 'phone', label: 'Phone' },
              { field: 'email', label: 'Email' },
            ].map(({ field, label }) => (
              <input key={field} placeholder={label}
                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px' }}
              />
            ))}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} style={{
              background: '#2ecc71', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
            }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{
              background: '#e0e0e0', color: '#333', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f6fa' }}>
              {['Name', 'Licence', 'Phone', 'Email', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#8892b0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{d.name}</td>
                <td style={{ padding: '10px' }}>{d.licence_number}</td>
                <td style={{ padding: '10px' }}>{d.phone}</td>
                <td style={{ padding: '10px' }}>{d.email}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '99px', fontSize: '12px',
                    background: statusColor(d.status).bg,
                    color: statusColor(d.status).text
                  }}>{d.status}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(d.id)} style={{
                    background: '#fde8e8', color: '#e74c3c', border: 'none',
                    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Drivers;