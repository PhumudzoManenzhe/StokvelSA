// @ts-nocheck
const PDFDocument = require('pdfkit');
const { Writable } = require('stream');

// ─────────────────────────────────────────
// EXPORT TO CSV
// Converts data array to CSV string
// ─────────────────────────────────────────
const exportToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  // Header row
  const header = columns.map((col) => `"${col.label}"`).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.accessor(row);
        // Wrap strings in quotes, handle commas and newlines
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
};

// ─────────────────────────────────────────
// BUILD CONTRIBUTION COMPLIANCE CSV
// ─────────────────────────────────────────
const buildComplianceCSV = (report) => {
  const rows = [];

  report.memberCompliance.forEach((mc) => {
    mc.breakdown.forEach((period) => {
      rows.push({
        memberName: mc.member.fullName,
        email: mc.member.email,
        role: mc.member.role,
        period: period.period,
        status: period.status,
        amount: period.amount,
        paidAt: period.paidAt
          ? new Date(period.paidAt).toLocaleDateString('en-ZA')
          : '',
        complianceRate: `${mc.stats.complianceRate}%`,
      });
    });
  });

  const columns = [
    { label: 'Member Name', accessor: (r) => r.memberName },
    { label: 'Email', accessor: (r) => r.email },
    { label: 'Role', accessor: (r) => r.role },
    { label: 'Period', accessor: (r) => r.period },
    { label: 'Status', accessor: (r) => r.status },
    { label: 'Amount (R)', accessor: (r) => r.amount },
    { label: 'Paid Date', accessor: (r) => r.paidAt },
    { label: 'Compliance Rate', accessor: (r) => r.complianceRate },
  ];

  return exportToCSV(rows, columns);
};

// ─────────────────────────────────────────
// BUILD PAYOUT HISTORY CSV
// ─────────────────────────────────────────
const buildPayoutCSV = (report) => {
  const allPayouts = [
    ...report.completed.map((p) => ({ ...p, category: 'Completed' })),
    ...report.upcoming.map((p) => ({ ...p, category: 'Upcoming' })),
    ...report.failed.map((p) => ({ ...p, category: 'Failed' })),
  ];

  const columns = [
    { label: 'Recipient', accessor: (r) => r.recipient.fullName },
    { label: 'Email', accessor: (r) => r.recipient.email },
    { label: 'Amount (R)', accessor: (r) => parseFloat(r.amount) },
    { label: 'Status', accessor: (r) => r.category },
    {
      label: 'Scheduled Date',
      accessor: (r) => new Date(r.scheduledDate).toLocaleDateString('en-ZA'),
    },
    {
      label: 'Processed Date',
      accessor: (r) =>
        r.processedAt
          ? new Date(r.processedAt).toLocaleDateString('en-ZA')
          : '',
    },
    { label: 'Payment Ref', accessor: (r) => r.paymentRef || '' },
    { label: 'Notes', accessor: (r) => r.notes || '' },
  ];

  return exportToCSV(allPayouts, columns);
};

// ─────────────────────────────────────────
// BUILD COMPLIANCE PDF
// ─────────────────────────────────────────
const buildCompliancePDF = async (report, groupName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──────────────────────────────
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Contribution Compliance Report', { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(groupName, { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, {
        align: 'center',
      })
      .fillColor('#000000')
      .moveDown(1);

    // ── Summary Box ─────────────────────────
    doc
      .rect(50, doc.y, 495, 70)
      .fillAndStroke('#f0f4ff', '#4F46E5')
      .fillColor('#000000');

    const summaryY = doc.y - 65;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Summary', 65, summaryY + 10);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Total Members: ${report.summary.totalMembers}`, 65, summaryY + 28)
      .text(`Periods Covered: ${report.summary.periods}`, 65, summaryY + 44)
      .text(
        `Total Collected: R${report.summary.totalCollected.toFixed(2)}`,
        280,
        summaryY + 28
      )
      .text(
        `Overall Compliance: ${report.summary.overallCompliance}%`,
        280,
        summaryY + 44
      );

    doc.moveDown(3);

    // ── Member Breakdown ────────────────────
    report.memberCompliance.forEach((mc, index) => {
      // Page break if needed
      if (doc.y > 680) doc.addPage();

      // Member header
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#4F46E5')
        .text(`${index + 1}. ${mc.member.fullName}`)
        .fillColor('#000000');

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Email: ${mc.member.email}   Role: ${mc.member.role}   Compliance: ${mc.stats.complianceRate}%`
        )
        .text(
          `Confirmed: ${mc.stats.confirmed}   Missed: ${mc.stats.missed}   Pending: ${mc.stats.pending}   Total Paid: R${mc.stats.totalPaid.toFixed(2)}`
        )
        .moveDown(0.5);

      // Period breakdown table
      const tableTop = doc.y;
      const colWidths = [80, 100, 80, 100, 100];
      const headers = ['Period', 'Status', 'Amount', 'Paid Date', ''];

      // Table header
      doc.rect(50, tableTop, 495, 20).fill('#f8f8f8').stroke('#dddddd');
      doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold');

      let xPos = 55;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 6, { width: colWidths[i] });
        xPos += colWidths[i];
      });

      doc.fillColor('#000000').font('Helvetica');

      // Table rows
      mc.breakdown.forEach((period, rowIndex) => {
        if (doc.y > 700) doc.addPage();

        const rowY = tableTop + 20 + rowIndex * 18;
        const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';

        doc.rect(50, rowY, 495, 18).fill(bgColor).stroke('#eeeeee');

        const statusColor =
          {
            CONFIRMED: '#16a34a',
            MISSED: '#dc2626',
            PENDING: '#d97706',
            NOT_GENERATED: '#9ca3af',
          }[period.status] || '#000000';

        doc.fillColor('#000000').fontSize(9);
        doc.text(period.period, 55, rowY + 5, { width: 80 });
        doc
          .fillColor(statusColor)
          .text(period.status, 135, rowY + 5, { width: 100 });
        doc
          .fillColor('#000000')
          .text(`R${parseFloat(period.amount).toFixed(2)}`, 235, rowY + 5, {
            width: 80,
          });
        doc.text(
          period.paidAt
            ? new Date(period.paidAt).toLocaleDateString('en-ZA')
            : '-',
          315,
          rowY + 5,
          { width: 100 }
        );

        doc.y = rowY + 18;
      });

      doc.moveDown(1.5);
    });

    // ── Footer ──────────────────────────────
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Stokvel Platform — Confidential   Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: 495 }
        );
    }

    doc.end();
  });
};

// ─────────────────────────────────────────
// BUILD PAYOUT PDF
// ─────────────────────────────────────────
const buildPayoutPDF = async (report, groupName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Payout History Report', { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(groupName, { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, {
        align: 'center',
      })
      .fillColor('#000000')
      .moveDown(1);

    // Summary
    doc
      .rect(50, doc.y, 495, 70)
      .fillAndStroke('#f0fff4', '#16a34a')
      .fillColor('#000000');

    const summaryY = doc.y - 65;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Summary', 65, summaryY + 10);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Completed Payouts: ${report.summary.totalCompleted}`,
        65,
        summaryY + 28
      )
      .text(
        `Upcoming Payouts:  ${report.summary.totalUpcoming}`,
        65,
        summaryY + 44
      )
      .text(
        `Total Paid Out: R${report.summary.totalPaidOut.toFixed(2)}`,
        280,
        summaryY + 28
      )
      .text(
        `Total Scheduled: R${report.summary.totalScheduled.toFixed(2)}`,
        280,
        summaryY + 44
      );

    doc.moveDown(3);

    // Completed payouts section
    if (report.completed.length > 0) {
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Completed Payouts')
        .moveDown(0.5);

      report.completed.forEach((payout, index) => {
        if (doc.y > 700) doc.addPage();

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${index + 1}. ${payout.recipient.fullName}`, {
            continued: true,
          })
          .font('Helvetica-Bold')
          .text(`  R${parseFloat(payout.amount).toFixed(2)}`, {
            continued: true,
          })
          .font('Helvetica')
          .text(
            `  — ${new Date(payout.processedAt).toLocaleDateString('en-ZA')}`
          );

        if (payout.paymentRef) {
          doc
            .fontSize(9)
            .fillColor('#666666')
            .text(`  Ref: ${payout.paymentRef}`)
            .fillColor('#000000');
        }
      });
    }

    doc.moveDown(1);

    // Upcoming payouts section
    if (report.upcoming.length > 0) {
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Upcoming Payouts')
        .moveDown(0.5);

      report.upcoming.forEach((payout, index) => {
        if (doc.y > 700) doc.addPage();

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${index + 1}. ${payout.recipient.fullName}`, {
            continued: true,
          })
          .font('Helvetica-Bold')
          .text(`  R${parseFloat(payout.amount).toFixed(2)}`, {
            continued: true,
          })
          .font('Helvetica')
          .text(
            `  — Scheduled: ${new Date(payout.scheduledDate).toLocaleDateString('en-ZA')}`
          );
      });
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Stokvel Platform — Confidential   Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: 495 }
        );
    }

    doc.end();
  });
};

module.exports = {
  buildComplianceCSV,
  buildPayoutCSV,
  buildCompliancePDF,
  buildPayoutPDF,
};
