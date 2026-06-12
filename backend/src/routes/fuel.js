const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Fuel levels per vehicle
router.get('/levels', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT plate, make, model, fuel_level 
      FROM vehicles 
      ORDER BY fuel_level ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fuel used per vehicle from trips
router.get('/consumption', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vehicles.plate, vehicles.make, 
             SUM(trips.fuel_used) as total_fuel,
             SUM(trips.distance) as total_distance,
             COUNT(trips.id) as total_trips
      FROM trips
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      GROUP BY vehicles.plate, vehicles.make
      ORDER BY total_fuel DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;