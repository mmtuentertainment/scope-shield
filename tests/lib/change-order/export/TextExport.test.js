// TextExport Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { downloadAsText, getFilename } from '../../../../src/lib/change-order/export/TextExport.js';

describe('TextExport', () => {
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

    // Mock performance
    vi.spyOn(performance, 'now').mockReturnValue(100);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadAsText', () => {
    it('should download text as .txt file', () => {
      const text = 'Change order content';
      const metadata = {
        clientName: 'Acme Corp',
        date: '2025-11-15'
      };

      const result = downloadAsText(text, metadata);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe('ChangeOrder_Acme_Corp_2025-11-15.txt');
    });

    it('should create blob with correct content', () => {
      const text = 'Test content';

      downloadAsText(text, {});

      // Verify blob was created with correct type
      const createCall = global.URL.createObjectURL.mock.calls[0][0];
      expect(createCall.type).toBe('text/plain;charset=utf-8');
    });

    it('should cleanup URL after download', () => {
      const text = 'Test';

      downloadAsText(text, {});

      expect(mockURL.created.length).toBe(1);
      expect(mockURL.revoked.length).toBe(1);
      expect(mockURL.revoked[0]).toBe(mockURL.created[0]);
    });

    it('should sanitize client name in filename', () => {
      const text = 'Test';
      const metadata = {
        clientName: 'Client Inc. / "Dangerous" <Name>',
        date: '2025-11-15'
      };

      downloadAsText(text, metadata);

      // Should remove unsafe characters
      expect(mockLink.download).toBe('ChangeOrder_Client_Inc_Dangerous_Name_2025-11-15.txt');
    });

    it('should use default client name if not provided', () => {
      const text = 'Test';

      downloadAsText(text, { date: '2025-11-15' });

      expect(mockLink.download).toBe('ChangeOrder_Client_2025-11-15.txt');
    });

    it('should use current date if not provided', () => {
      const text = 'Test';
      const today = new Date().toISOString().split('T')[0];

      downloadAsText(text, { clientName: 'Test' });

      expect(mockLink.download).toContain(today);
    });

    it('should validate empty text', () => {
      const result = downloadAsText('', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid text');
    });

    it('should validate null text', () => {
      const result = downloadAsText(null, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid text');
    });

    it('should handle download errors gracefully', () => {
      mockLink.click.mockImplementation(() => {
        throw new Error('Download blocked');
      });

      const result = downloadAsText('Test', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Download blocked');
    });
  });

  describe('getFilename', () => {
    it('should return correctly formatted filename', () => {
      const filename = getFilename({
        clientName: 'Acme Corp',
        date: '2025-11-15'
      });

      expect(filename).toBe('ChangeOrder_Acme_Corp_2025-11-15.txt');
    });

    it('should sanitize special characters', () => {
      const filename = getFilename({
        clientName: 'A/B\\C:D*E?F"G<H>I|J',
        date: '2025-11-15'
      });

      expect(filename).toBe('ChangeOrder_A_B_C_D_E_F_G_H_I_J_2025-11-15.txt');
    });

    it('should collapse multiple underscores', () => {
      const filename = getFilename({
        clientName: 'A   B   C',
        date: '2025-11-15'
      });

      expect(filename).toBe('ChangeOrder_A_B_C_2025-11-15.txt');
    });
  });
});
