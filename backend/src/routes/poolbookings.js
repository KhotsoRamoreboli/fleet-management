const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pool_bookings.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM pool_bookings
      LEFT JOIN vehicles ON pool_bookings.vehicle_id = vehicles.id
      LEFT JOIN drivers ON pool_bookings.driver_id = drivers.id
      ORDER BY pool_bookings.start_datetime DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, requested_by, trip_purpose, start_datetime, end_datetime } = req.body;
  try {
    // Check for conflicts
    const conflict = await pool.query(`
      SELECT id FROM pool_bookings 
      WHERE vehicle_id = $1 
      AND status NOT IN ('rejected', 'completed')
      AND (start_datetime, end_datetime) OVERLAPS ($2::timestamp, $3::timestamp)
    `, [vehicle_id, start_datetime, end_datetime]);
    
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Vehicle already booked for this time period' });
    }

    const result = await pool.query(`
      INSERT INTO pool_bookings (vehicle_id, driver_id, requested_by, trip_purpose, start_datetime, end_datetime)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [vehicle_id, driver_id, requested_by, trip_purpose, start_datetime, end_datetime]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve or reject booking
router.put('/:id/approve', async (req, res) => {
  const { status, approved_by } = req.body;
  try {
    const result = await pool.query(`
      UPDATE pool_bookings SET status=$1, approved_by=$2, approved_date=NOW()
      WHERE id=$3 RETURNING *`,
      [status, approved_by, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return vehicle (post-trip capture)
router.put('/:id/return', async (req, res) => {
  const { odometer_return, fuel_return, condition_return, damages_noted } = req.body;
  try {
    const result = await pool.query(`
      UPDATE pool_bookings SET status='completed', odometer_return=$1, 
        fuel_return=$2, condition_return=$3, damages_noted=$4, returned_date=NOW()
      WHERE id=$5 RETURNING *`,
      [odometer_return, fuel_return, condition_return, damages_noted, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pool_bookings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;