import React, { useEffect, useState } from "react";
import axios from "axios";

const DOC_TYPES = ["licence_disc", "cof", "insurance", "permit", "service_book", "other"];
const DOC_LABELS = { licence_disc: "Licence Disc", cof: "COF/Roadworthy", insurance: "Insurance", permit: "Permit", service_book: "Service Book", other: "Other" };
const DOC_COLORS = { licence_disc: "#4f8ef7", cof: "#2ecc71", insurance: "#9b59b6", permit: "#f39c12", service_book: "#1abc9c", other: "#8892b0" };

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ vehicle_id: "", document_type: "licence_disc", document_name: "", document_ref: "", issue_date: "", expiry_date: "", issuing_authority: "", notes: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/documents").then(res => setDocuments(res.data));
    axios.get("http://localhost:5000/api/vehicles").then(res => setVehicles(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/documents", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ vehicle_id: "", document_type: "licence_disc", document_name: "", document_ref: "", issue_date: "", expiry_date: "", issuing_authority: "", notes: "" });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this document?")) {
      axios.delete("http://localhost:5000/api/documents/" + id).then(fetchAll);
    }
  };

  const daysUntil = (days) => parseInt(days);

  const expiryStyle = (days) => {
    const d = daysUntil(days);
    if (d < 0) return { bg: "#fde8e8", text: "#e74c3c", label: "EXPIRED " + Math.abs(d) + " days ago" };
    if (d <= 7) return { bg: "#fde8e8", text: "#e74c3c", label: "Expires in " + d + " days!" };
    if (d <= 30) return { bg: "#fef3cd", text: "#f39c12", label: "Expires in " + d + " days" };
    return { bg: "#e8f8f0", text: "#2ecc71", label: "Valid - " + d + " days left" };
  };

  const filtered = documents.filter(d => {
    const matchVehicle = filterVehicle === "all" || d.vehicle_id.toString() === filterVehicle;
    const matchType = filterType === "all" || d.document_type === filterType;
    return matchVehicle && matchType;
  });

  const expired = documents.filter(d => parseInt(d.days_until_expiry) < 0).length;
  const expiring = documents.filter(d => parseInt(d.days_until_expiry) >= 0 && parseInt(d.days_until_expiry) <= 30).length;
  const valid = documents.filter(d => parseInt(d.days_until_expiry) > 30).length;

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Document Repository</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{documents.length} documents across {vehicles.length} vehicles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Add Document</button>
      </div>

      {(expired > 0 || expiring > 0) && (
        <div style={{ background: "#fde8e8", border: "1px solid #f5c0c0", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>Warning</span>
          <div>
            <div style={{ fontWeight: "600", color: "#a32d2d", marginBottom: "4px" }}>Document Compliance Alert!</div>
            <div style={{ fontSize: "13px", color: "#c0392b" }}>
              {expired > 0 && expired + " document(s) EXPIRED. "}
              {expiring > 0 && expiring + " document(s) expiring within 30 days."}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Documents", value: documents.length, color: "#4f8ef7" },
          { label: "Valid", value: valid, color: "#2ecc71" },
          { label: "Expiring Soon", value: expiring, color: "#f39c12" },
          { label: "Expired", value: expired, color: "#e74c3c" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>Add New Document</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
            </select>
            <select value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value, document_name: DOC_LABELS[e.target.value] })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
            </select>
            <input placeholder="Document Name" value={form.document_name} onChange={e => setForm({ ...form, document_name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Reference Number" value={form.document_ref} onChange={e => setForm({ ...form, document_ref: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <input placeholder="Issuing Authority" value={form.issuing_authority} onChange={e => setForm({ ...form, issuing_authority: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>Issue Date</label>
              <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
          </div>
          <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "12px", minHeight: "60px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Save Document</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff" }}>
          <option value="all">All Vehicles</option>
          {vehicles.map(v => <option key={v.id} value={v.id.toString()}>{v.plate} - {v.make}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff" }}>
          <option value="all">All Document Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f9fafb" }}>
            {["Vehicle","Document Type","Reference","Issued","Expires","Authority","Status","Actions"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(doc => {
              const style = expiryStyle(doc.days_until_expiry);
              return (
                <tr key={doc.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{doc.plate} - {doc.make}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", background: (DOC_COLORS[doc.document_type] || "#8892b0") + "20", color: DOC_COLORS[doc.document_type] || "#8892b0", fontWeight: "500" }}>
                      {DOC_LABELS[doc.document_type] || doc.document_type}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{doc.document_ref}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : "-"}</td>
                  <td style={{ padding: "12px", fontSize: "13px" }}>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "-"}</td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#8892b0" }}>{doc.issuing_authority}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: style.bg, color: style.text }}>{style.label}</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(doc.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Documents;