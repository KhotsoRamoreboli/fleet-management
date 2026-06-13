import React, { useEffect, useState } from "react";
import axios from "axios";

const INSPECTION_TYPES = ["pre-trip", "periodic", "cof_readiness", "roadworthy", "annual"];
const TYPE_LABELS = { "pre-trip": "Pre-Trip", "periodic": "Periodic", "cof_readiness": "COF Readiness", "roadworthy": "Roadworthy", "annual": "Annual" };

function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("inspections");
  const [form, setForm] = useState({ vehicle_id: "", driver_id: "", inspection_type: "pre-trip", odometer: "", inspector_name: "", notes: "", next_inspection_date: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/inspections").then(res => setInspections(res.data));
    axios.get("http://localhost:5000/api/inspections/compliance").then(res => setCompliance(res.data));
    axios.get("http://localhost:5000/api/vehicles").then(res => setVehicles(res.data));
    axios.get("http://localhost:5000/api/drivers").then(res => setDrivers(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/inspections", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ vehicle_id: "", driver_id: "", inspection_type: "pre-trip", odometer: "", inspector_name: "", notes: "", next_inspection_date: "" });
    });
  };

  const handleResult = (id, overall_result, defects_found) => {
    axios.put("http://localhost:5000/api/inspections/" + id + "/result", { overall_result, defects_found }).then(fetchAll);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this inspection?")) {
      axios.delete("http://localhost:5000/api/inspections/" + id).then(fetchAll);
    }
  };

  const daysUntil = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const expiryStyle = (date) => {
    const days = daysUntil(date);
    if (days === null) return { bg: "#f5f6fa", text: "#8892b0" };
    if (days < 0) return { bg: "#fde8e8", text: "#e74c3c" };
    if (days <= 30) return { bg: "#fef3cd", text: "#f39c12" };
    return { bg: "#e8f8f0", text: "#2ecc71" };
  };

  const expiryLabel = (date) => {
    const days = daysUntil(date);
    if (days === null) return "Not set";
    if (days < 0) return "EXPIRED " + Math.abs(days) + " days ago";
    if (days === 0) return "Expires TODAY";
    if (days <= 30) return "Expires in " + days + " days";
    return new Date(date).toLocaleDateString();
  };

  const passed = inspections.filter(i => i.overall_result === "pass").length;
  const failed = inspections.filter(i => i.overall_result === "fail").length;
  const expiredCount = compliance.filter(c => 
    daysUntil(c.licence_disc_expiry) < 0 || daysUntil(c.cof_expiry) < 0 || 
    daysUntil(c.insurance_expiry) < 0 || daysUntil(c.permit_expiry) < 0
  ).length;
  const expiringCount = compliance.filter(c =>
    (daysUntil(c.licence_disc_expiry) <= 30 && daysUntil(c.licence_disc_expiry) >= 0) ||
    (daysUntil(c.cof_expiry) <= 30 && daysUntil(c.cof_expiry) >= 0) ||
    (daysUntil(c.insurance_expiry) <= 30 && daysUntil(c.insurance_expiry) >= 0) ||
    (daysUntil(c.permit_expiry) <= 30 && daysUntil(c.permit_expiry) >= 0)
  ).length;

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
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Inspections & Compliance</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{inspections.length} inspections recorded</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#1abc9c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Log Inspection</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Inspections", value: inspections.length, color: "#4f8ef7" },
          { label: "Passed", value: passed, color: "#2ecc71" },
          { label: "Failed", value: failed, color: "#e74c3c" },
          { label: "Compliance Issues", value: expiredCount + expiringCount, color: "#f39c12" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Log New Inspection</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
            </select>
            <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.inspection_type} onChange={e => setForm({ ...form, inspection_type: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              {INSPECTION_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <input placeholder="Inspector Name" value={form.inspector_name} onChange={e => setForm({ ...form, inspector_name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Odometer (km)" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input type="date" value={form.next_inspection_date} onChange={e => setForm({ ...form, next_inspection_date: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
          </div>
          <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "60px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#1abc9c", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Save Inspection</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "4px", marginBottom: "0", borderBottom: "2px solid #e0e0e0" }}>
        {[["inspections","Inspection Log"],["compliance","Compliance Status"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      {activeTab === "inspections" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Date","Vehicle","Driver","Type","Odometer","Inspector","Result","Next Due","Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {inspections.map(i => (
                <tr key={i.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{new Date(i.inspection_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{i.plate} - {i.make}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>{i.driver_name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", background: "#e8f0fd", color: "#4f8ef7" }}>{TYPE_LABELS[i.inspection_type] || i.inspection_type}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{i.odometer ? i.odometer.toLocaleString() + " km" : "-"}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>{i.inspector_name || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    <select value={i.overall_result} onChange={e => handleResult(i.id, e.target.value, i.defects_found)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "12px",
                        background: i.overall_result === "pass" ? "#e8f8f0" : i.overall_result === "fail" ? "#fde8e8" : "#f5f6fa",
                        color: i.overall_result === "pass" ? "#2ecc71" : i.overall_result === "fail" ? "#e74c3c" : "#8892b0" }}>
                      <option value="pending">Pending</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{i.next_inspection_date ? new Date(i.next_inspection_date).toLocaleDateString() : "-"}</td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(i.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "compliance" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Vehicle","Licence Disc","COF/Roadworthy","Insurance","Permit"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {compliance.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{c.plate} - {c.make}</td>
                  {[c.licence_disc_expiry, c.cof_expiry, c.insurance_expiry, c.permit_expiry].map((date, idx) => (
                    <td key={idx} style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500",
                        background: expiryStyle(date).bg, color: expiryStyle(date).text }}>
                        {expiryLabel(date)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Inspections;