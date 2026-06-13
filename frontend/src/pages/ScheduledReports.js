import React, { useEffect, useState } from "react";
import axios from "axios";

const REPORT_TYPES = ["fleet_summary", "maintenance", "fuel_analytics", "driver_compliance", "incidents", "inspections", "trips"];
const TYPE_LABELS = { fleet_summary: "Fleet Summary", maintenance: "Maintenance Report", fuel_analytics: "Fuel Analytics", driver_compliance: "Driver Compliance", incidents: "Incident Report", inspections: "Inspection Report", trips: "Trip Report" };
const FREQ_COLORS = { daily: "#4f8ef7", weekly: "#2ecc71", monthly: "#9b59b6" };

function ScheduledReports() {
  const [reports, setReports] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [sendMessage, setSendMessage] = useState("");
  const [form, setForm] = useState({ report_name: "", report_type: "fleet_summary", frequency: "daily", scheduled_time: "07:00", recipients: "", format: "pdf", role_template: "standard" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/scheduledreports").then(res => setReports(res.data));
    axios.get("http://localhost:5000/api/scheduledreports/audit").then(res => setAuditLog(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/scheduledreports", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ report_name: "", report_type: "fleet_summary", frequency: "daily", scheduled_time: "07:00", recipients: "", format: "pdf", role_template: "standard" });
    });
  };

  const handleToggle = (id) => {
    axios.put("http://localhost:5000/api/scheduledreports/" + id + "/toggle").then(fetchAll);
  };

  const handleSend = (id) => {
    axios.post("http://localhost:5000/api/scheduledreports/" + id + "/send").then(res => {
      setSendMessage(res.data.message);
      fetchAll();
      setTimeout(() => setSendMessage(""), 3000);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this scheduled report?")) {
      axios.delete("http://localhost:5000/api/scheduledreports/" + id).then(fetchAll);
    }
  };

  const active = reports.filter(r => r.is_active).length;
  const inactive = reports.filter(r => !r.is_active).length;
  const successRate = auditLog.length > 0 ? Math.round((auditLog.filter(l => l.status === "success").length / auditLog.length) * 100) : 0;

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
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Scheduled Reports</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{reports.length} configured reports</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Schedule Report</button>
      </div>

      {sendMessage && (
        <div style={{ background: "#e8f8f0", border: "1px solid #2ecc71", borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", color: "#2ecc71", fontWeight: "500" }}>
          {sendMessage}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Reports", value: reports.length, color: "#4f8ef7" },
          { label: "Active", value: active, color: "#2ecc71" },
          { label: "Inactive", value: inactive, color: "#8892b0" },
          { label: "Success Rate", value: successRate + "%", color: "#9b59b6" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Schedule New Report</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Report Name" value={form.report_name} onChange={e => setForm({ ...form, report_name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <select value={form.report_type} onChange={e => setForm({ ...form, report_type: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              {REPORT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>Send Time</label>
              <input type="time" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
            <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
            <select value={form.role_template} onChange={e => setForm({ ...form, role_template: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="standard">Standard (Transport Officer)</option>
              <option value="executive">Executive Pack</option>
            </select>
          </div>
          <input placeholder="Recipients (comma separated emails)" value={form.recipients} onChange={e => setForm({ ...form, recipients: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Save Schedule</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "4px", marginBottom: "0", borderBottom: "2px solid #e0e0e0" }}>
        {[["reports","Scheduled Reports"],["audit","Audit Log"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      {activeTab === "reports" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Report Name","Type","Frequency","Time","Recipients","Format","Template","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{r.report_name}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{TYPE_LABELS[r.report_type] || r.report_type}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: (FREQ_COLORS[r.frequency] || "#8892b0") + "20", color: FREQ_COLORS[r.frequency] || "#8892b0" }}>{r.frequency}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{r.scheduled_time}</td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#8892b0", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.recipients}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", background: r.format === "pdf" ? "#fde8e8" : "#e8f8f0", color: r.format === "pdf" ? "#e74c3c" : "#2ecc71", fontWeight: "500" }}>{r.format.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#8892b0" }}>{r.role_template}</td>
                  <td style={{ padding: "12px" }}>
                    <div onClick={() => handleToggle(r.id)} style={{ width: "40px", height: "22px", borderRadius: "99px", background: r.is_active ? "#2ecc71" : "#e0e0e0", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: "3px", left: r.is_active ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }}></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "6px" }}>
                    <button onClick={() => handleSend(r.id)} style={{ background: "#e8f0fd", color: "#4f8ef7", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Send Now</button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "audit" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Report","Sent At","Status","Recipients","Notes"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {auditLog.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{log.report_name}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{new Date(log.sent_at).toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: log.status === "success" ? "#e8f8f0" : "#fde8e8", color: log.status === "success" ? "#2ecc71" : "#e74c3c" }}>{log.status}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{log.recipients_count}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ScheduledReports;