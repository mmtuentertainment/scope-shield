/**
 * PDF Section Renderers
 *
 * Individual section rendering methods for PDF generation.
 * Each method renders a specific section of the change order PDF.
 *
 * @module PDFSectionRenderers
 */

/**
 * Render PDF header with title and change order number
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @returns {number} New Y position after rendering
 */
export function renderHeader(doc, changeOrder, margin) {
  let yPos = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CHANGE ORDER', margin, yPos);
  yPos += 10;

  // Change order number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${changeOrder.changeOrderNumber}`, margin, yPos);
  yPos += 5;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${changeOrder.dateCreated || new Date().toLocaleDateString()}`, margin, yPos);
  doc.setTextColor(0);
  yPos += 10;

  return yPos;
}

/**
 * Render client and freelancer information
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @returns {number} New Y position after rendering
 */
export function renderClientInfo(doc, changeOrder, margin) {
  let yPos = 55;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Information:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${changeOrder.clientName}`, margin + 5, yPos);
  yPos += 5;
  doc.text(`Email: ${changeOrder.clientEmail}`, margin + 5, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Freelancer:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${changeOrder.freelancerName}`, margin + 5, yPos);
  yPos += 10;

  return yPos;
}

/**
 * Render original scope section
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageWidth - Page width in mm
 * @returns {number} New Y position after rendering
 */
export function renderOriginalScope(doc, changeOrder, margin, pageWidth) {
  let yPos = 100;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Original Scope:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const scopeLines = doc.splitTextToSize(
    changeOrder.originalScope || 'Not specified',
    pageWidth - 2 * margin
  );
  doc.text(scopeLines, margin + 5, yPos);
  yPos += scopeLines.length * 5 + 10;

  return yPos;
}

/**
 * Render requested changes section
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageWidth - Page width in mm
 * @param {number} pageHeight - Page height in mm
 * @returns {number} New Y position after rendering
 */
export function renderRequestedChanges(doc, changeOrder, margin, pageWidth, pageHeight) {
  let yPos = 140;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Requested Changes:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (Array.isArray(changeOrder.requestedChanges)) {
    changeOrder.requestedChanges.forEach((change, index) => {
      const bullet = `${index + 1}. `;
      const lines = doc.splitTextToSize(
        change,
        pageWidth - 2 * margin - 10
      );

      doc.text(bullet, margin + 5, yPos);
      doc.text(lines, margin + 15, yPos);
      yPos += lines.length * 5 + 3;

      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
    });
  }

  yPos += 10;
  return yPos;
}

/**
 * Render cost estimate and timeline
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageHeight - Page height in mm
 * @returns {number} New Y position after rendering
 */
export function renderCostAndTimeline(doc, changeOrder, margin, pageHeight) {
  let yPos = 200;

  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Estimate:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(changeOrder.costEstimate || 'TBD', margin + 5, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Revised Timeline:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(changeOrder.revisedTimeline || 'To be determined', margin + 5, yPos);
  yPos += 10;

  return yPos;
}

/**
 * Render payment terms
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageHeight - Page height in mm
 * @returns {number} New Y position after rendering
 */
export function renderPaymentTerms(doc, changeOrder, margin, pageHeight) {
  let yPos = 240;

  // Check if we need a new page
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(changeOrder.paymentTerms || 'Net 30', margin + 5, yPos);
  yPos += 10;

  return yPos;
}

/**
 * Render additional notes
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageWidth - Page width in mm
 * @param {number} pageHeight - Page height in mm
 * @returns {number} New Y position after rendering
 */
export function renderAdditionalNotes(doc, changeOrder, margin, pageWidth, pageHeight) {
  let yPos = 260;

  // Check if we need a new page
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }

  if (changeOrder.additionalNotes && changeOrder.additionalNotes !== 'No additional notes') {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(
      changeOrder.additionalNotes,
      pageWidth - 2 * margin
    );
    doc.text(notesLines, margin + 5, yPos);
    yPos += notesLines.length * 5 + 10;
  }

  return yPos;
}

/**
 * Render footer with generation info
 *
 * @param {jsPDF} doc - jsPDF document instance
 * @param {ChangeOrder} changeOrder - Change order data
 * @param {number} margin - Page margin in mm
 * @param {number} pageHeight - Page height in mm
 */
export function renderFooter(doc, changeOrder, margin, pageHeight) {
  const yPos = pageHeight - 15;

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generated by ScopeShield on ${new Date().toLocaleString()}`,
    margin,
    yPos
  );
  doc.setTextColor(0);
}
