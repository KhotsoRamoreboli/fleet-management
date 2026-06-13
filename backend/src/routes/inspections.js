const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all inspections
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT inspections.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM inspections
      LEFT JOIN vehicles ON inspections.vehicle_id = vehicles.id
      LEFT JOIN drivers ON inspections.driver_id = drivers.id
      ORDER BY inspections.inspection_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create inspection
router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, inspection_type, odometer, inspector_name, notes, next_inspection_date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO inspections (vehicle_id, driver_id, inspection_type, odometer, inspector_name, notes, next_inspection_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [vehicle_id, driver_id, inspection_type, odometer, inspector_name, notes, next_inspection_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inspection result
router.put('/:id/result', async (req, res) => {
  const { overall_result, defects_found } = req.body;
  try {
    const result = await pool.query(`
      UPDATE inspections SET overall_result=$1, defects_found=$2 WHERE id=$3 RETURNING *`,
      [overall_result, defects_found, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get compliance for all vehicles
router.get('/compliance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vehicle_compliance.*, vehicles.plate, vehicles.make, vehicles.model
      FROM vehicle_compliance
      LEFT JOIN vehicles ON vehicle_compliance.vehicle_id = vehicles.id
      ORDER BY vehicles.plate
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update compliance dates
router.put('/compliance/:vehicle_id', async (req, res) => {
  const { licence_disc_expiry, cof_expiry, insurance_expiry, permit_expiry } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO vehicle_compliance (vehicle_id, licence_disc_expiry, cof_expiry, insurance_expiry, permit_expiry)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (vehicle_id) DO UPDATE SET
        licence_disc_expiry=$2, cof_expiry=$3, insurance_expiry=$4, 
        permit_expiry=$5, last_updated=NOW()
      RETURNING *`,
      [req.params.vehicle_id, licence_disc_expiry, cof_expiry, insurance_expiry, permit_expiry]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inspection
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inspections WHERE id = $1', [req.params.id]);
    res.json({ message: 'Inspection deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;