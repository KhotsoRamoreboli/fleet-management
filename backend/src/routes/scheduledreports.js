const express = require('express');
const router = express.Router();
const pg = require('pg');
const pool = new pg.Pool({host:'localhost',port:5432,database:'fleet_db',user:'postgres',password:'#4Docntate'});
const { sendEmail } = require('../utils/mailer');
const { generateReportPDF } = require('../utils/pdfReport');

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
// Send a report by email
// Send a report by email with PDF attachment
router.post('/:id/send', async (req, res) => {
  try {
    const report = await pool.query('SELECT * FROM scheduled_reports WHERE id=$1', [req.params.id]);
    if (report.rows.length === 0) return res.status(404).json({ error: 'Report not found' });

    const r = report.rows[0];
    const recipientList = r.recipients.split(',').map(e => e.trim());

    let dataQuery;
    if (r.report_type === 'fleet_summary') {
      dataQuery = 'SELECT plate, make, model, status, fuel_level FROM vehicles ORDER BY plate';
    } else if (r.report_type === 'maintenance') {
      dataQuery = 'SELECT vehicle_id, description, status, cost, scheduled_date FROM maintenance ORDER BY scheduled_date DESC LIMIT 50';
    } else if (r.report_type === 'fuel_analytics') {
      dataQuery = 'SELECT plate, fuel_level, status FROM vehicles ORDER BY plate';
    } else if (r.report_type === 'driver_compliance') {
      dataQuery = 'SELECT name, licence_number, licence_type, licence_expiry, department FROM drivers ORDER BY licence_expiry';
    } else if (r.report_type === 'incidents') {
      dataQuery = 'SELECT incident_type, incident_date, location, district, status FROM incidents ORDER BY incident_date DESC LIMIT 50';
    } else {
      dataQuery = 'SELECT plate, make, model, status FROM vehicles ORDER BY plate';
    }

    const dataResult = await pool.query(dataQuery);
    const pdfBuffer = await generateReportPDF(r, dataResult.rows);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #1a1f36;">${r.report_name}</h2>
        <p style="color: #8892b0;">Your ${r.frequency} ${r.report_type.replace('_', ' ')} report is attached as a PDF.</p>
        <p style="color: #8892b0; font-size: 13px;">${dataResult.rows.length} records included.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa;">Sent automatically by FleetOS - LEC Fleet Management</p>
      </div>
    `;

    const result = await sendEmail({
      to: recipientList.join(','),
      subject: r.report_name + ' - FleetOS Report',
      html,
      attachments: [{
        filename: r.report_name.replace(/\s+/g, '_') + '.pdf',
        content: pdfBuffer,
      }],
    });

    await pool.query(`
      INSERT INTO report_audit_log (report_id, status, recipients_count, notes)
      VALUES ($1, $2, $3, $4)`,
      [req.params.id, result.success ? 'success' : 'failed', recipientList.length, result.success ? 'Sent via Gmail with PDF attachment' : result.error]
    );

    if (result.success) {
      await pool.query('UPDATE scheduled_reports SET last_sent=NOW() WHERE id=$1', [req.params.id]);
      res.json({ message: 'Report sent successfully to ' + recipientList.length + ' recipients with PDF attached' });
    } else {
      res.status(500).json({ error: 'Email failed: ' + result.error });
    }
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