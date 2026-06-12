const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT maintenance.*, vehicles.plate, vehicles.make, vehicles.model
      FROM maintenance
      LEFT JOIN vehicles ON maintenance.vehicle_id = vehicles.id
      ORDER BY maintenance.scheduled_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { vehicle_id, type, description, scheduled_date, cost } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO maintenance (vehicle_id, type, description, scheduled_date, cost) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [vehicle_id, type, description, scheduled_date, cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE maintenance SET status=$1, completed_date=$2 WHERE id=$3 RETURNING *',
      ['completed', new Date().toISOString().split('T')[0], req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM maintenance WHERE id = $1', [req.params.id]);
    res.json({ message: 'Maintenance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;