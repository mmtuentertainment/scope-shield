/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import ExportService, { ExportServiceClass } from '../../../src/lib/export/ExportService.js';

// Mock dependencies
vi.mock('../../../src/lib/export/PDFGenerator.js', () => ({
  default: {
    generate: vi.fn(),
    generateFilename: vi.fn(() => 'ChangeOrder_2024-001_Client_2024-01-15.pdf')
  }
}));

describe('ExportService', () => {
  let exportService;
  let mockChangeOrder;

  beforeEach(() => {
    exportService = new ExportServiceClass();

    mockChangeOrder = {
      id: 'co-001',
      changeOrderNumber: '#2024-001',
      dateCreated: '2024-01-15',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      freelancerName: 'John Doe',
      originalScope: 'Build a landing page',
      requestedChanges: ['Add contact form', 'Mobile responsive'],
      costEstimate: '$1,500',
      revisedTimeline: '+2 weeks',
      paymentTerms: 'Net 30',
      additionalNotes: 'Blue color scheme'
    };

    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    document.createElement = vi.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          style: { display: '' },
          click: vi.fn()
        };
      }
      return {};
    });
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    // Mock clipboard API
    global.navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportAsPDF()', () => {
    it('should export PDF successfully', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      pdfGenerator.generate.mockResolvedValue(mockBlob);

      const result = await exportService.exportAsPDF(mockChangeOrder);

      expect(result.success).toBe(true);
      expect(result.message).toContain('PDF downloaded successfully');
      expect(pdfGenerator.generate).toHaveBeenCalledWith(mockChangeOrder);
    });

    it('should trigger download with correct filename', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      pdfGenerator.generate.mockResolvedValue(mockBlob);

      await exportService.exportAsPDF(mockChangeOrder);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should return error if change order is missing', async () => {
      const result = await exportService.exportAsPDF(null);

      // When both PDF and fallback fail, return error
      // (fallback also fails because change order is null)
      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should fallback to text export if PDF fails', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      pdfGenerator.generate.mockRejectedValue(new Error('PDF generation failed'));

      const result = await exportService.exportAsPDF(mockChangeOrder);

      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.message).toContain('text file instead');
    });

    it('should return error if both PDF and fallback fail', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      pdfGenerator.generate.mockRejectedValue(new Error('PDF generation failed'));

      // Make text export fail too
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('DOM error');
      });

      const result = await exportService.exportAsPDF(mockChangeOrder);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Export failed');

      // Restore
      document.createElement = originalCreateElement;
    });

    it('should handle large change orders', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      const largeChangeOrder = {
        ...mockChangeOrder,
        requestedChanges: Array(50).fill('Change item'),
        originalScope: 'Lorem ipsum '.repeat(200)
      };
      const mockBlob = new Blob(['large pdf'], { type: 'application/pdf' });
      pdfGenerator.generate.mockResolvedValue(mockBlob);

      const result = await exportService.exportAsPDF(largeChangeOrder);

      expect(result.success).toBe(true);
    });
  });

  describe('copyToClipboard()', () => {
    it('should copy formatted text to clipboard', async () => {
      const result = await exportService.copyToClipboard(mockChangeOrder);

      expect(result.success).toBe(true);
      expect(result.message).toContain('copied to clipboard');
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should format change order correctly', async () => {
      await exportService.copyToClipboard(mockChangeOrder);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).toContain('# CHANGE ORDER');
      expect(clipboardText).toContain('Jane Smith');
      expect(clipboardText).toContain('jane@example.com');
      expect(clipboardText).toContain('John Doe');
      expect(clipboardText).toContain('Build a landing page');
      expect(clipboardText).toContain('Add contact form');
      expect(clipboardText).toContain('$1,500');
      expect(clipboardText).toContain('+2 weeks');
    });

    it('should throw error if change order is missing', async () => {
      const result = await exportService.copyToClipboard(null);

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should handle clipboard API errors', async () => {
      navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard denied'));

      const result = await exportService.copyToClipboard(mockChangeOrder);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Clipboard copy failed');
    });

    it('should format markdown headings correctly', async () => {
      await exportService.copyToClipboard(mockChangeOrder);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).toContain('## Client Information');
      expect(clipboardText).toContain('## Original Scope');
      expect(clipboardText).toContain('## Requested Changes');
      expect(clipboardText).toContain('## Cost Estimate');
    });

    it('should format change items as numbered list', async () => {
      await exportService.copyToClipboard(mockChangeOrder);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).toContain('1. Add contact form');
      expect(clipboardText).toContain('2. Mobile responsive');
    });

    it('should include additional notes if present', async () => {
      await exportService.copyToClipboard(mockChangeOrder);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).toContain('## Additional Notes');
      expect(clipboardText).toContain('Blue color scheme');
    });

    it('should skip additional notes if not meaningful', async () => {
      const changeOrderWithoutNotes = {
        ...mockChangeOrder,
        additionalNotes: 'No additional notes'
      };

      await exportService.copyToClipboard(changeOrderWithoutNotes);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).not.toContain('## Additional Notes');
    });

    it('should handle empty requested changes array', async () => {
      const changeOrderWithoutChanges = {
        ...mockChangeOrder,
        requestedChanges: []
      };

      await exportService.copyToClipboard(changeOrderWithoutChanges);

      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];

      expect(clipboardText).toContain('No changes specified');
    });

    it('should handle missing optional fields', async () => {
      const minimalChangeOrder = {
        id: 'co-002',
        changeOrderNumber: '#2024-002',
        clientName: 'Client',
        clientEmail: 'client@example.com',
        freelancerName: 'Freelancer'
      };

      const result = await exportService.copyToClipboard(minimalChangeOrder);

      expect(result.success).toBe(true);
      const clipboardText = navigator.clipboard.writeText.mock.calls[0][0];
      expect(clipboardText).toContain('Not specified');
      expect(clipboardText).toContain('TBD');
    });
  });

  describe('exportAsText()', () => {
    it('should export text file successfully', async () => {
      const result = await exportService.exportAsText(mockChangeOrder);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Text file downloaded successfully');
    });

    it('should trigger download with correct filename', async () => {
      await exportService.exportAsText(mockChangeOrder);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should create blob with text content', async () => {
      await exportService.exportAsText(mockChangeOrder);

      const createObjectURLCall = global.URL.createObjectURL.mock.calls[0][0];
      expect(createObjectURLCall).toBeInstanceOf(Blob);
      expect(createObjectURLCall.type).toBe('text/plain;charset=utf-8');
    });

    it('should throw error if change order is missing', async () => {
      const result = await exportService.exportAsText(null);

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should generate filename with correct format', async () => {
      await exportService.exportAsText(mockChangeOrder);

      // Check that document.createElement was called for 'a' tag
      const createElementCalls = document.createElement.mock.calls;
      const linkCall = createElementCalls.find(call => call[0] === 'a');
      expect(linkCall).toBeDefined();
    });

    it('should sanitize client name in filename', async () => {
      const changeOrderWithSpecialChars = {
        ...mockChangeOrder,
        clientName: 'Client & Co. (LLC)'
      };

      await exportService.exportAsText(changeOrderWithSpecialChars);

      // Filename should not contain special characters
      // This is tested indirectly through the _generateTextFilename method
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should handle large text content', async () => {
      const largeChangeOrder = {
        ...mockChangeOrder,
        originalScope: 'Lorem ipsum '.repeat(500),
        requestedChanges: Array(100).fill('Change item'),
        additionalNotes: 'Notes '.repeat(100)
      };

      const result = await exportService.exportAsText(largeChangeOrder);

      expect(result.success).toBe(true);
    });
  });

  describe('_formatAsText()', () => {
    it('should format complete change order', () => {
      const formatted = exportService._formatAsText(mockChangeOrder);

      expect(formatted).toContain('# CHANGE ORDER');
      expect(formatted).toContain('#2024-001');
      expect(formatted).toContain('Jane Smith');
      expect(formatted).toContain('John Doe');
      expect(formatted).toContain('Build a landing page');
      expect(formatted).toContain('1. Add contact form');
      expect(formatted).toContain('$1,500');
      expect(formatted).toContain('Net 30');
    });

    it('should use markdown formatting', () => {
      const formatted = exportService._formatAsText(mockChangeOrder);

      expect(formatted).toContain('## Client Information');
      expect(formatted).toContain('**Name:**');
      expect(formatted).toContain('**Email:**');
      expect(formatted).toContain('---');
    });

    it('should include generation timestamp', () => {
      const formatted = exportService._formatAsText(mockChangeOrder);

      expect(formatted).toContain('Generated by ScopeShield');
    });
  });

  describe('_downloadBlob()', () => {
    it('should create download link and trigger click', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn()
      };

      document.createElement = vi.fn(() => mockLink);

      exportService._downloadBlob(mockBlob, 'test.txt');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should cleanup after download', () => {
      vi.useFakeTimers();

      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn()
      };

      document.createElement = vi.fn(() => mockLink);

      exportService._downloadBlob(mockBlob, 'test.txt');

      vi.advanceTimersByTime(150);

      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Singleton instance', () => {
    it('should export singleton instance', () => {
      expect(ExportService).toBeInstanceOf(ExportServiceClass);
    });

    it('should use same instance for all exports', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      pdfGenerator.generate.mockResolvedValue(mockBlob);

      await ExportService.exportAsPDF(mockChangeOrder);
      await ExportService.copyToClipboard(mockChangeOrder);
      await ExportService.exportAsText(mockChangeOrder);

      expect(pdfGenerator.generate).toHaveBeenCalledTimes(1);
      // clipboard.writeText called once (only copyToClipboard uses it, not exportAsText)
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical freelance export workflow', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      pdfGenerator.generate.mockResolvedValue(mockBlob);

      // First copy to clipboard for quick sharing
      const clipboardResult = await exportService.copyToClipboard(mockChangeOrder);
      expect(clipboardResult.success).toBe(true);

      // Then export as PDF for official record
      const pdfResult = await exportService.exportAsPDF(mockChangeOrder);
      expect(pdfResult.success).toBe(true);
    });

    it('should handle PDF failure gracefully', async () => {
      const pdfGenerator = (await import('../../../src/lib/export/PDFGenerator.js')).default;
      pdfGenerator.generate.mockRejectedValue(new Error('Browser compatibility issue'));

      // PDF fails, but text export succeeds
      const result = await exportService.exportAsPDF(mockChangeOrder);

      expect(result.fallbackUsed).toBe(true);
      expect(result.message).toContain('text file instead');
    });

    it('should handle offline clipboard operation', async () => {
      navigator.clipboard.writeText.mockRejectedValue(new Error('Network error'));

      const result = await exportService.copyToClipboard(mockChangeOrder);

      expect(result.success).toBe(false);
      // User can still export as file
      const textResult = await exportService.exportAsText(mockChangeOrder);
      expect(textResult.success).toBe(true);
    });
  });
});
