/**
 * PDF Section Renderers
 *
 * Individual section rendering methods for PDF generation.
 * Each method renders a specific section of the change order PDF.
 *
 * @module PDFSectionRenderers
 */

/**
 * Render the header section of a change order PDF, including title, order number, and date.
 * @param {jsPDF} doc - jsPDF document instance used for rendering.
 * @param {ChangeOrder} changeOrder - Change order data containing at least `changeOrderNumber` and optionally `dateCreated`.
 * @param {number} margin - Page margin in mm; used as the starting X/Y offset.
 * @returns {number} The Y coordinate (in mm) immediately after the rendered header. 
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
 * Render client and freelancer information blocks into the PDF.
 *
 * @param {jsPDF} doc - jsPDF document instance.
 * @param {ChangeOrder} changeOrder - Change order data; uses `clientName`, `clientEmail`, and `freelancerName`.
 * @param {number} margin - Left page margin in millimeters.
 * @returns {number} The updated Y position after rendering the sections.
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
 * Render the Original Scope section into the provided jsPDF document.
 *
 * Renders a labeled "Original Scope:" heading and the change order's original scope text (or "Not specified")
 * wrapped to the available page width, and advances the vertical position accordingly.
 *
 * @param {jsPDF} doc - The jsPDF document instance to render into.
 * @param {ChangeOrder} changeOrder - Change order data; `originalScope` is used as the section content.
 * @param {number} margin - Page margin in millimeters; used for horizontal positioning.
 * @param {number} pageWidth - Page width in millimeters; used to determine text wrapping width.
 * @returns {number} The updated Y position after rendering the section.
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
 * Render the "Requested Changes" section as a numbered list and return the updated vertical position.
 *
 * Renders a bold section label, then each requested change as a numbered item with wrapped text. Automatically inserts a new page and resets the Y position when content approaches the bottom margin.
 *
 * @param {jsPDF} doc - jsPDF document instance used for drawing.
 * @param {ChangeOrder} changeOrder - Change order data containing `requestedChanges` (array of strings).
 * @param {number} margin - Page margin in mm.
 * @param {number} pageWidth - Page width in mm.
 * @param {number} pageHeight - Page height in mm.
 * @returns {number} The updated Y position (in mm) after rendering the section.
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
 * Renders the Cost Estimate and Revised Timeline sections of the change order PDF.
 *
 * Starts rendering near y=200 and adds a new page if there is insufficient space. Writes labels
 * and the values for `costEstimate` and `revisedTimeline`, using 'TBD' or 'To be determined' when values are missing.
 *
 * @param {jsPDF} doc - jsPDF document instance.
 * @param {ChangeOrder} changeOrder - Change order data; expected to contain `costEstimate` and `revisedTimeline`.
 * @param {number} margin - Page margin in mm.
 * @param {number} pageHeight - Page height in mm.
 * @returns {number} The updated vertical position after rendering.
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
 * Render the Payment Terms section of the change order into the PDF.
 *
 * Uses changeOrder.paymentTerms if present; defaults to 'Net 30' when absent.
 *
 * @param {ChangeOrder} changeOrder - Change order object; its `paymentTerms` string is rendered when provided.
 * @returns {number} The updated vertical position (y) in millimeters after rendering the section.
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
 * Render the "Additional Notes" section when the change order contains notes.
 *
 * Renders the additionalNotes text (unless absent or equal to 'No additional notes'), wraps it to fit within pageWidth minus margins, and advances the vertical position. Will insert a new page if the section would start too close to the bottom of the current page.
 *
 * @param {jsPDF} doc - jsPDF document instance used for rendering.
 * @param {ChangeOrder} changeOrder - Change order object; reads `additionalNotes` from this object.
 * @param {number} margin - Page margin in millimeters.
 * @param {number} pageWidth - Page width in millimeters.
 * @param {number} pageHeight - Page height in millimeters.
 * @returns {number} New Y position after rendering the additional notes section.
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
 * Render a footer line with generation timestamp at the bottom of the page.
 *
 * Renders a small, muted line reading "Generated by ScopeShield on <timestamp>" positioned 15 mm above the bottom edge and resets text color afterwards.
 *
 * @param {jsPDF} doc - jsPDF document instance used to draw the footer.
 * @param {ChangeOrder} changeOrder - Change order data (not used in the footer content).
 * @param {number} margin - Left margin in mm where the footer text begins.
 * @param {number} pageHeight - Page height in mm used to compute the footer vertical position.
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