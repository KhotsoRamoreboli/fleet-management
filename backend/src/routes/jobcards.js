const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all job cards
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT job_cards.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM job_cards
      LEFT JOIN vehicles ON job_cards.vehicle_id = vehicles.id
      LEFT JOIN drivers ON job_cards.driver_id = drivers.id
      ORDER BY job_cards.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single job card with parts
router.get('/:id', async (req, res) => {
  try {
    const card = await pool.query(`
      SELECT job_cards.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM job_cards
      LEFT JOIN vehicles ON job_cards.vehicle_id = vehicles.id
      LEFT JOIN drivers ON job_cards.driver_id = drivers.id
      WHERE job_cards.id = $1
    `, [req.params.id]);
    const parts = await pool.query('SELECT * FROM job_card_parts WHERE job_card_id = $1', [req.params.id]);
    res.json({ ...card.rows[0], parts: parts.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create job card
router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, fault_description, fault_type, priority, workshop_name, odometer_in } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO job_cards (vehicle_id, driver_id, fault_description, fault_type, priority, workshop_name, odometer_in)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [vehicle_id, driver_id, fault_description, fault_type || 'unplanned', priority || 'normal', workshop_name, odometer_in]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status workflow
router.put('/:id/status', async (req, res) => {
  const { status, technician_name, workshop_name, root_cause_notes, repeat_fault } = req.body;
  try {
    const now = new Date().toISOString();
    let dateField = '';
    if (status === 'approved') dateField = ', approved_date = $6';
    else if (status === 'booked') dateField = ', booked_date = $6';
    else if (status === 'in_progress') dateField = ', start_date = $6';
    else if (status === 'quality_check') dateField = ', quality_check_date = $6';
    else if (status === 'closed') dateField = ', closed_date = $6';

    const result = await pool.query(`
      UPDATE job_cards SET status=$1, technician_name=$2, workshop_name=$3, 
        root_cause_notes=$4, repeat_fault=$5 ${dateField}
      WHERE id=$7 RETURNING *`,
      [status, technician_name, workshop_name, root_cause_notes, repeat_fault || false, now, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update costs
router.put('/:id/costs', async (req, res) => {
  const { quotation_amount, invoice_amount, parts_cost, labour_cost, odometer_out } = req.body;
  try {
    const result = await pool.query(`
      UPDATE job_cards SET quotation_amount=$1, invoice_amount=$2, 
        parts_cost=$3, labour_cost=$4, odometer_out=$5
      WHERE id=$6 RETURNING *`,
      [quotation_amount, invoice_amount, parts_cost, labour_cost, odometer_out, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add part to job card
router.post('/:id/parts', async (req, res) => {
  const { part_name, part_number, quantity, unit_cost } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO job_card_parts (job_card_id, part_name, part_number, quantity, unit_cost)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, part_name, part_number, quantity, unit_cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job card
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_card_parts WHERE job_card_id = $1', [req.params.id]);
    await pool.query('DELETE FROM job_cards WHERE id = $1', [req.params.id]);
    res.json({ message: 'Job card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count,
             SUM(invoice_amount) as total_cost
      FROM job_cards GROUP BY status
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;