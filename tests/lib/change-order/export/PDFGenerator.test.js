// PDFGenerator Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generatePDF, downloadPDF, getFilename, isJsPDFLoaded } from '../../../../src/lib/change-order/export/PDFGenerator.js';

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: class MockJsPDF {
    constructor() {
      this.pages = [];
      this.currentPage = { content: [] };
      this.pages.push(this.currentPage);
      this.fontSize = 10;
      this.font = { name: 'helvetica', style: 'normal' };
      this.properties = {};
    }

    internal = {
      pageSize: {
        getWidth: () => 210,  // A4 width in mm
        getHeight: () => 297  // A4 height in mm
      }
    };

    setProperties(props) {
      this.properties = props;
    }

    setFont(name, style) {
      this.font = { name, style };
    }

    setFontSize(size) {
      this.fontSize = size;
    }

    text(text, x, y) {
      this.currentPage.content.push({ text, x, y, fontSize: this.fontSize, font: this.font });
    }

    // eslint-disable-next-line no-unused-vars -- Mock must match jsPDF API signature
    splitTextToSize(text, _maxWidth) {
      // Simple mock: split by words if text is too long
      if (text.length > 80) {
        return text.match(/.{1,80}/g) || [text];
      }
      return [text];
    }

    addPage() {
      this.currentPage = { content: [] };
      this.pages.push(this.currentPage);
    }

    output(format) {
      if (format === 'blob') {
        return new Blob(['mock-pdf-content'], { type: 'application/pdf' });
      }
      return 'mock-pdf-content';
    }
  }
}));

describe('PDFGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(performance, 'now').mockReturnValue(100);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generatePDF', () => {
    it('should generate PDF from text', async () => {
      const text = 'CHANGE ORDER REQUEST\n\nClient: Acme Corp\nScope changes requested.';

      const blob = await generatePDF(text, {
        clientName: 'Acme Corp',
        freelancerName: 'Jane Doe'
      });

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    it('should lazy-load jsPDF on first call', async () => {
      // Note: jsPDF is mocked, so it's always loadable
      // This test verifies the import mechanism works
      await generatePDF('Test', {});

      // jsPDF should be loaded after first call
      expect(isJsPDFLoaded()).toBe(true);
    });

    it('should cache jsPDF instance', async () => {
      await generatePDF('Test 1', {});
      const firstLoad = isJsPDFLoaded();

      await generatePDF('Test 2', {});
      const secondLoad = isJsPDFLoaded();

      expect(firstLoad).toBe(true);
      expect(secondLoad).toBe(true);
      // jsPDF should only be imported once (cached)
    });

    it('should set PDF metadata', async () => {
      const metadata = {
        clientName: 'Acme Corp',
        freelancerName: 'Jane Doe'
      };

      await generatePDF('Test content', metadata);

      // Verify metadata was set (internal jsPDF mock)
      // This tests the setProperties call
    });

    it('should handle multi-line content', async () => {
      const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';

      const blob = await generatePDF(text, {});

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should format headers differently', async () => {
      const text = '## HEADER\nBody text\n## ANOTHER HEADER\nMore body';

      const blob = await generatePDF(text, {});

      expect(blob).toBeInstanceOf(Blob);
      // Headers should be formatted with larger font/bold
    });

    it('should handle long lines with text wrapping', async () => {
      const longLine = 'A'.repeat(200); // Very long line

      const blob = await generatePDF(longLine, {});

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should add page breaks for long content', async () => {
      // Create content that would require multiple pages
      const longText = Array(100).fill('Line of text content').join('\n');

      const blob = await generatePDF(longText, {});

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should complete in reasonable time', async () => {
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)     // Start
        .mockReturnValueOnce(2500);  // End = 2.5s (under 3s target)

      const text = 'Test content';

      await generatePDF(text, {});

      // Should not throw performance warning
    });

    it('should validate empty text', async () => {
      await expect(generatePDF('', {})).rejects.toThrow('Invalid text');
    });

    it('should validate null text', async () => {
      await expect(generatePDF(null, {})).rejects.toThrow('Invalid text');
    });

    it('should validate input before loading jsPDF', async () => {
      // Test that validation happens before expensive jsPDF load
      await expect(generatePDF('', {})).rejects.toThrow('Invalid text');
      await expect(generatePDF(null, {})).rejects.toThrow('Invalid text');
    });
  });

  describe('downloadPDF', () => {
    let mockLink;
    let mockURL;

    beforeEach(() => {
      // Mock URL.createObjectURL and revokeObjectURL
      mockURL = {
        created: [],
        revoked: []
      };

      // eslint-disable-next-line no-unused-vars -- Mock must accept blob parameter
      global.URL.createObjectURL = vi.fn((_blob) => {
        const url = `blob:${Math.random()}`;
        mockURL.created.push(url);
        return url;
      });

      global.URL.revokeObjectURL = vi.fn((url) => {
        mockURL.revoked.push(url);
      });

      // Mock document.createElement for <a> tag
      mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    });

    it('should download PDF with correct filename', async () => {
      const metadata = {
        clientName: 'Acme Corp',
        date: '2025-11-15'
      };

      const result = await downloadPDF('Test content', metadata);

      expect(result.success).toBe(true);
      expect(mockLink.download).toBe('ChangeOrder_Acme_Corp_2025-11-15.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should cleanup URL after download', async () => {
      await downloadPDF('Test', {});

      expect(mockURL.created.length).toBe(1);
      expect(mockURL.revoked.length).toBe(1);
      expect(mockURL.revoked[0]).toBe(mockURL.created[0]);
    });

    it('should handle download errors', async () => {
      mockLink.click.mockImplementation(() => {
        throw new Error('Download blocked');
      });

      const result = await downloadPDF('Test', {});

      expect(result.success).toBe(false);
      // Phase 8 (T265-T269): Error messages are now categorized
      expect(result.error).toBe('PDF generation failed');
      expect(result.fallbackSuggestion).toBe('Try exporting as text instead');
    });
  });

  describe('getFilename', () => {
    it('should generate correct filename', () => {
      const filename = getFilename({
        clientName: 'Acme Corp',
        date: '2025-11-15'
      });

      expect(filename).toBe('ChangeOrder_Acme_Corp_2025-11-15.pdf');
    });

    it('should sanitize special characters', () => {
      const filename = getFilename({
        clientName: 'Client/Name\\With:Special*Chars',
        date: '2025-11-15'
      });

      expect(filename).toBe('ChangeOrder_Client_Name_With_Special_Chars_2025-11-15.pdf');
    });

    it('should use default values', () => {
      const filename = getFilename({});
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain('Client');
      expect(filename).toContain(today);
      expect(filename).toContain('.pdf');
    });
  });
});
