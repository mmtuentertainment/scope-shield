/* global chrome */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadgeManager } from '../../../src/popup/components/BadgeManager.js';

// Mock storage
vi.mock('../../../src/utils/storage.js', () => ({
  getUnacknowledgedCount: vi.fn().mockResolvedValue(5)
}));

// Mock Logger
vi.mock('../../../src/lib/utils/Logger.js', () => ({
  logError: vi.fn()
}));

describe('BadgeManager', () => {
  let manager;

  beforeEach(() => {
    manager = new BadgeManager();

    // Mock chrome.runtime
    global.chrome = {
      runtime: {
        sendMessage: vi.fn()
      }
    };
  });

  describe('update', () => {
    it('should get unacknowledged count from storage', async () => {
      const { getUnacknowledgedCount } = await import('../../../src/utils/storage.js');

      await manager.update();

      expect(getUnacknowledgedCount).toHaveBeenCalled();
    });

    it('should send UPDATE_BADGE message with count', async () => {
      await manager.update();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'UPDATE_BADGE',
        count: 5
      });
    });

    it('should handle getUnacknowledgedCount errors', async () => {
      const { getUnacknowledgedCount } = await import('../../../src/utils/storage.js');
      const { logError } = await import('../../../src/lib/utils/Logger.js');
      getUnacknowledgedCount.mockRejectedValueOnce(new Error('Storage error'));

      await manager.update();

      expect(logError).toHaveBeenCalledWith(
        'BadgeManager.update failed',
        expect.any(Error)
      );
    });

    it('should handle sendMessage errors', async () => {
      const { logError } = await import('../../../src/lib/utils/Logger.js');
      chrome.runtime.sendMessage.mockImplementationOnce(() => {
        throw new Error('Message error');
      });

      await manager.update();

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should send UPDATE_BADGE message with count 0', async () => {
      await manager.clear();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'UPDATE_BADGE',
        count: 0
      });
    });

    it('should handle sendMessage errors', async () => {
      const { logError } = await import('../../../src/lib/utils/Logger.js');
      chrome.runtime.sendMessage.mockImplementationOnce(() => {
        throw new Error('Message error');
      });

      await manager.clear();

      expect(logError).toHaveBeenCalled();
    });
  });
});
