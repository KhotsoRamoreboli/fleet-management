import React, { useEffect, useState } from "react";
import axios from "axios";

const STATUS_COLORS = { pending: "#f39c12", approved: "#2ecc71", rejected: "#e74c3c", completed: "#4f8ef7" };
const STATUS_BG = { pending: "#fef3cd", approved: "#e8f8f0", rejected: "#fde8e8", completed: "#e8f0fd" };

function PoolBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({ vehicle_id: "", driver_id: "", requested_by: "", trip_purpose: "", start_datetime: "", end_datetime: "" });
  const [returnForm, setReturnForm] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/poolbookings").then(res => setBookings(res.data));
    axios.get("http://localhost:5000/api/vehicles").then(res => setVehicles(res.data));
    axios.get("http://localhost:5000/api/drivers").then(res => setDrivers(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/poolbookings", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ vehicle_id: "", driver_id: "", requested_by: "", trip_purpose: "", start_datetime: "", end_datetime: "" });
    }).catch(err => alert(err.response?.data?.error || "Booking failed"));
  };

  const handleApprove = (id, status) => {
    axios.put("http://localhost:5000/api/poolbookings/" + id + "/approve", { status, approved_by: "Transport Manager" }).then(fetchAll);
  };

  const handleReturn = (id) => {
    axios.put("http://localhost:5000/api/poolbookings/" + id + "/return", returnForm).then(() => {
      fetchAll();
      setReturnForm(null);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this booking?")) {
      axios.delete("http://localhost:5000/api/poolbookings/" + id).then(fetchAll);
    }
  };

  const filtered = activeTab === "all" ? bookings : bookings.filter(b => b.status === activeTab);
  const pending = bookings.filter(b => b.status === "pending").length;
  const approved = bookings.filter(b => b.status === "approved").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  const tabStyle = (tab) => ({
    padding: "8px 16px", border: "none", cursor: "pointer", borderRadius: "8px",
    fontWeight: activeTab === tab ? "600" : "400",
    background: activeTab === tab ? "#4f8ef7" : "#f5f6fa",
    color: activeTab === tab ? "#fff" : "#8892b0", fontSize: "13px"
  });

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Pool Vehicle Booking</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{bookings.length} bookings total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Request Booking</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Bookings", value: bookings.length, color: "#4f8ef7" },
          { label: "Pending Approval", value: pending, color: "#f39c12" },
          { label: "Approved", value: approved, color: "#2ecc71" },
          { label: "Completed", value: completed, color: "#9b59b6" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>New Booking Request</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
            </select>
            <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input placeholder="Requested By" value={form.requested_by} onChange={e => setForm({ ...form, requested_by: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>Start Date & Time</label>
              <input type="datetime-local" value={form.start_datetime} onChange={e => setForm({ ...form, start_datetime: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>End Date & Time</label>
              <input type="datetime-local" value={form.end_datetime} onChange={e => setForm({ ...form, end_datetime: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
          </div>
          <textarea placeholder="Trip purpose / destination..." value={form.trip_purpose} onChange={e => setForm({ ...form, trip_purpose: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "60px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Submit Request</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {returnForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "2px solid #4f8ef7" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Vehicle Return - Post Trip Capture</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Odometer Return (km)" onChange={e => setReturnForm({ ...returnForm, odometer_return: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Fuel Level Return (%)" onChange={e => setReturnForm({ ...returnForm, fuel_return: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <select onChange={e => setReturnForm({ ...returnForm, condition_return: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Vehicle Condition</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <textarea placeholder="Damages noted (if any)..." onChange={e => setReturnForm({ ...returnForm, damages_noted: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "60px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => handleReturn(returnForm.id)} style={{ background: "#2ecc71", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Confirm Return</button>
            <button onClick={() => setReturnForm(null)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[["all","All"],["pending","Pending"],["approved","Approved"],["completed","Completed"],["rejected","Rejected"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f9fafb" }}>
            {["Vehicle","Driver","Requested By","Purpose","Start","End","Status","Actions"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{b.plate} - {b.make}</td>
                <td style={{ padding: "12px", fontSize: "13px" }}>{b.driver_name}</td>
                <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{b.requested_by}</td>
                <td style={{ padding: "12px", fontSize: "13px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.trip_purpose}</td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#8892b0" }}>{new Date(b.start_datetime).toLocaleString()}</td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#8892b0" }}>{new Date(b.end_datetime).toLocaleString()}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: STATUS_BG[b.status], color: STATUS_COLORS[b.status] }}>{b.status}</span>
                </td>
                <td style={{ padding: "12px", display: "flex", gap: "6px" }}>
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(b.id, "approved")} style={{ background: "#e8f8f0", color: "#2ecc71", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Approve</button>
                      <button onClick={() => handleApprove(b.id, "rejected")} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Reject</button>
                    </>
                  )}
                  {b.status === "approved" && (
                    <button onClick={() => setReturnForm({ id: b.id })} style={{ background: "#e8f0fd", color: "#4f8ef7", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Return</button>
                  )}
                  <button onClick={() => handleDelete(b.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PoolBookings;