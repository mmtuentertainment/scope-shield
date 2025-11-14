// jsPDF integration test (converted from standalone script)

import { describe, it, expect } from 'vitest';
import { jsPDF } from 'jspdf';

// Minimum size in bytes for a valid PDF with text content
const MIN_VALID_PDF_SIZE = 1000;

describe('jsPDF Integration', () => {
  it('should generate valid PDF with text content', () => {
    // Create new PDF document
    const doc = new jsPDF();

    // Add text to PDF
    doc.text('ScopeShield Test PDF - Change Order Generator', 10, 10);

    // Generate PDF as data URI
    const pdfDataUri = doc.output('dataurlstring');

    // Validate PDF generation
    expect(pdfDataUri).toBeDefined();
    expect(pdfDataUri).toMatch(/^data:application\/pdf/);
    expect(pdfDataUri.length).toBeGreaterThan(MIN_VALID_PDF_SIZE);
  });

  it('should support PDF blob output format', () => {
    const doc = new jsPDF();
    doc.text('Test Content', 10, 10);

    const pdfBlob = doc.output('blob');

    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
  });
});
