const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create vendor
router.post('/', async (req, res) => {
  const { name, vendor_type, contact_person, phone, email, address, district, hourly_rate, sla_response_hours, sla_completion_days } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, district, hourly_rate, sla_response_hours, sla_completion_days)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, vendor_type, contact_person, phone, email, address, district, hourly_rate || 0, sla_response_hours || 24, sla_completion_days || 7]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update approval status
router.put('/:id/status', async (req, res) => {
  const { approval_status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vendors SET approval_status=$1 WHERE id=$2 RETURNING *',
      [approval_status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update rating
router.put('/:id/rating', async (req, res) => {
  const { rating } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vendors SET rating=$1 WHERE id=$2 RETURNING *',
      [rating, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vendors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;