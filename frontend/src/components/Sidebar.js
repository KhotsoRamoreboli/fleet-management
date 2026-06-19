import React from "react";
import { Link, useLocation } from "react-router-dom";

const navGroups = [
  {
    label: "Overview",
    items: [
      { path: "/", label: "Dashboard", icon: "\uD83D\uDCCA" },
    ]
  },
  {
    label: "Fleet",
    items: [
      { path: "/vehicles", label: "Vehicles", icon: "\uD83D\uDE9B" },
      { path: "/drivers", label: "Drivers", icon: "\uD83D\uDC64" },
      { path: "/trips", label: "Trips", icon: "\uD83D\uDDFA\uFE0F" },
      { path: "/maintenance", label: "Maintenance", icon: "\uD83D\uDD27" },
      { path: "/fuel", label: "Fuel Analytics", icon: "\u26FD" },
    ]
  },
  {
    label: "Operations",
    items: [
      { path: "/incidents", label: "Incidents", icon: "\uD83D\uDEA8" },
      { path: "/jobcards", label: "Job Cards", icon: "\uD83D\uDEE0\uFE0F" },
      { path: "/inspections", label: "Inspections", icon: "\u2705" },
      { path: "/poolbookings", label: "Pool Booking", icon: "\uD83D\uDE99" },
      { path: "/vendors", label: "Vendors", icon: "\uD83C\uDFEA" },
    ]
  },
  {
    label: "Compliance & Reporting",
    items: [
      { path: "/documents", label: "Documents", icon: "\uD83D\uDCC1" },
      { path: "/scheduledreports", label: "Scheduled Reports", icon: "\uD83D\uDCC5" },
      { path: "/reports", label: "Reports", icon: "\uD83D\uDCC4" },
    ]
  },
  {
    label: "Monitoring",
    items: [
      { path: "/alerts", label: "Alerts", icon: "\uD83D\uDD14" },
      { path: "/gps", label: "GPS Tracking", icon: "\uD83D\uDCCD" },
    ]
  },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  return (
    <div style={{ width: "220px", background: "#1a1f36", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", minHeight: "100vh" }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #2d3561" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>FleetOS</div>
        <div style={{ fontSize: "12px", color: "#8892b0", marginTop: "4px" }}>LEC Fleet Management</div>
      </div>

      <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: "4px" }}>
            <div style={{ padding: "12px 20px 6px", fontSize: "10px", fontWeight: "700", color: "#5a6390", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {group.label}
            </div>
            {group.items.map(item => (
              <Link key={item.path} to={item.path} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 20px",
                color: location.pathname === item.path ? "#fff" : "#8892b0",
                background: location.pathname === item.path ? "#2d3561" : "transparent",
                textDecoration: "none", fontSize: "14px",
                borderLeft: location.pathname === item.path ? "3px solid #4f8ef7" : "3px solid transparent",
              }}>
                <span style={{ fontSize: "15px", width: "18px", textAlign: "center" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: "20px", borderTop: "1px solid #2d3561" }}>
        <div style={{ fontSize: "13px", color: "#fff", fontWeight: "500", marginBottom: "4px" }}>{user?.name}</div>
        <div style={{ fontSize: "11px", color: "#8892b0", marginBottom: "12px" }}>{user?.role}</div>
        <button onClick={onLogout} style={{
          width: "100%", padding: "8px", background: "#e74c3c", color: "#fff",
          border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px"
        }}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;