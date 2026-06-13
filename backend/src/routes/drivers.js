const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get drivers with licence expiry alerts
router.get('/licence-alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 
             (licence_expiry - CURRENT_DATE) as days_until_expiry
      FROM drivers 
      WHERE licence_expiry IS NOT NULL
      ORDER BY licence_expiry ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, licence_number, phone, email, licence_type, licence_expiry, department } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO drivers (name, licence_number, phone, email, licence_type, licence_expiry, department) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, licence_number, phone, email, licence_type, licence_expiry, department]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, licence_number, phone, email, status, licence_type, licence_expiry, department } = req.body;
  try {
    const result = await pool.query(
      'UPDATE drivers SET name=$1, licence_number=$2, phone=$3, email=$4, status=$5, licence_type=$6, licence_expiry=$7, department=$8 WHERE id=$9 RETURNING *',
      [name, licence_number, phone, email, status, licence_type, licence_expiry, department, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;