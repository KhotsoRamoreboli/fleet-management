code = '''import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const FUEL_PRICE = 14.50;

function Fuel() {
  const [levels, setLevels] = useState([]);
  const [consumption, setConsumption] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/fuel/levels").then(res => setLevels(res.data));
    axios.get("http://localhost:5000/api/fuel/consumption").then(res => setConsumption(res.data));
  }, []);

  const totalFuel = consumption.reduce((sum, v) => sum + parseFloat(v.total_fuel || 0), 0);
  const totalDistance = consumption.reduce((sum, v) => sum + parseFloat(v.total_distance || 0), 0);
  const totalCost = totalFuel * FUEL_PRICE;
  const avgEfficiency = totalDistance > 0 ? (totalDistance / totalFuel).toFixed(1) : 0;
  const lowFuel = levels.filter(v => parseFloat(v.fuel_level) < 25);
  const fuelColor = (level) => level > 50 ? "#2ecc71" : level > 25 ? "#f39c12" : "#e74c3c";

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Fuel Analytics</h1>
        <p style={{ color: "#8892b0", fontSize: "14px" }}>Fuel price: M {FUEL_PRICE.toFixed(2)} per litre</p>
      </div>

      {lowFuel.length > 0 && (
        <div style={{ background: "#fde8e8", border: "1px solid #f5c0c0", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>Warning</span>
          <div>
            <div style={{ fontWeight: "600", color: "#a32d2d", marginBottom: "4px" }}>{lowFuel.length} vehicle(s) need refuelling urgently!</div>
            <div style={{ fontSize: "13px", color: "#c0392b" }}>{lowFuel.map(v => v.plate + " (" + v.fuel_level + "%)").join(", ")}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Fuel Used", value: totalFuel.toFixed(1) + " L", color: "#4f8ef7", sub: "across all vehicles" },
          { label: "Total Distance", value: totalDistance.toFixed(0) + " km", color: "#2ecc71", sub: "total kilometres" },
          { label: "Total Fuel Cost", value: "M " + totalCost.toFixed(2), color: "#f39c12", sub: "at M" + FUEL_PRICE + "/litre" },
          { label: "Avg Efficiency", value: avgEfficiency + " km/L", color: "#9b59b6", sub: "fleet average" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "12px", color: "#8892b0", marginTop: "4px" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Current Fuel Levels</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={levels.map(v => ({ name: v.plate, fuel: parseFloat(v.fuel_level) }))} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8892b0" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#8892b0" }} />
              <Tooltip formatter={(value) => [value + "%", "Fuel Level"]} />
              <Bar dataKey="fuel" radius={[6, 6, 0, 0]}>
                {levels.map((v, i) => <Cell key={i} fill={fuelColor(parseFloat(v.fuel_level))} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Fuel Consumed per Vehicle</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={consumption.map(v => ({ name: v.plate, fuel: parseFloat(v.total_fuel).toFixed(1) }))} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8892b0" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8892b0" }} />
              <Tooltip formatter={(value) => [value + " L", "Fuel Used"]} />
              <Bar dataKey="fuel" fill="#4f8ef7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1f36", marginBottom: "16px" }}>Vehicle Fuel Breakdown</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#f9fafb" }}>
            {["Vehicle", "Trips", "Distance", "Fuel Used", "Efficiency", "Cost", "Current Level"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#8892b0", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {consumption.map((v, i) => {
              const level = levels.find(l => l.plate === v.plate);
              const fuelLevel = level ? parseFloat(level.fuel_level) : 0;
              const efficiency = v.total_distance > 0 ? (v.total_distance / v.total_fuel).toFixed(1) : 0;
              const cost = (v.total_fuel * FUEL_PRICE).toFixed(2);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f6fa" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1a1f36" }}>{v.plate} - {v.make}</td>
                  <td style={{ padding: "12px", color: "#8892b0" }}>{v.total_trips}</td>
                  <td style={{ padding: "12px" }}>{parseFloat(v.total_distance).toFixed(0)} km</td>
                  <td style={{ padding: "12px" }}>{parseFloat(v.total_fuel).toFixed(1)} L</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: efficiency > 7 ? "#2ecc71" : efficiency > 5 ? "#f39c12" : "#e74c3c", fontWeight: "600" }}>{efficiency} km/L</span>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>M {cost}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "99px", height: "6px", minWidth: "60px" }}>
                        <div style={{ height: "100%", borderRadius: "99px", width: fuelLevel + "%", background: fuelColor(fuelLevel) }}></div>
                      </div>
                      <span style={{ fontSize: "12px", color: "#8892b0" }}>{fuelLevel}%</span>
                    </div>
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

export default Fuel;'''

with open('src/pages/Fuel.js', 'w') as f:
    f.write(code)

print('Fuel.js written successfully!')