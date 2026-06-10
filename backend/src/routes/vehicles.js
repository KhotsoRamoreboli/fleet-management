const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new vehicle
router.post('/', async (req, res) => {
  const { plate, make, model, year, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vehicles (plate, make, model, year, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [plate, make, model, year, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  const { plate, make, model, year, type, status, fuel_level, mileage } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vehicles SET plate=$1, make=$2, model=$3, year=$4, type=$5, status=$6, fuel_level=$7, mileage=$8 WHERE id=$9 RETURNING *',
      [plate, make, model, year, type, status, fuel_level, mileage, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
