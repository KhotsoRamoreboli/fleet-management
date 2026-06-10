const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT trips.*, vehicles.plate, drivers.name as driver_name 
      FROM trips 
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      LEFT JOIN drivers ON trips.driver_id = drivers.id
      ORDER BY trips.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, start_location, end_location, start_time, distance, fuel_used } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trips (vehicle_id, driver_id, start_location, end_location, start_time, distance, fuel_used, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [vehicle_id, driver_id, start_location, end_location, start_time, distance, fuel_used, 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;