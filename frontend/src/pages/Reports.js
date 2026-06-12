
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Reports() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
    axios.get('http://localhost:5000/api/trips').then(res => setTrips(res.data));
    axios.get('http://localhost:5000/api/maintenance').then(res => setMaintenance(res.data));
  }, []);

  const downloadFleetReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LEC Fleet Management - Fleet Report', 14, 20);
    doc.setFontSize(11);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Plate', 'Make', 'Model', 'Year', 'Type', 'Status', 'Fuel %', 'Mileage']],
      body: vehicles.map(v => [v.plate, v.make, v.model, v.year, v.type, v.status, v.fuel_level + '%', v.mileage + ' km']),
      headStyles: { fillColor: [79, 142, 247] },
    });
    doc.save('fleet-report.pdf');
  };

  const downloadTripsReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LEC Fleet Management - Trips Report', 14, 20);
    doc.setFontSize(11);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Vehicle', 'Driver', 'From', 'To', 'Date', 'Distance', 'Fuel Used']],
      body: trips.map(t => [t.plate, t.driver_name, t.start_location, t.end_location, new Date(t.start_time).toLocaleDateString(), t.distance + ' km', t.fuel_used + ' L']),
      headStyles: { fillColor: [46, 204, 113] },
    });
    doc.save('trips-report.pdf');
  };

  const downloadMaintenanceReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LEC Fleet Management - Maintenance Report', 14, 20);
    doc.setFontSize(11);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Vehicle', 'Type', 'Description', 'Scheduled Date', 'Cost', 'Status']],
      body: maintenance.map(m => [m.plate + ' - ' + m.make, m.type, m.description, new Date(m.scheduled_date).toLocaleDateString(), 'M ' + m.cost, m.status]),
      headStyles: { fillColor: [231, 76, 60] },
    });
    doc.save('maintenance-report.pdf');
  };

  const downloadDriversReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LEC Fleet Management - Drivers Report', 14, 20);
    doc.setFontSize(11);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Licence', 'Phone', 'Email', 'Status']],
      body: drivers.map(d => [d.name, d.licence_number, d.phone, d.email, d.status]),
      headStyles: { fillColor: [155, 89, 182] },
    });
    doc.save('drivers-report.pdf');
  };

  const reports = [
    { title: 'Fleet Report', description: 'All vehicles with status, fuel levels and mileage', color: '#4f8ef7', icon: '🚛', count: vehicles.length + ' vehicles', action: downloadFleetReport },
    { title: 'Trips Report', description: 'All trips with drivers, routes and fuel consumption', color: '#2ecc71', icon: '🗺️', count: trips.length + ' trips', action: downloadTripsReport },
    { title: 'Maintenance Report', description: 'All scheduled and completed maintenance records', color: '#e74c3c', icon: '🔧', count: maintenance.length + ' records', action: downloadMaintenanceReport },
    { title: 'Drivers Report', description: 'All drivers with licence numbers and contact details', color: '#9b59b6', icon: '👤', count: drivers.length + ' drivers', action: downloadDriversReport },
  ];

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#1a1f36', marginBottom: '8px' }}>Reports</h1>
      <p style={{ color: '#8892b0', marginBottom: '30px' }}>Generate and download PDF reports for your fleet.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {reports.map((report, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid ' + report.color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{report.icon}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1f36' }}>{report.title}</div>
                <div style={{ fontSize: '12px', color: report.color, fontWeight: '500' }}>{report.count}</div>
              </div>
            </div>
            <p style={{ color: '#8892b0', fontSize: '14px', marginBottom: '16px' }}>{report.description}</p>
            <button onClick={report.action} style={{
              background: report.color, color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500'
            }}>
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
