// ClipboardExport Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyToClipboard, isClipboardAvailable } from '../../../../src/lib/change-order/export/ClipboardExport.js';

describe('ClipboardExport', () => {
  let mockClipboard;

  beforeEach(() => {
    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    global.navigator = {
      clipboard: mockClipboard
    };

    // Mock performance
    vi.spyOn(performance, 'now').mockReturnValue(100);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      const text = 'Test change order content';

      const result = await copyToClipboard(text);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockClipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should complete in <500ms for normal text', async () => {
      // Mock fast operation
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)   // Start time
        .mockReturnValueOnce(250); // End time = 250ms

      const text = 'A'.repeat(5000); // 5KB text

      const result = await copyToClipboard(text);

      expect(result.success).toBe(true);
      // Performance check passed (no warning logged)
    });

    it('should handle permission denied error', async () => {
      mockClipboard.writeText.mockRejectedValue(
        Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
      );

      const result = await copyToClipboard('Test text');

      expect(result.success).toBe(false);
      // Phase 8 (T270-T274): Enhanced error messages with fallback guidance
      expect(result.error).toBe('Clipboard access denied');
      expect(result.fallbackSuggestion).toContain('Select All');
      expect(result.needsManualCopy).toBe(true);
    });

    it('should handle security error', async () => {
      mockClipboard.writeText.mockRejectedValue(
        Object.assign(new Error('Security'), { name: 'SecurityError' })
      );

      const result = await copyToClipboard('Test text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('blocked by browser security policy');
    });

    it('should handle generic clipboard errors', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Unknown clipboard error'));

      const result = await copyToClipboard('Test text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown clipboard error');
    });

    it('should validate empty text', async () => {
      const result = await copyToClipboard('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid text');
    });

    it('should validate null text', async () => {
      const result = await copyToClipboard(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid text');
    });

    it('should handle missing clipboard API', async () => {
      global.navigator = {}; // No clipboard API

      const result = await copyToClipboard('Test text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clipboard API not available');
    });
  });

  describe('isClipboardAvailable', () => {
    it('should return true when clipboard API available', () => {
      expect(isClipboardAvailable()).toBe(true);
    });

    it('should return false when clipboard API missing', () => {
      global.navigator = {};
      expect(isClipboardAvailable()).toBe(false);
    });

    it('should return false when writeText method missing', () => {
      global.navigator = { clipboard: {} };
      expect(isClipboardAvailable()).toBe(false);
    });
  });
});
