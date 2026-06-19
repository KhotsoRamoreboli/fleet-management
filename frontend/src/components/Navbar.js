import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navGroups = [
  { label: "Dashboard", path: "/" },
  {
    label: "Fleet",
    items: [
      { path: "/vehicles", label: "Vehicles" },
      { path: "/drivers", label: "Drivers" },
      { path: "/trips", label: "Trips" },
      { path: "/maintenance", label: "Maintenance" },
      { path: "/fuel", label: "Fuel Analytics" },
    ]
  },
  {
    label: "Operations",
    items: [
      { path: "/incidents", label: "Incidents" },
      { path: "/jobcards", label: "Job Cards" },
      { path: "/inspections", label: "Inspections" },
      { path: "/poolbookings", label: "Pool Booking" },
      { path: "/vendors", label: "Vendors" },
    ]
  },
  {
    label: "Compliance & Reporting",
    items: [
      { path: "/documents", label: "Documents" },
      { path: "/scheduledreports", label: "Scheduled Reports" },
      { path: "/reports", label: "Reports" },
    ]
  },
  {
    label: "Monitoring",
    items: [
      { path: "/alerts", label: "Alerts" },
      { path: "/gps", label: "GPS Tracking" },
    ]
  },
];

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isGroupActive = (group) => {
    if (group.path) return location.pathname === group.path;
    return group.items.some(item => item.path === location.pathname);
  };

  return (
    <div ref={navRef} style={{ background: "#1a1f36", color: "#fff", display: "flex", alignItems: "center", padding: "0 20px", height: "56px", position: "relative", zIndex: 100 }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", marginRight: "32px" }}>FleetOS</div>

      <nav style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, height: "100%" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
            {group.path ? (
              <Link to={group.path} style={{
                padding: "8px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px",
                color: isGroupActive(group) ? "#fff" : "#8892b0",
                background: isGroupActive(group) ? "#2d3561" : "transparent",
              }}>{group.label}</Link>
            ) : (
              <button onClick={() => setOpenGroup(openGroup === gi ? null : gi)} style={{
                padding: "8px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px",
                color: isGroupActive(group) ? "#fff" : "#8892b0",
                background: isGroupActive(group) || openGroup === gi ? "#2d3561" : "transparent",
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                {group.label}
                <span style={{ fontSize: "10px", transform: openGroup === gi ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>v</span>
              </button>
            )}

            {!group.path && openGroup === gi && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", background: "#fff", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", minWidth: "190px", padding: "6px", zIndex: 200 }}>
                {group.items.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setOpenGroup(null)} style={{
                    display: "block", padding: "9px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "13.5px",
                    color: location.pathname === item.path ? "#1a1f36" : "#444",
                    background: location.pathname === item.path ? "#eef1fb" : "transparent",
                    fontWeight: location.pathname === item.path ? "600" : "400",
                  }}>{item.label}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: "500" }}>{user?.name}</div>
          <div style={{ fontSize: "11px", color: "#8892b0" }}>{user?.role}</div>
        </div>
        <button onClick={onLogout} style={{
          padding: "7px 14px", background: "#e74c3c", color: "#fff",
          border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px"
        }}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;