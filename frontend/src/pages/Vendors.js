import React, { useEffect, useState } from "react";
import axios from "axios";

const VENDOR_TYPES = ["workshop", "panel_beater", "tyre_supplier", "towing", "auto_electrician", "specialist", "other"];
const TYPE_LABELS = { workshop: "Workshop", panel_beater: "Panel Beater", tyre_supplier: "Tyre Supplier", towing: "Towing", auto_electrician: "Auto Electrician", specialist: "Specialist", other: "Other" };
const TYPE_COLORS = { workshop: "#4f8ef7", panel_beater: "#9b59b6", tyre_supplier: "#2ecc71", towing: "#e74c3c", auto_electrician: "#f39c12", specialist: "#1abc9c", other: "#8892b0" };

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ name: "", vendor_type: "workshop", contact_person: "", phone: "", email: "", address: "", district: "", hourly_rate: "", sla_response_hours: "24", sla_completion_days: "7" });

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = () => {
    axios.get("http://localhost:5000/api/vendors").then(res => setVendors(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/vendors", form).then(() => {
      fetchVendors();
      setShowForm(false);
      setForm({ name: "", vendor_type: "workshop", contact_person: "", phone: "", email: "", address: "", district: "", hourly_rate: "", sla_response_hours: "24", sla_completion_days: "7" });
    });
  };

  const handleStatus = (id, approval_status) => {
    axios.put("http://localhost:5000/api/vendors/" + id + "/status", { approval_status }).then(fetchVendors);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this vendor?")) {
      axios.delete("http://localhost:5000/api/vendors/" + id).then(fetchVendors);
    }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.district?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || v.vendor_type === filterType;
    return matchSearch && matchType;
  });

  const approved = vendors.filter(v => v.approval_status === "approved").length;
  const pending = vendors.filter(v => v.approval_status === "pending").length;
  const avgRating = vendors.filter(v => v.rating > 0).reduce((s, v) => s + parseFloat(v.rating), 0) / (vendors.filter(v => v.rating > 0).length || 1);

  const stars = (rating) => {
    const full = Math.floor(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Vendor Management</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{vendors.length} vendors registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#9b59b6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Add Vendor</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Vendors", value: vendors.length, color: "#4f8ef7" },
          { label: "Approved", value: approved, color: "#2ecc71" },
          { label: "Pending Approval", value: pending, color: "#f39c12" },
          { label: "Avg Rating", value: avgRating.toFixed(1) + " / 5", color: "#9b59b6" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Register New Vendor</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Vendor Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <select value={form.vendor_type} onChange={e => setForm({ ...form, vendor_type: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              {VENDOR_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <input placeholder="Contact Person" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="District" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Hourly Rate (M)" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="SLA Response (hours)" value={form.sla_response_hours} onChange={e => setForm({ ...form, sla_response_hours: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="SLA Completion (days)" value={form.sla_completion_days} onChange={e => setForm({ ...form, sla_completion_days: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
          </div>
          <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#9b59b6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Save Vendor</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8892b0" }}>search</span>
          <input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", border: "1px solid #e0e0e0", boxSizing: "border-box" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff" }}>
          <option value="all">All Types</option>
          {VENDOR_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {filtered.map(v => (
          <div key={v.id} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: "4px solid " + (TYPE_COLORS[v.vendor_type] || "#8892b0") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1f36", marginBottom: "4px" }}>{v.name}</div>
                <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: (TYPE_COLORS[v.vendor_type] || "#8892b0") + "20", color: TYPE_COLORS[v.vendor_type] || "#8892b0" }}>
                  {TYPE_LABELS[v.vendor_type] || v.vendor_type}
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: v.approval_status === "approved" ? "#e8f8f0" : "#fef3cd", color: v.approval_status === "approved" ? "#2ecc71" : "#f39c12" }}>
                  {v.approval_status}
                </span>
                {v.approval_status === "pending" && (
                  <button onClick={() => handleStatus(v.id, "approved")} style={{ background: "#e8f8f0", color: "#2ecc71", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Approve</button>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px", fontSize: "13px" }}>
              <div style={{ color: "#8892b0" }}>Contact: <span style={{ color: "#1a1f36" }}>{v.contact_person}</span></div>
              <div style={{ color: "#8892b0" }}>Phone: <span style={{ color: "#1a1f36" }}>{v.phone}</span></div>
              <div style={{ color: "#8892b0" }}>District: <span style={{ color: "#1a1f36" }}>{v.district}</span></div>
              <div style={{ color: "#8892b0" }}>Rate: <span style={{ color: "#1a1f36" }}>M {v.hourly_rate}/hr</span></div>
              <div style={{ color: "#8892b0" }}>SLA Response: <span style={{ color: "#1a1f36" }}>{v.sla_response_hours} hrs</span></div>
              <div style={{ color: "#8892b0" }}>SLA Completion: <span style={{ color: "#1a1f36" }}>{v.sla_completion_days} days</span></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#f39c12", fontSize: "18px" }}>{v.rating > 0 ? stars(v.rating) : "Not rated"} <span style={{ fontSize: "13px", color: "#8892b0" }}>{v.rating > 0 ? v.rating + "/5" : ""}</span></div>
              <button onClick={() => handleDelete(v.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vendors;