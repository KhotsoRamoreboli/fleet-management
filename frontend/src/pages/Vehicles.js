
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: '', make: '', model: '', year: '', type: '' });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = () => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/vehicles', form).then(() => {
      fetchVehicles();
      setShowForm(false);
      setForm({ plate: '', make: '', model: '', year: '', type: '' });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this vehicle?')) {
      axios.delete('http://localhost:5000/api/vehicles/' + id).then(fetchVehicles);
    }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#1a1f36', marginBottom: '4px' }}>Vehicles</h1>
          <p style={{ color: '#8892b0', fontSize: '14px' }}>{filtered.length} of {vehicles.length} vehicles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#4f8ef7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>+ Add Vehicle</button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8892b0' }}>🔍</span>
          <input placeholder='Search by plate, make or model...' value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#1a1f36', background: '#fff' }}>
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='maintenance'>Maintenance</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1f36' }}>New Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {['plate', 'make', 'model', 'year', 'type'].map(field => (
              <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px' }} />
            ))}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8892b0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div>No vehicles found matching your search.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              {['Plate','Make','Model','Year','Type','Status','Fuel %','Mileage','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#8892b0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f5f6fa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#1a1f36' }}>{v.plate}</td>
                  <td style={{ padding: '12px', color: '#1a1f36' }}>{v.make}</td>
                  <td style={{ padding: '12px', color: '#1a1f36' }}>{v.model}</td>
                  <td style={{ padding: '12px', color: '#8892b0' }}>{v.year}</td>
                  <td style={{ padding: '12px', color: '#8892b0' }}>{v.type}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500',
                      background: v.status === 'active' ? '#e8f8f0' : v.status === 'maintenance' ? '#fef3cd' : '#fde8e8',
                      color: v.status === 'active' ? '#2ecc71' : v.status === 'maintenance' ? '#f39c12' : '#e74c3c'
                    }}>{v.status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '99px', height: '6px', minWidth: '60px' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: v.fuel_level + '%',
                          background: v.fuel_level > 50 ? '#2ecc71' : v.fuel_level > 25 ? '#f39c12' : '#e74c3c' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#8892b0', minWidth: '36px' }}>{v.fuel_level}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#8892b0' }}>{v.mileage} km</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDelete(v.id)} style={{ background: '#fde8e8', color: '#e74c3c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Vehicles;
