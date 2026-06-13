const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});

// Get all scheduled reports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM scheduled_reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit log
router.get('/audit', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT report_audit_log.*, scheduled_reports.report_name
      FROM report_audit_log
      LEFT JOIN scheduled_reports ON report_audit_log.report_id = scheduled_reports.id
      ORDER BY sent_at DESC LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create scheduled report
router.post('/', async (req, res) => {
  const { report_name, report_type, frequency, scheduled_time, recipients, format, role_template } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO scheduled_reports (report_name, report_type, frequency, scheduled_time, recipients, format, role_template)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [report_name, report_type, frequency, scheduled_time, recipients, format, role_template || 'standard']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE scheduled_reports SET is_active = NOT is_active WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate sending a report
router.post('/:id/send', async (req, res) => {
  try {
    const report = await pool.query('SELECT * FROM scheduled_reports WHERE id=$1', [req.params.id]);
    const recipients = report.rows[0].recipients.split(',').length;
    
    await pool.query(`
      INSERT INTO report_audit_log (report_id, status, recipients_count, notes)
      VALUES ($1, 'success', $2, 'Manually triggered')`,
      [req.params.id, recipients]
    );
    
    await pool.query(
      'UPDATE scheduled_reports SET last_sent=NOW() WHERE id=$1',
      [req.params.id]
    );
    
    res.json({ message: 'Report sent successfully to ' + recipients + ' recipients' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete scheduled report
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM report_audit_log WHERE report_id = $1', [req.params.id]);
    await pool.query('DELETE FROM scheduled_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'Scheduled report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;