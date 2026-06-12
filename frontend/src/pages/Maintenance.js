
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_id: '', type: '', description: '', scheduled_date: '', cost: '' });

  useEffect(() => {
    fetchRecords();
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
  }, []);

  const fetchRecords = () => {
    axios.get('http://localhost:5000/api/maintenance').then(res => setRecords(res.data));
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/maintenance', form).then(() => {
      fetchRecords();
      setShowForm(false);
      setForm({ vehicle_id: '', type: '', description: '', scheduled_date: '', cost: '' });
    });
  };

  const handleComplete = (id) => {
    axios.put('http://localhost:5000/api/maintenance/' + id + '/complete').then(fetchRecords);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this record?')) {
      axios.delete('http://localhost:5000/api/maintenance/' + id).then(fetchRecords);
    }
  };

  const statusStyle = (status) => {
    if (status === 'completed') return { bg: '#e8f8f0', text: '#2ecc71' };
    if (status === 'in_progress') return { bg: '#e8f0fd', text: '#4f8ef7' };
    return { bg: '#fef3cd', text: '#f39c12' };
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1a1f36' }}>Maintenance</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#4f8ef7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>+ Schedule Service</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px' }}>New Maintenance Record</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <option value=''>Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make}</option>)}
            </select>
            <input placeholder='Service Type' value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input placeholder='Cost (M)' value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input type='date' value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input placeholder='Description' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', gridColumn: 'span 2' }} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f5f6fa' }}>
            {['Vehicle','Type','Description','Scheduled Date','Cost','Status','Actions'].map(h => (
              <th key={h} style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{r.plate} - {r.make}</td>
                <td style={{ padding: '10px' }}>{r.type}</td>
                <td style={{ padding: '10px', color: '#8892b0', fontSize: '13px' }}>{r.description}</td>
                <td style={{ padding: '10px' }}>{new Date(r.scheduled_date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>M {r.cost}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', background: statusStyle(r.status).bg, color: statusStyle(r.status).text }}>{r.status}</span>
                </td>
                <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                  {r.status !== 'completed' && (
                    <button onClick={() => handleComplete(r.id)} style={{ background: '#e8f8f0', color: '#2ecc71', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Complete</button>
                  )}
                  <button onClick={() => handleDelete(r.id)} style={{ background: '#fde8e8', color: '#e74c3c', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Maintenance;
