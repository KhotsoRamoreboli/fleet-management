
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_id: '', driver_id: '', start_location: '', end_location: '', start_time: '', distance: '', fuel_used: '' });

  useEffect(() => {
    fetchTrips();
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
  }, []);

  const fetchTrips = () => {
    axios.get('http://localhost:5000/api/trips').then(res => setTrips(res.data));
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/trips', form).then(() => {
      fetchTrips();
      setShowForm(false);
      setForm({ vehicle_id: '', driver_id: '', start_location: '', end_location: '', start_time: '', distance: '', fuel_used: '' });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this trip?')) {
      axios.delete('http://localhost:5000/api/trips/' + id).then(fetchTrips);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1a1f36' }}>Trips</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#4f8ef7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>+ Log Trip</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px' }}>New Trip</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <option value=''>Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make}</option>)}
            </select>
            <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <option value=''>Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input placeholder='Start Location' value={form.start_location} onChange={e => setForm({ ...form, start_location: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input placeholder='End Location' value={form.end_location} onChange={e => setForm({ ...form, end_location: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input type='datetime-local' value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input placeholder='Distance (km)' value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
            <input placeholder='Fuel Used (L)' value={form.fuel_used} onChange={e => setForm({ ...form, fuel_used: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
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
            {['Vehicle','Driver','From','To','Date','Distance','Fuel Used','Status','Actions'].map(h => (
              <th key={h} style={{ padding: '10px', textAlign: 'left', color: '#8892b0', fontSize: '13px' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{t.plate}</td>
                <td style={{ padding: '10px' }}>{t.driver_name}</td>
                <td style={{ padding: '10px' }}>{t.start_location}</td>
                <td style={{ padding: '10px' }}>{t.end_location}</td>
                <td style={{ padding: '10px' }}>{new Date(t.start_time).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>{t.distance} km</td>
                <td style={{ padding: '10px' }}>{t.fuel_used} L</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', background: '#e8f8f0', color: '#2ecc71' }}>{t.status}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(t.id)} style={{ background: '#fde8e8', color: '#e74c3c', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Trips;
