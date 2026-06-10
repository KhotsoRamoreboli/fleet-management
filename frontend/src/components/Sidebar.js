import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: "D" },
  { path: "/vehicles", label: "Vehicles", icon: "V" },
  { path: "/drivers", label: "Drivers", icon: "Dr" },
  { path: "/alerts", label: "Alerts", icon: "A" },
];

function Sidebar() {
  const location = useLocation();
  return (
    <div style={{ width: "220px", background: "#1a1f36", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", minHeight: "100vh" }}>
      <div style={{ padding: "0 20px 30px", borderBottom: "1px solid #2d3561" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>FleetOS</div>
        <div style={{ fontSize: "12px", color: "#8892b0", marginTop: "4px" }}>LEC Fleet Management</div>
      </div>
      <nav style={{ padding: "20px 0" }}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", color: location.pathname === item.path ? "#fff" : "#8892b0", background: location.pathname === item.path ? "#2d3561" : "transparent", textDecoration: "none", fontSize: "14px", borderLeft: location.pathname === item.path ? "3px solid #4f8ef7" : "3px solid transparent" }}>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;