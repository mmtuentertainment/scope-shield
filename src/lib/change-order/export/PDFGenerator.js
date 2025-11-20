// PDF Generator Service
// Lazy-loads jsPDF and generates professional PDFs from change orders
//
// TODO Feature 004: PDF Internationalization (UTF-8 Font Support)
// Current: jsPDF default fonts don't support emojis, CJK characters
// Solution: Bundle Noto Sans subset (~500KB) OR strip with warning
// Trigger: 10+ user complaints about character encoding
// See: CLAUDE.md Future Work section

import { logInfo, logError, logWarning } from '../../utils/Logger.js';
import { generateChangeOrderFilename } from './FilenameUtils.js';

// Cached jsPDF instance (lazy-loaded)
let jsPDFInstance = null;

/**
 * Lazy-load jsPDF library
 * @returns {Promise<any>} jsPDF constructor
 * @private
 */
async function loadJsPDF() {
  if (jsPDFInstance) {
    return jsPDFInstance;
  }

  try {
    logInfo('PDFGenerator: Loading jsPDF library...');
    const module = await import('jspdf');

    // Handle different export formats
    jsPDFInstance = module.default || module.jsPDF;

    if (!jsPDFInstance) {
      throw new Error('jsPDF export not found in module');
    }

    logInfo('PDFGenerator: jsPDF loaded successfully');
    return jsPDFInstance;

  } catch (error) {
    jsPDFInstance = null; // Allow retry on next call
    logError('PDFGenerator: Failed to load jsPDF', error);
    throw new Error(`Failed to load PDF library: ${error.message}`);
  }
}

/**
 * Generate PDF from text content
 * @param {string} text - Change order text
 * @param {Object} metadata - PDF metadata
 * @param {string} metadata.clientName - Client name for metadata
 * @param {string} metadata.freelancerName - Freelancer name for metadata
 * @param {string} metadata.date - Date for metadata
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePDF(text, metadata = {}) {
  const startTime = performance.now();

  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided for PDF generation');
    }

    // Load jsPDF
    const jsPDF = await loadJsPDF();

    // Create PDF document (Phase 8: T265-T269 - wrap in try/catch for jsPDF errors)
    let doc;
    try {
      doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
    } catch (jsPDFError) {
      logError('PDFGenerator: jsPDF initialization failed', jsPDFError);
      throw new Error(`Failed to initialize PDF: ${jsPDFError.message}`);
    }

    // Set metadata
    if (metadata.clientName) {
      try {
        doc.setProperties({
          title: `Change Order - ${metadata.clientName}`,
          subject: 'Change Order Request',
          author: metadata.freelancerName || 'ScopeShield User',
          keywords: 'change order, scope creep',
          creator: 'ScopeShield Chrome Extension'
        });
      } catch (metadataError) {
        // Metadata errors are non-critical, just log and continue
        logWarning('PDFGenerator: Failed to set PDF metadata', metadataError);
      }
    }

    // Format text for PDF (Phase 8: T265-T269 - catch formatting errors)
    try {
      formatTextToPDF(doc, text);
    } catch (formatError) {
      logError('PDFGenerator: Text formatting failed', formatError);
      throw new Error(`Failed to format document: ${formatError.message}`);
    }

    // Generate blob (Phase 8: T265-T269 - catch output errors)
    let blob;
    try {
      blob = doc.output('blob');
    } catch (outputError) {
      logError('PDFGenerator: Blob generation failed', outputError);

      // Check for out-of-memory errors (CodeRabbit: Guard message type)
      const errMsg = typeof outputError.message === 'string' ? outputError.message : '';
      if (errMsg.toLowerCase().includes('memory')) {
        throw new Error('Out of memory: Document too large for PDF generation');
      }

      throw new Error(`Failed to generate PDF output: ${errMsg}`);
    }

    const duration = performance.now() - startTime;
    logInfo(`PDFGenerator: Generated PDF (${(blob.size / 1024).toFixed(2)}KB) in ${duration.toFixed(2)}ms`);

    // Warn if exceeds performance target (3000ms)
    if (duration > 3000) {
      logWarning(`PDFGenerator: Performance warning - generation took ${duration.toFixed(2)}ms (target <3000ms)`);
    }

    return blob;

  } catch (error) {
    const duration = performance.now() - startTime;
    logError(`PDFGenerator: Failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Initialize PDF configuration
 * @param {Object} doc - jsPDF document instance
 * @returns {Object} PDF configuration
 * @private
 */
function initializePDFConfig(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20; // mm
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7; // mm

  return {
    pageWidth,
    pageHeight,
    margin,
    maxWidth,
    lineHeight
  };
}

/**
 * Check and handle page break if needed
 * @param {Object} doc - jsPDF document instance
 * @param {number} yPosition - Current Y position
 * @param {Object} config - PDF configuration
 * @returns {number} Updated Y position
 * @private
 */
function checkPageBreak(doc, yPosition, config) {
  if (yPosition + config.lineHeight > config.pageHeight - config.margin) {
    doc.addPage();
    return config.margin;
  }
  return yPosition;
}

/**
 * Check if line is a header
 * Note: Uses simple heuristics - may misclassify all-caps acronyms or long headers
 * @param {string} line - Text line
 * @returns {boolean}
 * @private
 */
function isHeaderLine(line) {
  // Check for markdown header
  if (line.startsWith('##')) {
    return true;
  }

  // Check for all-caps text (must contain letters)
  if (line.length < 50) {
    const hasUppercase = /[A-Z]/.test(line);
    const hasLowercase = /[a-z]/.test(line);
    return hasUppercase && !hasLowercase;
  }

  return false;
}

/**
 * Format and render header line
 * @param {Object} doc - jsPDF document instance
 * @param {string} line - Header text
 * @param {number} yPosition - Current Y position
 * @param {Object} config - PDF configuration
 * @returns {number} Updated Y position
 * @private
 */
function formatHeader(doc, line, yPosition, config) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const headerText = line.replace(/^##\s*/, ''); // Remove markdown
  doc.text(headerText, config.margin, yPosition);
  return yPosition + (config.lineHeight * 1.5);
}

/**
 * Format and render body text with wrapping
 * @param {Object} doc - jsPDF document instance
 * @param {string} line - Body text
 * @param {number} yPosition - Current Y position
 * @param {Object} config - PDF configuration
 * @returns {number} Updated Y position
 * @private
 */
function formatBodyText(doc, line, yPosition, config) {
  // Handle empty lines
  if (!line.trim()) {
    return yPosition + (config.lineHeight * 0.5);
  }

  // Set body text formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Wrap and render text
  const wrappedLines = doc.splitTextToSize(line, config.maxWidth);

  for (const wrappedLine of wrappedLines) {
    yPosition = checkPageBreak(doc, yPosition, config);
    doc.text(wrappedLine, config.margin, yPosition);
    yPosition += config.lineHeight;
  }

  return yPosition;
}

/**
 * Format text content into PDF document
 * @param {Object} doc - jsPDF document instance
 * @param {string} text - Text to format
 * @private
 */
function formatTextToPDF(doc, text) {
  const config = initializePDFConfig(doc);
  const lines = text.split('\n');
  let yPosition = config.margin;

  doc.setFont('helvetica');

  for (const line of lines) {
    yPosition = checkPageBreak(doc, yPosition, config);

    if (isHeaderLine(line)) {
      yPosition = formatHeader(doc, line, yPosition, config);
    } else {
      yPosition = formatBodyText(doc, line, yPosition, config);
    }
  }
}

/**
 * Download PDF file
 * @param {string} text - Change order text
 * @param {Object} metadata - PDF metadata including filename info
 * @returns {Promise<{success: boolean, error?: string, fallbackSuggestion?: string}>}
 */
export async function downloadPDF(text, metadata = {}) {
  try {
    // Generate PDF blob
    const blob = await generatePDF(text, metadata);

    // Generate filename
    const filename = generateChangeOrderFilename(metadata, 'pdf');

    // Create download link (CodeRabbit: Use try/finally for URL cleanup)
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } finally {
      // Always revoke URL, even if click() throws
      URL.revokeObjectURL(url);
    }

    logInfo(`PDFGenerator: Downloaded as "${filename}"`);

    return { success: true };

  } catch (error) {
    // Phase 8 (T265-T269): Enhanced PDF error handling with fallback suggestions
    logError('PDFGenerator: Download failed', error);

    // Determine error type and provide specific guidance (CodeRabbit: Normalize message once)
    const msg = typeof error.message === 'string' ? error.message : '';
    let errorMessage = 'PDF generation failed';
    let fallbackSuggestion = 'Try exporting as text instead';

    if (msg.includes('Failed to load PDF library')) {
      errorMessage = 'PDF library failed to load';
      fallbackSuggestion = 'Use "Download as Text" for a simple .txt file';
    } else if (msg.includes('Out of memory')) {
      errorMessage = 'Document too large for PDF generation';
      fallbackSuggestion = 'Use "Download as Text" for large documents';
    } else if (msg.includes('Invalid text')) {
      errorMessage = 'Document content cannot be converted to PDF';
      fallbackSuggestion = 'Use "Download as Text" instead';
    } else if (error.name === 'QuotaExceededError' || msg.includes('QUOTA') || msg.includes('quota')) {
      errorMessage = 'Insufficient storage space for PDF';
      fallbackSuggestion = 'Free up browser storage or use "Copy to Clipboard"';
    }

    return {
      success: false,
      error: errorMessage,
      fallbackSuggestion
    };
  }
}

/**
 * Get expected filename for testing/preview
 * @param {Object} metadata - File metadata
 * @returns {string}
 */
export function getFilename(metadata) {
  return generateChangeOrderFilename(metadata, 'pdf');
}

/**
 * Check if jsPDF is currently loaded
 * @returns {boolean}
 */
export function isJsPDFLoaded() {
  return jsPDFInstance !== null;
}
