const PDFDocument = require('pdfkit');

function generateReportPDF(report, data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).fillColor('#1a1f36').text('FleetOS', { continued: false });
    doc.fontSize(10).fillColor('#8892b0').text('LEC Fleet Management System');
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor('#1a1f36').text(report.report_name);
    doc.fontSize(10).fillColor('#8892b0').text(
      report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1) +
      ' report  |  Generated ' + new Date().toLocaleString()
    );
    doc.moveDown(1.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
    doc.moveDown(1);

    if (data.length === 0) {
      doc.fontSize(11).fillColor('#8892b0').text('No data available for this report.');
    } else {
      const headers = Object.keys(data[0]);
      const colWidth = 495 / headers.length;

      doc.fontSize(9).fillColor('#1a1f36');
      headers.forEach((h, i) => {
        doc.text(h.replace(/_/g, ' ').toUpperCase(), 50 + i * colWidth, doc.y, { width: colWidth, continued: i < headers.length - 1 });
      });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
      doc.moveDown(0.3);

      data.forEach(row => {
        const startY = doc.y;
        headers.forEach((h, i) => {
          let val = row[h];
          if (val === null || val === undefined) val = '-';
          doc.fontSize(9).fillColor('#444').text(String(val), 50 + i * colWidth, startY, { width: colWidth });
        });
        doc.moveDown(0.6);
        if (doc.y > 700) doc.addPage();
      });
    }

    doc.end();
  });
}

module.exports = { generateReportPDF };