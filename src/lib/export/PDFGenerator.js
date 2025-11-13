/**
 * PDF Generator Service
 *
 * Wraps jsPDF for generating professional change order PDFs.
 * Target: <3s generation time (p95).
 *
 * @module PDFGenerator
 */

import { jsPDF } from 'jspdf';
import { logInfo, logError, logPerformance } from '../utils/Logger.js';
import {
  renderHeader,
  renderClientInfo,
  renderOriginalScope,
  renderRequestedChanges,
  renderCostAndTimeline,
  renderPaymentTerms,
  renderAdditionalNotes,
  renderFooter
} from './PDFSectionRenderers.js';

class PDFGeneratorService {
  constructor() {
    // PDF configuration
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.lineHeight = 7;
  }

  /**
   * Generate PDF from change order
   *
   * @param {ChangeOrder} changeOrder - Change order to convert to PDF
   * @returns {Promise<Blob>} PDF blob
   * @throws {Error} If PDF generation fails
   */
  async generate(changeOrder) {
    const startTime = performance.now();

    try {
      if (!changeOrder) {
        throw new Error('ChangeOrder is required');
      }

      logInfo('PDFGenerator.generate: Starting PDF generation', {
        changeOrderId: changeOrder.id,
        changeOrderNumber: changeOrder.changeOrderNumber
      });

      // Create new PDF document (portrait, mm, A4)
      const doc = new jsPDF('p', 'mm', 'a4');

      // Set document metadata
      doc.setProperties({
        title: `Change Order ${changeOrder.changeOrderNumber}`,
        subject: 'Change Order Document',
        author: changeOrder.freelancerName || 'ScopeShield',
        creator: 'ScopeShield Chrome Extension'
      });

      // Render content (delegate to section renderers)
      renderHeader(doc, changeOrder, this.margin);
      renderClientInfo(doc, changeOrder, this.margin);
      renderOriginalScope(doc, changeOrder, this.margin, this.pageWidth);
      renderRequestedChanges(doc, changeOrder, this.margin, this.pageWidth, this.pageHeight);
      renderCostAndTimeline(doc, changeOrder, this.margin, this.pageHeight);
      renderPaymentTerms(doc, changeOrder, this.margin, this.pageHeight);
      renderAdditionalNotes(doc, changeOrder, this.margin, this.pageWidth, this.pageHeight);
      renderFooter(doc, changeOrder, this.margin, this.pageHeight);

      // Generate blob
      const pdfBlob = doc.output('blob');

      // Log performance
      const duration = performance.now() - startTime;
      logPerformance('PDFGenerator.generate', duration);

      if (duration > 3000) {
        logError('PDFGenerator.generate: Generation exceeded 3s threshold', {
          duration: `${duration.toFixed(0)}ms`,
          threshold: '3000ms'
        });
      }

      logInfo('PDFGenerator.generate: PDF generated successfully', {
        changeOrderId: changeOrder.id,
        duration: `${duration.toFixed(0)}ms`,
        size: `${(pdfBlob.size / 1024).toFixed(1)}KB`
      });

      return pdfBlob;
    } catch (error) {
      const duration = performance.now() - startTime;
      logError('PDFGenerator.generate: PDF generation failed', {
        error: error.message,
        duration: `${duration.toFixed(0)}ms`
      });
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate filename for PDF download
   *
   * @param {ChangeOrder} changeOrder - Change order
   * @returns {string} Filename
   */
  generateFilename(changeOrder) {
    const date = new Date().toISOString().split('T')[0];
    const clientName = (changeOrder.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
    const orderNum = changeOrder.changeOrderNumber.replace('#', '');

    return `ChangeOrder_${orderNum}_${clientName}_${date}.pdf`;
  }
}

// Export singleton instance
const pdfGenerator = new PDFGeneratorService();
export default pdfGenerator;

// Export class for testing
export { PDFGeneratorService };
