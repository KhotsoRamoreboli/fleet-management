import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const createIcon = (color) => new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-" + color + ".png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const greenIcon = createIcon("green");
const redIcon = createIcon("red");
const orangeIcon = createIcon("orange");
const blueIcon = createIcon("blue");

const LESOTHO_LOCATIONS = [
  { name: "Maseru", lat: -29.3167, lng: 27.4833 },
  { name: "Leribe", lat: -28.8833, lng: 28.0500 },
  { name: "Mohales Hoek", lat: -30.1500, lng: 27.4667 },
  { name: "Mokhotlong", lat: -29.2833, lng: 29.0667 },
  { name: "Mafeteng", lat: -29.8167, lng: 27.2333 },
];

const LEC_HQ = { lat: -29.3167, lng: 27.4833 };

function GPSTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [positions, setPositions] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/vehicles").then(res => {
      const v = res.data;
      setVehicles(v);
      const initialPositions = {};
      v.forEach((vehicle, i) => {
        const loc = LESOTHO_LOCATIONS[i % LESOTHO_LOCATIONS.length];
        initialPositions[vehicle.id] = {
          lat: loc.lat + (Math.random() - 0.5) * 0.05,
          lng: loc.lng + (Math.random() - 0.5) * 0.05,
          speed: Math.floor(Math.random() * 80) + 20,
          heading: Math.floor(Math.random() * 360),
          location: loc.name,
        };
      });
      setPositions(initialPositions);
    });
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startSimulation = () => {
    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      setPositions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const pos = updated[id];
          const angle = (pos.heading * Math.PI) / 180;
          const speed = 0.0001 + Math.random() * 0.0002;
          updated[id] = {
            ...pos,
            lat: pos.lat + Math.cos(angle) * speed,
            lng: pos.lng + Math.sin(angle) * speed,
            speed: Math.floor(Math.random() * 80) + 20,
            heading: (pos.heading + (Math.random() - 0.5) * 20) % 360,
          };
        });
        return updated;
      });
    }, 2000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getIcon = (vehicle) => {
    if (vehicle.status === "maintenance") return redIcon;
    if (vehicle.fuel_level < 25) return orangeIcon;
    return greenIcon;
  };

  const activeVehicles = vehicles.filter(v => v.status === "active").length;

  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#1a1f36", fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Live GPS Tracking</h1>
          <p style={{ color: "#8892b0", fontSize: "14px" }}>{vehicles.length} vehicles tracked across Lesotho</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {!isSimulating ? (
            <button onClick={startSimulation} style={{ background: "#2ecc71", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>Start Live Tracking</button>
          ) : (
            <button onClick={stopSimulation} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>Stop Tracking</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Vehicles", value: vehicles.length, color: "#4f8ef7" },
          { label: "Active", value: activeVehicles, color: "#2ecc71" },
          { label: "In Maintenance", value: vehicles.filter(v => v.status === "maintenance").length, color: "#e74c3c" },
          { label: "Low Fuel", value: vehicles.filter(v => parseFloat(v.fuel_level) < 25).length, color: "#f39c12" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "3px solid " + m.color }}>
            <div style={{ fontSize: "13px", color: "#8892b0", marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
        <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "500px" }}>
          <MapContainer center={[-29.3167, 27.9833]} zoom={8} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle center={[LEC_HQ.lat, LEC_HQ.lng]} radius={5000} color="#4f8ef7" fillOpacity={0.1} />
            {vehicles.map(vehicle => {
              const pos = positions[vehicle.id];
              if (!pos) return null;
              return (
                <Marker key={vehicle.id} position={[pos.lat, pos.lng]} icon={getIcon(vehicle)}
                  eventHandlers={{ click: () => setSelectedVehicle(vehicle) }}>
                  <Popup>
                    <div style={{ minWidth: "150px" }}>
                      <div style={{ fontWeight: "700", marginBottom: "6px" }}>{vehicle.plate} - {vehicle.make}</div>
                      <div style={{ fontSize: "12px", color: "#8892b0" }}>Speed: {pos.speed} km/h</div>
                      <div style={{ fontSize: "12px", color: "#8892b0" }}>Location: {pos.location}</div>
                      <div style={{ fontSize: "12px", color: "#8892b0" }}>Fuel: {vehicle.fuel_level}%</div>
                      <div style={{ fontSize: "12px", marginTop: "4px", color: vehicle.status === "active" ? "#2ecc71" : "#e74c3c", fontWeight: "600" }}>{vehicle.status.toUpperCase()}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1a1f36", marginBottom: "12px" }}>Vehicle Status</h3>
            {vehicles.map(vehicle => {
              const pos = positions[vehicle.id];
              return (
                <div key={vehicle.id} onClick={() => setSelectedVehicle(vehicle)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", marginBottom: "6px", cursor: "pointer", background: selectedVehicle?.id === vehicle.id ? "#e8f0fd" : "transparent" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: vehicle.status === "maintenance" ? "#e74c3c" : parseFloat(vehicle.fuel_level) < 25 ? "#f39c12" : "#2ecc71", flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1f36" }}>{vehicle.plate}</div>
                    <div style={{ fontSize: "11px", color: "#8892b0" }}>{pos ? pos.location + " - " + pos.speed + " km/h" : "Loading..."}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#8892b0" }}>{vehicle.fuel_level}%</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1a1f36", marginBottom: "12px" }}>Map Legend</h3>
            {[
              { color: "#2ecc71", label: "Active vehicle" },
              { color: "#f39c12", label: "Low fuel (<25%)" },
              { color: "#e74c3c", label: "In maintenance" },
              { color: "#4f8ef7", label: "LEC HQ geofence" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color }}></div>
                <span style={{ fontSize: "12px", color: "#8892b0" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {isSimulating && (
            <div style={{ background: "#e8f8f0", borderRadius: "14px", padding: "16px", border: "1px solid #2ecc71" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#2ecc71", marginBottom: "4px" }}>Live Tracking Active</div>
              <div style={{ fontSize: "12px", color: "#2ecc71" }}>Vehicles updating every 2 seconds</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GPSTracking;