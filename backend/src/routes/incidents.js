const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all incidents with vehicle and driver details
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT incidents.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM incidents
      LEFT JOIN vehicles ON incidents.vehicle_id = vehicles.id
      LEFT JOIN drivers ON incidents.driver_id = drivers.id
      ORDER BY incidents.incident_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single incident
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT incidents.*, 
             vehicles.plate, vehicles.make, vehicles.model,
             drivers.name as driver_name
      FROM incidents
      LEFT JOIN vehicles ON incidents.vehicle_id = vehicles.id
      LEFT JOIN drivers ON incidents.driver_id = drivers.id
      WHERE incidents.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  const { vehicle_id, driver_id, incident_type, incident_date, location, district,
          description, police_report_ref, third_party_details, repair_cost,
          towing_cost, assessment_cost, excess_cost, third_party_cost,
          insurance_claim_ref } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO incidents (vehicle_id, driver_id, incident_type, incident_date, 
        location, district, description, police_report_ref, third_party_details,
        repair_cost, towing_cost, assessment_cost, excess_cost, third_party_cost,
        insurance_claim_ref)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [vehicle_id, driver_id, incident_type, incident_date, location, district,
       description, police_report_ref, third_party_details, repair_cost || 0,
       towing_cost || 0, assessment_cost || 0, excess_cost || 0, 
       third_party_cost || 0, insurance_claim_ref]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update incident status
router.put('/:id/status', async (req, res) => {
  const { status, investigation_notes } = req.body;
  try {
    const closed_date = status === 'closed' ? new Date().toISOString() : null;
    const result = await pool.query(`
      UPDATE incidents SET status=$1, investigation_notes=$2, closed_date=$3 
      WHERE id=$4 RETURNING *`,
      [status, investigation_notes, closed_date, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update costs
router.put('/:id/costs', async (req, res) => {
  const { repair_cost, towing_cost, assessment_cost, excess_cost, third_party_cost, insurance_claim_ref, insurance_claim_status } = req.body;
  try {
    const result = await pool.query(`
      UPDATE incidents SET repair_cost=$1, towing_cost=$2, assessment_cost=$3, 
        excess_cost=$4, third_party_cost=$5, insurance_claim_ref=$6, 
        insurance_claim_status=$7
      WHERE id=$8 RETURNING *`,
      [repair_cost, towing_cost, assessment_cost, excess_cost, 
       third_party_cost, insurance_claim_ref, insurance_claim_status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM incidents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trend analysis - incidents by type
router.get('/stats/trends', async (req, res) => {
  try {
    const byType = await pool.query(`
      SELECT incident_type, COUNT(*) as count,
             SUM(repair_cost + towing_cost + assessment_cost + excess_cost + third_party_cost) as total_cost
      FROM incidents GROUP BY incident_type ORDER BY count DESC
    `);
    const byDistrict = await pool.query(`
      SELECT district, COUNT(*) as count
      FROM incidents GROUP BY district ORDER BY count DESC
    `);
    const byStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM incidents GROUP BY status
    `);
    res.json({ byType: byType.rows, byDistrict: byDistrict.rows, byStatus: byStatus.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;