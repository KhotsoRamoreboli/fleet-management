import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navGroups = [
  { label: "Dashboard", path: "/" },
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
    label: "Compliance",
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

const INK = "#0B0E14";
const INK_RAISED = "#181D2A";
const LINE_DARK = "#262C3D";
const MUTED = "#8C92A6";
const ACCENT = "#5B5FEF";

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(null);
  const [hoverGroup, setHoverGroup] = useState(null);
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

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

  useEffect(() => {
    const activeIdx = navGroups.findIndex(isGroupActive);
    const el = itemRefs.current[activeIdx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    }
  }, [location.pathname]);

  return (
    <div ref={navRef} style={{ background: INK, color: "#fff", display: "flex", alignItems: "center", padding: "0 28px", height: "52px", position: "relative", zIndex: 100, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>F</div>
        FleetOS
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "2px", height: "100%", position: "relative", marginLeft: "180px" }}>
        <div style={{
          position: "absolute", bottom: 0, height: "2px", background: ACCENT,
          left: indicator.left, width: indicator.width, opacity: indicator.opacity,
          transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
        }} />

        {navGroups.map((group, gi) => (
          <div key={gi}
            ref={el => itemRefs.current[gi] = el}
            onMouseEnter={() => setHoverGroup(gi)}
            onMouseLeave={() => setHoverGroup(null)}
            style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
            {group.path ? (
              <Link to={group.path} style={{
                padding: "8px 14px", textDecoration: "none", fontSize: "13.5px", letterSpacing: "-0.005em",
                color: isGroupActive(group) ? "#fff" : MUTED,
                borderRadius: "6px",
                background: hoverGroup === gi && !isGroupActive(group) ? INK_RAISED : "transparent",
                transition: "background 0.12s, color 0.12s",
              }}>{group.label}</Link>
            ) : (
              <button onClick={() => setOpenGroup(openGroup === gi ? null : gi)} style={{
                padding: "8px 14px", border: "none", cursor: "pointer", fontSize: "13.5px", letterSpacing: "-0.005em",
                color: isGroupActive(group) || openGroup === gi ? "#fff" : MUTED,
                background: openGroup === gi ? INK_RAISED : (hoverGroup === gi ? INK_RAISED : "transparent"),
                borderRadius: "6px",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "background 0.12s, color 0.12s",
              }}>
                {group.label}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ transform: openGroup === gi ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                  <path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {!group.path && openGroup === gi && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0,
                background: "#fff", borderRadius: "10px", border: "1px solid #ECECE9",
                boxShadow: "0 4px 16px rgba(11,14,20,0.08), 0 1px 2px rgba(11,14,20,0.04)",
                minWidth: "212px", padding: "6px", zIndex: 200,
                animation: "navDropdownIn 0.12s ease-out",
              }}>
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setOpenGroup(null)} style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "7px", textDecoration: "none", fontSize: "13.5px",
                      color: active ? "#0B0E14" : "#3D4150",
                      background: active ? "#F1F1FE" : "transparent",
                      fontWeight: active ? "600" : "450",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#F7F7F6"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: "13px", width: "20px", height: "20px", borderRadius: "5px", background: active ? "#E4E4FC" : "#F1F1EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
        <div style={{ width: "1px", height: "22px", background: LINE_DARK }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: "550", letterSpacing: "-0.005em" }}>{user?.name}</div>
          <div style={{ fontSize: "11px", color: MUTED, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>{user?.role}</div>
        </div>
        <button onClick={onLogout} style={{
          padding: "6px 13px", background: "transparent", color: MUTED,
          border: "1px solid " + LINE_DARK, borderRadius: "6px", cursor: "pointer", fontSize: "12.5px",
          transition: "color 0.12s, border-color 0.12s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#3D4150"; }}
        onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = LINE_DARK; }}
        >Sign out</button>
      </div>

      <style>{`
        @keyframes navDropdownIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Navbar;