content = '''import React, { useEffect, useState } from "react";
import axios from "axios";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [licenceAlerts, setLicenceAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("drivers");
  const [form, setForm] = useState({ name: "", licence_number: "", phone: "", email: "", licence_type: "", licence_expiry: "", department: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    axios.get("http://localhost:5000/api/drivers").then(res => setDrivers(res.data));
    axios.get("http://localhost:5000/api/drivers/licence-alerts").then(res => setLicenceAlerts(res.data));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/drivers", form).then(() => {
      fetchAll();
      setShowForm(false);
      setForm({ name: "", licence_number: "", phone: "", email: "", licence_type: "", licence_expiry: "", department: "" });
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this driver?")) {
      axios.delete("http://localhost:5000/api/drivers/" + id).then(fetchAll);
    }
  };

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licence_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusStyle = (status) => {
    if (status === "available") return { bg: "#e8f8f0", text: "#2ecc71" };
    if (status === "on_trip") return { bg: "#e8f0fd", text: "#4f8ef7" };
    return { bg: "#fef3cd", text: "#f39c12" };
  };

  const alertStyle = (days) => {
    if (days < 0) return { bg: "#fde8e8", text: "#e74c3c", label: "EXPIRED " + Math.abs(days) + " days ago" };
    if (days <= 14) return { bg: "#fde8e8", text: "#e74c3c", label: "Expires in " + days + " days" };
    if (days <= 30) return { bg: "#fef3cd", text: "#f39c12", label: "Expires in " + days + " days" };
    return { bg: "#e8f8f0", text: "#2ecc71", label: "Expires in " + days + " days" };
  };

  const expired = licenceAlerts.filter(d => d.days_until_expiry < 0).length;
  const expiringSoon = licenceAlerts.filter(d => d.days_until_expiry >= 0 && d.days_until_expiry <= 30).length;

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
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Drivers</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{filtered.length} of {drivers.length} drivers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>+ Add Driver</button>
      </div>

      {(expired > 0 || expiringSoon > 0) && (
        <div style={{ background: "#fde8e8", border: "1px solid #f5c0c0", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>Warning</span>
          <div>
            <div style={{ fontWeight: "600", color: "#a32d2d", marginBottom: "4px" }}>Licence Compliance Alert!</div>
            <div style={{ fontSize: "13px", color: "#c0392b" }}>
              {expired > 0 && expired + " driver(s) with EXPIRED licence. "}
              {expiringSoon > 0 && expiringSoon + " driver(s) with licence expiring within 30 days."}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Drivers", value: drivers.length, color: "#4f8ef7" },
          { label: "Available", value: drivers.filter(d => d.status === "available").length, color: "#2ecc71" },
          { label: "Expired Licences", value: expired, color: "#e74c3c" },
          { label: "Expiring Soon", value: expiringSoon, color: "#f39c12" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ color: "#1a1f36", marginBottom: "20px", fontSize: "16px" }}>New Driver</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {[{f:"name",l:"Full Name"},{f:"licence_number",l:"Licence Number"},{f:"phone",l:"Phone"},{f:"email",l:"Email"},{f:"licence_type",l:"Licence Type (e.g. Code 10)"},{f:"department",l:"Department"}].map(({f,l}) => (
              <input key={f} placeholder={l} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", color: "#8892b0" }}>Licence Expiry Date</label>
              <input type="date" value={form.licence_expiry} onChange={e => setForm({ ...form, licence_expiry: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={{ background: "#4f8ef7", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#e0e0e0", color: "#333", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "4px", marginBottom: "0", borderBottom: "2px solid #e0e0e0" }}>
        {[["drivers","Driver List"],["licences","Licence Compliance"]].map(([tab, label]) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      {activeTab === "drivers" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <input placeholder="Search by name or licence..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff" }}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Name","Licence","Department","Phone","Email","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#e8f0fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#4f8ef7" }}>
                        {d.name.split(" ").map(n => n.charAt(0)).join("").slice(0,2).toUpperCase()}
                      </div>
                      {d.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: "#8892b0" }}>{d.licence_number}</td>
                  <td style={{ padding: "12px", color: "#8892b0" }}>{d.department || "-"}</td>
                  <td style={{ padding: "12px" }}>{d.phone}</td>
                  <td style={{ padding: "12px", color: "#8892b0" }}>{d.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: statusStyle(d.status).bg, color: statusStyle(d.status).text }}>{d.status}</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(d.id)} style={{ background: "#fde8e8", color: "#e74c3c", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "licences" && (
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Driver","Department","Licence Type","Licence No","Expiry Date","Status"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {licenceAlerts.map(d => {
                const days = parseInt(d.days_until_expiry);
                const style = alertStyle(days);
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                    <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{d.name}</td>
                    <td style={{ padding: "12px", color: "#8892b0" }}>{d.department}</td>
                    <td style={{ padding: "12px" }}>{d.licence_type}</td>
                    <td style={{ padding: "12px", color: "#8892b0" }}>{d.licence_number}</td>
                    <td style={{ padding: "12px" }}>{new Date(d.licence_expiry).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "500", background: style.bg, color: style.text }}>{style.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Drivers;'''

with open('src/pages/Drivers.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Drivers.js written successfully!')