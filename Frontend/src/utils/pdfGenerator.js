import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateECOPdf(eco, generatedBy) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // ─────────────────────────────────────────
  // PAGE 1 — HEADER + ECO OVERVIEW
  // ─────────────────────────────────────────
  
  // Header bar (dark navy rectangle)
  doc.setFillColor(12, 26, 46);  // #0C1A2E
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // PLM Flow logo text
  doc.setTextColor(13, 148, 136);  // teal
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PLM', margin, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.text(' Flow', margin + 14, 20);
  
  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Engineering Change Control System', margin, 28);
  
  // Document title
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Engineering Change Order Report', pageWidth - margin, 20, 
    { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 
    pageWidth - margin, 28, { align: 'right' });
  
  // ─────────────────────────────────────────
  // ECO TITLE SECTION
  // ─────────────────────────────────────────
  let y = 50;
  
  // Status badge
  const stageColors = {
    'New': [71, 85, 105],
    'In Review': [59, 130, 246],
    'Approval': [245, 158, 11],
    'Done': [16, 185, 129],
    'Rejected': [239, 68, 68]
  };
  const stageColor = stageColors[eco.stage] || [71, 85, 105];
  doc.setFillColor(...stageColor);
  doc.roundedRect(margin, y - 5, 30, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(eco.stage.toUpperCase(), margin + 15, y + 0.5, 
    { align: 'center', baseline: 'middle' });
  
  // ECO Number
  doc.setTextColor(13, 148, 136);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(eco.ecoNumber, margin + 35, y);
  
  y += 12;
  
  // ECO Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(eco.title, margin, y);
  
  y += 10;
  
  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 10;
  
  // ─────────────────────────────────────────
  // ECO DETAILS TABLE
  // ─────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ECO Details', margin, y);
  y += 6;
  
  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: [
      ['ECO Number',   eco.ecoNumber],
      ['Type',         eco.type],
      ['Product',      eco.product?.name || eco.productName || 'N/A'],
      ['BoM Version',  eco.bom?.version || 'N/A'],
      ['Priority',     eco.priority || 'Medium'],
      ['Stage',        eco.stage],
      ['Raised By',    eco.createdBy?.name || eco.createdByName || 'Unknown'],
      ['Created On',   new Date(eco.createdAt).toLocaleDateString('en-IN')],
      ['Effective Date', eco.effectiveDate 
        ? new Date(eco.effectiveDate).toLocaleDateString('en-IN') 
        : 'Immediate'],
      ['Version Update', eco.versionUpdate ? `Yes — ${eco.newVersion}` : 'No'],
    ],
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold', 
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        cellWidth: 50 
      },
      1: { cellWidth: 'auto' }
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Description
  if (eco.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Description', margin, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(
      eco.description, pageWidth - 2 * margin
    );
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 10;
  }
  
  // ─────────────────────────────────────────
  // PAGE 2 — CHANGES (DIFF VIEW)
  // ─────────────────────────────────────────
  doc.addPage();
  y = 25;
  
  // Page header
  doc.setFillColor(12, 26, 46);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`PLM Flow — ${eco.ecoNumber}`, margin, 10);
  doc.text('Changes', pageWidth - margin, 10, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Proposed Changes', margin, y);
  y += 8;
  
  // Summary pills
  const changes = eco.changes || [];
  const modified = changes.filter(c => c.changeType === 'modified' || c.type === 'modified').length;
  const added = changes.filter(c => c.changeType === 'added' || c.type === 'added').length;
  const removed = changes.filter(c => c.changeType === 'removed' || c.type === 'removed').length;
  
  doc.setFontSize(9);
  if (modified > 0) {
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(margin, y, 28, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${modified} Modified`, margin + 14, y + 4.5, 
      { align: 'center', baseline: 'middle' });
  }
  if (added > 0) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin + 32, y, 22, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${added} Added`, margin + 43, y + 4.5, 
      { align: 'center', baseline: 'middle' });
  }
  if (removed > 0) {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(margin + 58, y, 24, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${removed} Removed`, margin + 70, y + 4.5, 
      { align: 'center', baseline: 'middle' });
  }
  y += 14;
  
  // Changes table
  if (changes.length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Field / Component', 'Old Value', 'New Value', 'Change Type']],
      body: changes.map(change => [
        change.fieldName || change.field,
        change.oldValue || '—',
        change.newValue || '—',
        (change.changeType || change.type || 'Modified').toUpperCase()
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { 
        fillColor: [12, 26, 46], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: { textColor: [15, 23, 42] },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const changeType = (changes[data.row.index]?.changeType || changes[data.row.index]?.type || '').toLowerCase();
          if (changeType === 'modified') {
            data.cell.styles.fillColor = [255, 251, 235];
          } else if (changeType === 'added') {
            data.cell.styles.fillColor = [240, 253, 244];
          } else if (changeType === 'removed') {
            data.cell.styles.fillColor = [254, 242, 242];
          }
          if (data.column.index === 3) {
            if (changeType === 'modified') 
              data.cell.styles.textColor = [180, 117, 23];
            if (changeType === 'added') 
              data.cell.styles.textColor = [15, 110, 86];
            if (changeType === 'removed') 
              data.cell.styles.textColor = [163, 45, 45];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No changes recorded for this ECO.', margin, y);
  }
  
  // ─────────────────────────────────────────
  // PAGE 3 — APPROVAL LOG TIMELINE
  // ─────────────────────────────────────────
  doc.addPage();
  y = 25;
  
  // Page header
  doc.setFillColor(12, 26, 46);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`PLM Flow — ${eco.ecoNumber}`, margin, 10);
  doc.text('Approval Log', pageWidth - margin, 10, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Approval History', margin, y);
  y += 8;
  
  const approvalLogs = eco.approvalLogs || [];
  if (approvalLogs.length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Action', 'By', 'Date & Time', 'Comment']],
      body: approvalLogs.map(log => {
        let timestamp = log.timestamp;
        try { timestamp = new Date(log.timestamp).toLocaleString('en-IN'); } catch(e){}
        return [
          log.action,
          log.userName || log.user || 'Unknown',
          timestamp,
          log.comment || '—'
        ];
      }),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { 
        fillColor: [12, 26, 46], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 'auto' }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No approval history available.', margin, y);
  }
  
  // ─────────────────────────────────────────
  // FOOTER ON ALL PAGES
  // ─────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pgHeight = doc.internal.pageSize.height;
    
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pgHeight - 15, pageWidth - margin, pgHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'PLM Flow by ERP Titans — Confidential Engineering Document', 
      margin, pgHeight - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`, 
      pageWidth - margin, pgHeight - 8, 
      { align: 'right' }
    );
  }
  
  // Save the PDF
  doc.save(`${eco.ecoNumber}-${(eco.title||'eco').replace(/\s+/g, '-')}.pdf`);
}
