
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', licence_number: '', phone: '', email: '' });

  useEffect(() => { fetchDrivers(); }, []);

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
      axios.delete('http://localhost:5000/api/drivers/' + id).then(fetchDrivers);
    }
  };

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licence_number.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusStyle = (status) => {
    if (status === 'available') return { bg: '#e8f8f0', text: '#2ecc71' };
    if (status === 'on_trip') return { bg: '#e8f0fd', text: '#4f8ef7' };
    return { bg: '#fef3cd', text: '#f39c12' };
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#1a1f36', marginBottom: '4px' }}>Drivers</h1>
          <p style={{ color: '#8892b0', fontSize: '14px' }}>{filtered.length} of {drivers.length} drivers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#4f8ef7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>+ Add Driver</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8892b0' }}>🔍</span>
          <input placeholder='Search by name, licence or email...' value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#1a1f36', background: '#fff' }}>
          <option value='all'>All Status</option>
          <option value='available'>Available</option>
          <option value='on_trip'>On Trip</option>
          <option value='off_duty'>Off Duty</option>
        </select>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1f36' }}>New Driver</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[{field:'name',label:'Full Name'},{field:'licence_number',label:'Licence Number'},{field:'phone',label:'Phone'},{field:'email',label:'Email'}].map(({field, label}) => (
              <input key={field} placeholder={label} value={form[field]}
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
            <div>No drivers found matching your search.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              {['Name','Licence','Phone','Email','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#8892b0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f5f6fa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#1a1f36' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#e8f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#4f8ef7' }}>
                        {d.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()}
                      </div>
                      {d.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#8892b0' }}>{d.licence_number}</td>
                  <td style={{ padding: '12px', color: '#1a1f36' }}>{d.phone}</td>
                  <td style={{ padding: '12px', color: '#8892b0' }}>{d.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500',
                      background: statusStyle(d.status).bg, color: statusStyle(d.status).text }}>{d.status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDelete(d.id)} style={{ background: '#fde8e8', color: '#e74c3c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Delete</button>
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

export default Drivers;
