/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import pdfGenerator, { PDFGeneratorService } from '../../../src/lib/export/PDFGenerator.js';

// Mock jsPDF
const mockJsPDFInstance = {
  setProperties: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  splitTextToSize: vi.fn((text) => [text]),
  addPage: vi.fn(),
  output: vi.fn(() => new Blob(['mock pdf content'], { type: 'application/pdf' }))
};

vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn(() => mockJsPDFInstance)
  };
});

describe('PDFGenerator', () => {
  let generator;
  let mockChangeOrder;

  beforeEach(() => {
    generator = new PDFGeneratorService();

    mockChangeOrder = {
      id: 'co-001',
      changeOrderNumber: '#2024-001',
      dateCreated: '2024-01-15',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      freelancerName: 'John Doe',
      originalScope: 'Build a landing page with 3 sections',
      requestedChanges: [
        'Add contact form with validation',
        'Implement mobile responsive design',
        'Add analytics tracking'
      ],
      costEstimate: '$1,500',
      revisedTimeline: '+2 weeks (January 29, 2024)',
      paymentTerms: 'Net 30',
      additionalNotes: 'Client prefers blue color scheme'
    };
  });

  describe('generate()', () => {
    it('should generate PDF blob successfully', async () => {
      const result = await generator.generate(mockChangeOrder);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should throw error if change order is missing', async () => {
      await expect(generator.generate(null)).rejects.toThrow('ChangeOrder is required');
    });

    it('should throw error if change order is undefined', async () => {
      await expect(generator.generate(undefined)).rejects.toThrow('ChangeOrder is required');
    });

    it('should handle change orders with minimal data', async () => {
      const minimalChangeOrder = {
        id: 'co-002',
        changeOrderNumber: '#2024-002',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        freelancerName: 'Test Freelancer'
      };

      const result = await generator.generate(minimalChangeOrder);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle change orders with empty arrays', async () => {
      const changeOrderWithEmptyArrays = {
        ...mockChangeOrder,
        requestedChanges: []
      };

      const result = await generator.generate(changeOrderWithEmptyArrays);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should complete within 3 seconds', async () => {
      const startTime = performance.now();
      await generator.generate(mockChangeOrder);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(3000);
    });

    it('should handle long text content', async () => {
      const longTextChangeOrder = {
        ...mockChangeOrder,
        originalScope: 'Lorem ipsum '.repeat(100),
        additionalNotes: 'Additional notes '.repeat(50)
      };

      const result = await generator.generate(longTextChangeOrder);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle many requested changes', async () => {
      const manyChangesOrder = {
        ...mockChangeOrder,
        requestedChanges: Array(20).fill('Change item').map((item, i) => `${item} ${i + 1}`)
      };

      const result = await generator.generate(manyChangesOrder);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle special characters in text', async () => {
      const specialCharsOrder = {
        ...mockChangeOrder,
        clientName: 'José García-López',
        originalScope: 'Build site with €1,000 budget & < 50ms latency'
      };

      const result = await generator.generate(specialCharsOrder);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('generateFilename()', () => {
    it('should generate filename with correct format', () => {
      const filename = generator.generateFilename(mockChangeOrder);

      expect(filename).toMatch(/^ChangeOrder_2024-001_Jane_Smith_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize client name for filename', () => {
      const changeOrderWithSpecialChars = {
        ...mockChangeOrder,
        clientName: 'Jane & Co. (LLC)'
      };

      const filename = generator.generateFilename(changeOrderWithSpecialChars);

      expect(filename).not.toContain('&');
      expect(filename).not.toContain('(');
      expect(filename).not.toContain(')');
      expect(filename).not.toContain(' ');
    });

    it('should remove # from change order number', () => {
      const filename = generator.generateFilename(mockChangeOrder);

      expect(filename).not.toContain('#');
      expect(filename).toContain('2024-001');
    });

    it('should handle missing client name', () => {
      const changeOrderWithoutName = {
        ...mockChangeOrder,
        clientName: null
      };

      const filename = generator.generateFilename(changeOrderWithoutName);

      expect(filename).toContain('Client');
    });

    it('should include today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const filename = generator.generateFilename(mockChangeOrder);

      expect(filename).toContain(today);
    });
  });

  describe('Singleton instance', () => {
    it('should export singleton instance', () => {
      expect(pdfGenerator).toBeInstanceOf(PDFGeneratorService);
    });

    it('should generate using singleton', async () => {
      const result = await pdfGenerator.generate(mockChangeOrder);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Configuration', () => {
    it('should have correct page dimensions (A4)', () => {
      expect(generator.pageWidth).toBe(210); // A4 width in mm
      expect(generator.pageHeight).toBe(297); // A4 height in mm
    });

    it('should have consistent margins', () => {
      expect(generator.margin).toBe(20);
    });

    it('should have defined line height', () => {
      expect(generator.lineHeight).toBe(7);
    });
  });

  describe('Error handling', () => {
    it('should wrap jsPDF errors in readable messages', async () => {
      // Mock jsPDF to throw an error
      const { jsPDF } = await import('jspdf');
      jsPDF.mockImplementationOnce(() => {
        throw new Error('jsPDF initialization failed');
      });

      await expect(generator.generate(mockChangeOrder)).rejects.toThrow(
        'PDF generation failed'
      );
    });

    it('should log performance metrics on success', async () => {
      const result = await generator.generate(mockChangeOrder);

      expect(result).toBeInstanceOf(Blob);
      // Performance logging is internal, just verify no errors
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical freelance change order', async () => {
      const typicalOrder = {
        id: 'co-003',
        changeOrderNumber: '#2024-003',
        dateCreated: '2024-01-20',
        clientName: 'TechCorp Inc',
        clientEmail: 'pm@techcorp.com',
        freelancerName: 'Sarah Developer',
        originalScope: 'Build e-commerce site with 5 product pages',
        requestedChanges: [
          'Add shopping cart functionality',
          'Integrate Stripe payment gateway',
          'Add user authentication'
        ],
        costEstimate: '$3,500',
        revisedTimeline: '+4 weeks',
        paymentTerms: '50% upfront, 50% on completion',
        additionalNotes: 'Client wants staging environment for testing'
      };

      const result = await generator.generate(typicalOrder);

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle minimal change order (quick fix)', async () => {
      const quickFix = {
        id: 'co-004',
        changeOrderNumber: '#2024-004',
        clientName: 'Quick Client',
        clientEmail: 'quick@example.com',
        freelancerName: 'Fast Developer',
        requestedChanges: ['Fix broken contact form'],
        costEstimate: '$150',
        revisedTimeline: '+2 days'
      };

      const result = await generator.generate(quickFix);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle large enterprise change order', async () => {
      const enterpriseOrder = {
        id: 'co-005',
        changeOrderNumber: '#2024-005',
        dateCreated: '2024-01-25',
        clientName: 'Global Enterprise Corp',
        clientEmail: 'enterprise@global.com',
        freelancerName: 'Senior Consultant',
        originalScope: 'Enterprise application development with complex architecture',
        requestedChanges: Array(15).fill('').map((_, i) =>
          `Enterprise requirement ${i + 1}: Complex feature with multiple stakeholders`
        ),
        costEstimate: '$50,000',
        revisedTimeline: '+12 weeks',
        paymentTerms: 'Monthly billing on Net 30',
        additionalNotes: 'Requires security audit and compliance review. Multiple stakeholder approvals needed.'
      };

      const result = await generator.generate(enterpriseOrder);

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });
  });
});
