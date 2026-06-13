import React, { useEffect, useState } from "react";
import axios from "axios";

const STATUS_FLOW = ["logged", "approved", "booked", "in_progress", "quality_check", "closed"];
const STATUS_LABELS = { logged: "Logged", approved: "Approved", booked: "Booked", in_progress: "In Progress", quality_check: "Quality Check", closed: "Closed" };
const STATUS_COLORS = { logged: "#8892b0", approved: "#4f8ef7", booked: "#9b59b6", in_progress: "#f39c12", quality_check: "#1abc9c", closed: "#2ecc71" };
const STATUS_BG = { logged: "#f5f6fa", approved: "#e8f0fd", booked: "#f5eeff", in_progress: "#fef9ec", quality_check: "#e8faf5", closed: "#e8f8f0" };

function JobCards() {
  const [jobcards, setJobcards] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_id: "", driver_id: "", fault_description: "", fault_type: "unplanned", priority: "normal", workshop_name: "", odometer_in: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/jobcards").then(res => setJobcards(res.data));
    axios.get("http://localhost:5000/api/vehicles").then(res => setVehicles(res.data));
    axios.get("http://localhost:5000/api/drivers").then(res => setDrivers(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/jobcards", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ vehicle_id: "", driver_id: "", fault_description: "", fault_type: "unplanned", priority: "normal", workshop_name: "", odometer_in: "" });
    });
  };

  const handleStatusUpdate = (id, status) => {
    axios.put("http://localhost:5000/api/jobcards/" + id + "/status", { status }).then(fetchAll);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this job card?")) {
      axios.delete("http://localhost:5000/api/jobcards/" + id).then(fetchAll);
    }
  };

  const totalCost = (j) => parseFloat(j.parts_cost || 0) + parseFloat(j.labour_cost || 0);
  const grandTotal = jobcards.reduce((s, j) => s + totalCost(j), 0);
  const urgent = jobcards.filter(j => j.priority === "urgent" && j.status !== "closed").length;
  const open = jobcards.filter(j => j.status !== "closed").length;

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Workshop Job Cards</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{jobcards.length} job cards - {open} open - Total cost: M {grandTotal.toFixed(2)}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#f39c12", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ New Job Card</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Job Cards", value: jobcards.length, color: "#4f8ef7" },
          { label: "Open / Active", value: open, color: "#f39c12" },
          { label: "Urgent Priority", value: urgent, color: "#e74c3c" },
          { label: "Total Cost", value: "M " + grandTotal.toFixed(0), color: "#9b59b6" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Log New Job Card</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
            </select>
            <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.fault_type} onChange={e => setForm({ ...form, fault_type: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="unplanned">Unplanned Repair</option>
              <option value="planned">Planned Service</option>
              <option value="breakdown">Breakdown</option>
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="normal">Normal Priority</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            <input placeholder="Workshop Name" value={form.workshop_name} onChange={e => setForm({ ...form, workshop_name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Odometer In (km)" value={form.odometer_in} onChange={e => setForm({ ...form, odometer_in: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
          </div>
          <textarea placeholder="Fault description..." value={form.fault_description} onChange={e => setForm({ ...form, fault_description: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "80px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#f39c12", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Log Job Card</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f9fafb" }}>
            {["Vehicle","Fault","Type","Priority","Workshop","Status","Cost","Actions"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {jobcards.map(j => (
              <tr key={j.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{j.plate} - {j.make}</td>
                <td style={{ padding: "12px", fontSize: "13px", maxWidth: "180px", color: "#1a1f36" }}>{j.fault_description.length > 50 ? j.fault_description.substring(0,50) + "..." : j.fault_description}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", background: j.fault_type === "planned" ? "#e8f8f0" : "#fef3cd", color: j.fault_type === "planned" ? "#2ecc71" : "#f39c12" }}>{j.fault_type}</span>
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", background: j.priority === "urgent" ? "#fde8e8" : "#f5f6fa", color: j.priority === "urgent" ? "#e74c3c" : "#8892b0" }}>{j.priority}</span>
                </td>
                <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{j.workshop_name || "-"}</td>
                <td style={{ padding: "12px" }}>
                  <select value={j.status} onChange={e => handleStatusUpdate(j.id, e.target.value)}
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e0e0e0", fontSize: "12px", background: STATUS_BG[j.status], color: STATUS_COLORS[j.status], fontWeight: "500" }}>
                    {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td style={{ padding: "12px", fontWeight: "600" }}>M {totalCost(j).toFixed(2)}</td>
                <td style={{ padding: "12px" }}>
                  <button onClick={() => handleDelete(j.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Workflow Pipeline</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {STATUS_FLOW.map((s, i) => {
            const count = jobcards.filter(j => j.status === s).length;
            return (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ background: STATUS_BG[s], border: "2px solid " + STATUS_COLORS[s], borderRadius: "10px", padding: "12px 8px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: STATUS_COLORS[s] }}>{count}</div>
                  <div style={{ fontSize: "11px", color: STATUS_COLORS[s], fontWeight: "500", marginTop: "2px" }}>{STATUS_LABELS[s]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default JobCards;