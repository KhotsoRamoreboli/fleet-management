const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vehicle_documents.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             (expiry_date - CURRENT_DATE) as days_until_expiry
      FROM vehicle_documents
      LEFT JOIN vehicles ON vehicle_documents.vehicle_id = vehicles.id
      ORDER BY expiry_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get documents for a specific vehicle
router.get('/vehicle/:vehicle_id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, (expiry_date - CURRENT_DATE) as days_until_expiry
      FROM vehicle_documents 
      WHERE vehicle_id = $1
      ORDER BY expiry_date ASC
    `, [req.params.vehicle_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expiring documents (within 30 days)
router.get('/expiring', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vehicle_documents.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             (expiry_date - CURRENT_DATE) as days_until_expiry
      FROM vehicle_documents
      LEFT JOIN vehicles ON vehicle_documents.vehicle_id = vehicles.id
      WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY expiry_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add document
router.post('/', async (req, res) => {
  const { vehicle_id, document_type, document_name, document_ref, issue_date, expiry_date, issuing_authority, notes } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO vehicle_documents (vehicle_id, document_type, document_name, document_ref, issue_date, expiry_date, issuing_authority, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [vehicle_id, document_type, document_name, document_ref, issue_date, expiry_date, issuing_authority, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  const { document_ref, issue_date, expiry_date, issuing_authority, status, notes } = req.body;
  try {
    const result = await pool.query(`
      UPDATE vehicle_documents SET document_ref=$1, issue_date=$2, expiry_date=$3, 
        issuing_authority=$4, status=$5, notes=$6
      WHERE id=$7 RETURNING *`,
      [document_ref, issue_date, expiry_date, issuing_authority, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicle_documents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;