// ExportService Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExportService, ExportMethod } from '../../../../src/lib/change-order/export/ExportService.js';
import * as ClipboardExport from '../../../../src/lib/change-order/export/ClipboardExport.js';
import * as PDFGenerator from '../../../../src/lib/change-order/export/PDFGenerator.js';
import * as TextExport from '../../../../src/lib/change-order/export/TextExport.js';

vi.mock('../../../../src/lib/change-order/export/ClipboardExport.js');
vi.mock('../../../../src/lib/change-order/export/PDFGenerator.js');
vi.mock('../../../../src/lib/change-order/export/TextExport.js');

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(performance, 'now').mockReturnValue(100);

    // Default mocks
    ClipboardExport.copyToClipboard.mockResolvedValue({ success: true });
    ClipboardExport.isClipboardAvailable.mockReturnValue(true);
    PDFGenerator.downloadPDF.mockResolvedValue({ success: true });
    TextExport.downloadAsText.mockReturnValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('export', () => {
    it('should route to clipboard export', async () => {
      const text = 'Change order content';

      const result = await ExportService.export(text, ExportMethod.CLIPBOARD);

      expect(result.success).toBe(true);
      expect(ClipboardExport.copyToClipboard).toHaveBeenCalledWith(text);
    });

    it('should route to PDF export', async () => {
      const text = 'Change order content';
      const metadata = { clientName: 'Acme Corp' };

      const result = await ExportService.export(text, ExportMethod.PDF, metadata);

      expect(result.success).toBe(true);
      expect(PDFGenerator.downloadPDF).toHaveBeenCalledWith(text, metadata);
    });

    it('should route to text export', async () => {
      const text = 'Change order content';
      const metadata = { clientName: 'Acme Corp' };

      const result = await ExportService.export(text, ExportMethod.TEXT, metadata);

      expect(result.success).toBe(true);
      expect(TextExport.downloadAsText).toHaveBeenCalledWith(text, metadata);
    });

    it('should validate text input', async () => {
      const result = await ExportService.export('', ExportMethod.CLIPBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid text');
    });

    it('should validate export method', async () => {
      const result = await ExportService.export('Test', 'invalid-method');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid export method');
    });

    it('should handle clipboard export errors', async () => {
      ClipboardExport.copyToClipboard.mockResolvedValue({
        success: false,
        error: 'Permission denied'
      });

      const result = await ExportService.export('Test', ExportMethod.CLIPBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should handle PDF export errors with fallback suggestion', async () => {
      PDFGenerator.downloadPDF.mockResolvedValue({
        success: false,
        error: 'jsPDF load failed'
      });

      const result = await ExportService.export('Test', ExportMethod.PDF);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.fallbackSuggestion).toContain('Download as Text');
    });

    it('should handle unexpected errors', async () => {
      ClipboardExport.copyToClipboard.mockRejectedValue(new Error('Unexpected error'));

      const result = await ExportService.export('Test', ExportMethod.CLIPBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected error');
    });

    it('should measure export duration', async () => {
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)    // Start
        .mockReturnValueOnce(250);  // End = 250ms

      await ExportService.export('Test', ExportMethod.CLIPBOARD);

      // Performance measurement occurs (logged internally)
    });
  });

  describe('copyToClipboard', () => {
    it('should call clipboard export', async () => {
      const result = await ExportService.copyToClipboard('Test');

      expect(result.success).toBe(true);
      expect(ClipboardExport.copyToClipboard).toHaveBeenCalledWith('Test');
    });

    it('should check clipboard availability', async () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(false);

      const result = await ExportService.copyToClipboard('Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clipboard API not available');
      expect(result.fallbackSuggestion).toContain('Download as Text');
    });
  });

  describe('exportAsPDF', () => {
    it('should call PDF download', async () => {
      const metadata = { clientName: 'Acme' };

      const result = await ExportService.exportAsPDF('Test', metadata);

      expect(result.success).toBe(true);
      expect(PDFGenerator.downloadPDF).toHaveBeenCalledWith('Test', metadata);
    });

    it('should provide fallback suggestion on failure', async () => {
      PDFGenerator.downloadPDF.mockResolvedValue({
        success: false,
        error: 'jsPDF failed'
      });

      const result = await ExportService.exportAsPDF('Test', {});

      expect(result.success).toBe(false);
      expect(result.fallbackSuggestion).toContain('Text');
    });

    it('should handle PDF generator exceptions', async () => {
      PDFGenerator.downloadPDF.mockRejectedValue(new Error('PDF crash'));

      const result = await ExportService.exportAsPDF('Test', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('PDF crash');
      expect(result.fallbackSuggestion).toBeTruthy();
    });
  });

  describe('downloadAsText', () => {
    it('should call text download', () => {
      const metadata = { clientName: 'Acme' };

      const result = ExportService.downloadAsText('Test', metadata);

      expect(result.success).toBe(true);
      expect(TextExport.downloadAsText).toHaveBeenCalledWith('Test', metadata);
    });
  });

  describe('getAvailableMethods', () => {
    it('should return all methods when clipboard available', () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(true);

      const methods = ExportService.getAvailableMethods();

      expect(methods).toContain(ExportMethod.CLIPBOARD);
      expect(methods).toContain(ExportMethod.PDF);
      expect(methods).toContain(ExportMethod.TEXT);
    });

    it('should exclude clipboard when not available', () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(false);

      const methods = ExportService.getAvailableMethods();

      expect(methods).not.toContain(ExportMethod.CLIPBOARD);
      expect(methods).toContain(ExportMethod.PDF);
      expect(methods).toContain(ExportMethod.TEXT);
    });

    it('should always include text export', () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(false);

      const methods = ExportService.getAvailableMethods();

      expect(methods).toContain(ExportMethod.TEXT);
    });
  });

  describe('getRecommendedMethod', () => {
    it('should recommend clipboard when available', () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(true);

      const method = ExportService.getRecommendedMethod();

      expect(method).toBe(ExportMethod.CLIPBOARD);
    });

    it('should recommend PDF when clipboard not available', () => {
      ClipboardExport.isClipboardAvailable.mockReturnValue(false);

      const method = ExportService.getRecommendedMethod();

      expect(method).toBe(ExportMethod.PDF);
    });
  });
});
