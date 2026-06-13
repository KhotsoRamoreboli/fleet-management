import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DISTRICTS = ["Maseru", "Leribe", "Berea", "Butha-Buthe", "Mokhotlong", "Thaba-Tseka", "Qacha's Nek", "Quthing", "Mohale's Hoek", "Mafeteng"];
const INCIDENT_TYPES = ["Accident", "Breakdown", "Damage", "Misuse", "Theft", "Other"];
const STATUS_COLORS = { reported: "#f39c12", under_investigation: "#4f8ef7", closed: "#2ecc71" };
const TYPE_COLORS = ["#e74c3c", "#f39c12", "#4f8ef7", "#9b59b6", "#2ecc71", "#1abc9c"];

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trends, setTrends] = useState({ byType: [], byDistrict: [], byStatus: [] });
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [form, setForm] = useState({
    vehicle_id: "", driver_id: "", incident_type: "", incident_date: "",
    location: "", district: "", description: "", police_report_ref: "",
    third_party_details: "", repair_cost: "", towing_cost: "",
    assessment_cost: "", excess_cost: "", third_party_cost: "", insurance_claim_ref: ""
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/incidents").then(res => setIncidents(res.data));
    axios.get("http://localhost:5000/api/incidents/stats/trends").then(res => setTrends(res.data));
    axios.get("http://localhost:5000/api/vehicles").then(res => setVehicles(res.data));
    axios.get("http://localhost:5000/api/drivers").then(res => setDrivers(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/incidents", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ vehicle_id: "", driver_id: "", incident_type: "", incident_date: "", location: "", district: "", description: "", police_report_ref: "", third_party_details: "", repair_cost: "", towing_cost: "", assessment_cost: "", excess_cost: "", third_party_cost: "", insurance_claim_ref: "" });
    });
  };

  const handleStatusUpdate = (id, status, notes) => {
    axios.put("http://localhost:5000/api/incidents/" + id + "/status", { status, investigation_notes: notes }).then(fetchAll);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this incident?")) {
      axios.delete("http://localhost:5000/api/incidents/" + id).then(fetchAll);
    }
  };

  const totalCost = (inc) => (parseFloat(inc.repair_cost || 0) + parseFloat(inc.towing_cost || 0) + parseFloat(inc.assessment_cost || 0) + parseFloat(inc.excess_cost || 0) + parseFloat(inc.third_party_cost || 0));
  const grandTotal = incidents.reduce((sum, i) => sum + totalCost(i), 0);

  const tabStyle = (tab) => ({
    padding: "8px 20px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0",
    fontWeight: activeTab === tab ? "600" : "400",
    background: activeTab === tab ? "#fff" : "transparent",
    color: activeTab === tab ? "#1a1f36" : "#8892b0", fontSize: "14px"
  });

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Incident Management</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{incidents.length} incidents recorded &bull; Total cost: M {grandTotal.toFixed(2)}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Report Incident</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Incidents", value: incidents.length, color: "#e74c3c", icon: "🚨" },
          { label: "Under Investigation", value: incidents.filter(i => i.status === "under_investigation").length, color: "#4f8ef7", icon: "🔍" },
          { label: "Reported", value: incidents.filter(i => i.status === "reported").length, color: "#f39c12", icon: "📋" },
          { label: "Total Cost", value: "M " + grandTotal.toFixed(0), color: "#9b59b6", icon: "💰" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
                <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
              </div>
              <span style={{ fontSize: "24px" }}>{m.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Report New Incident</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
            </select>
            <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.incident_type} onChange={e => setForm({ ...form, incident_type: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Incident Type</option>
              {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="datetime-local" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Location / Address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Police Report Ref (if applicable)" value={form.police_report_ref} onChange={e => setForm({ ...form, police_report_ref: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Insurance Claim Ref" value={form.insurance_claim_ref} onChange={e => setForm({ ...form, insurance_claim_ref: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
          </div>
          <textarea placeholder="Description of incident..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "80px", boxSizing: "border-box" }} />
          <textarea placeholder="Third party details (name, vehicle, contact)..." value={form.third_party_details} onChange={e => setForm({ ...form, third_party_details: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "60px", boxSizing: "border-box" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {[["repair_cost","Repair Cost (M)"],["towing_cost","Towing Cost (M)"],["assessment_cost","Assessment (M)"],["excess_cost","Excess (M)"],["third_party_cost","Third Party (M)"]].map(([field, label]) => (
              <input key={field} placeholder={label} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>Submit Report</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "0", borderBottom: "2px solid #e0e0e0" }}>
        {[["list","Incident List"],["trends","Trend Analysis"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      {activeTab === "list" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Date","Vehicle","Driver","Type","Location","District","Status","Total Cost","Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} style={{ borderBottom: "1px solid #f5f6fa" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{new Date(inc.incident_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{inc.plate} - {inc.make}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>{inc.driver_name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500",
                      background: inc.incident_type === "Accident" ? "#fde8e8" : inc.incident_type === "Breakdown" ? "#fef3cd" : "#e8f0fd",
                      color: inc.incident_type === "Accident" ? "#e74c3c" : inc.incident_type === "Breakdown" ? "#f39c12" : "#4f8ef7"
                    }}>{inc.incident_type}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.location}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>{inc.district}</td>
                  <td style={{ padding: "12px" }}>
                    <select value={inc.status} onChange={e => handleStatusUpdate(inc.id, e.target.value, inc.investigation_notes)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "12px",
                        background: inc.status === "closed" ? "#e8f8f0" : inc.status === "under_investigation" ? "#e8f0fd" : "#fef3cd",
                        color: STATUS_COLORS[inc.status] }}>
                      <option value="reported">Reported</option>
                      <option value="under_investigation">Under Investigation</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>M {totalCost(inc).toFixed(2)}</td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(inc.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "trends" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Incidents by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends.byType} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="incident_type" tick={{ fontSize: 12, fill: "#8892b0" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#8892b0" }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {trends.byType.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Incidents by District</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends.byDistrict} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="district" tick={{ fontSize: 12, fill: "#8892b0" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#8892b0" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#e74c3c" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Cost by Incident Type</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Type","Count","Total Cost","Avg Cost"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {trends.byType.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f5f6fa" }}>
                    <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{t.incident_type}</td>
                    <td style={{ padding: "12px", color: "#8892b0" }}>{t.count}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>M {parseFloat(t.total_cost || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px", color: "#8892b0" }}>M {(parseFloat(t.total_cost || 0) / t.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Incidents;