/* global chrome */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectionEventHandlers } from '../../../src/popup/components/DetectionEventHandlers.js';

// Mock storage
vi.mock('../../../src/utils/storage.js', () => ({
  acknowledgeEvent: vi.fn().mockResolvedValue(undefined),
  clearAllEvents: vi.fn().mockResolvedValue(undefined)
}));

// Mock NotificationManager
vi.mock('../../../src/popup/components/NotificationManager.js', () => ({
  showNotification: vi.fn()
}));

// Mock FreelancerSettings for ChangeOrderBuilder
vi.mock('../../../src/lib/storage/FreelancerSettings.js', () => ({
  FreelancerSettings: {
    async load() {
      return {
        freelancerName: 'Test Freelancer',
        hourlyRate: 100,
        currency: 'USD'
      };
    }
  }
}));

describe('DetectionEventHandlers', () => {
  let handlers;
  let mockEvents;
  let getEvents;
  let onEventsChanged;

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        senderName: 'John Doe',
        sender: 'john@example.com',
        detectedText: 'Can you also add this?',
        triggerWord: 'also',
        triggerWeight: 8,
        timestamp: Date.now(),
        acknowledged: false,
        url: 'https://mail.google.com/test1'
      },
      {
        id: '2',
        senderName: 'Jane Smith',
        sender: 'jane@example.com',
        detectedText: 'One more thing...',
        triggerWord: 'one more thing',
        triggerWeight: 9,
        timestamp: Date.now() - 3600000,
        acknowledged: false,
        url: 'https://mail.google.com/test2'
      }
    ];

    getEvents = vi.fn(() => mockEvents);
    onEventsChanged = vi.fn();

    handlers = new DetectionEventHandlers({
      getEvents,
      onEventsChanged
    });

    // Mock chrome.tabs
    global.chrome = {
      tabs: {
        create: vi.fn()
      }
    };

    // Mock navigator.clipboard
    global.navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };

    // Mock confirm
    global.confirm = vi.fn().mockReturnValue(true);

    // Mock querySelector
    document.querySelector = vi.fn().mockReturnValue({
      classList: {
        add: vi.fn()
      }
    });
  });

  describe('handleAcknowledge', () => {
    it('should acknowledge event in storage', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');

      await handlers.handleAcknowledge('1');

      expect(acknowledgeEvent).toHaveBeenCalledWith('1');
    });

    it('should update local state', async () => {
      await handlers.handleAcknowledge('1');

      expect(mockEvents[0].acknowledged).toBe(true);
    });

    it('should trigger onEventsChanged callback', async () => {
      await handlers.handleAcknowledge('1');

      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');
      acknowledgeEvent.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(handlers.handleAcknowledge('1')).resolves.toBeUndefined();
    });

    it('should add acknowledged class to DOM element', async () => {
      const mockElement = { classList: { add: vi.fn() } };
      document.querySelector = vi.fn().mockReturnValue(mockElement);

      await handlers.handleAcknowledge('1');

      expect(document.querySelector).toHaveBeenCalledWith('[data-id="1"]');
      expect(mockElement.classList.add).toHaveBeenCalledWith('acknowledged');
    });
  });

  describe('handleView', () => {
    it('should open URL in new tab', () => {
      handlers.handleView('https://mail.google.com/test');

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://mail.google.com/test'
      });
    });

    it('should not open tab if URL is null', () => {
      handlers.handleView(null);

      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });

    it('should not open tab if URL is undefined', () => {
      handlers.handleView(undefined);

      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });
  });

  describe('handleCopy', () => {
    it('should copy formatted text to clipboard', async () => {
      const event = mockEvents[0];

      await handlers.handleCopy(event);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
      expect(copiedText).toContain('Scope Creep Detected:');
      expect(copiedText).toContain('From: John Doe');
      expect(copiedText).toContain('Text: Can you also add this?');
      expect(copiedText).toContain('Trigger: also (Confidence: 8/10)');
    });

    it('should show success notification', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');
      const event = mockEvents[0];

      await handlers.handleCopy(event);

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Copied to clipboard!',
        'success',
        3000
      );
    });

    it('should handle clipboard API errors', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      const event = mockEvents[0];
      await handlers.handleCopy(event);

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Failed to copy',
        'error',
        3000
      );
    });
  });

  describe('handleClearAll', () => {
    it('should confirm before clearing', async () => {
      await handlers.handleClearAll();

      expect(confirm).toHaveBeenCalledWith('Clear all detection history? This cannot be undone.');
    });

    it('should clear events if confirmed', async () => {
      const { clearAllEvents } = await import('../../../src/utils/storage.js');

      await handlers.handleClearAll();

      expect(clearAllEvents).toHaveBeenCalled();
      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should not clear if cancelled', async () => {
      const { clearAllEvents } = await import('../../../src/utils/storage.js');
      global.confirm.mockReturnValueOnce(false);

      await handlers.handleClearAll();

      expect(clearAllEvents).not.toHaveBeenCalled();
    });

    it('should show success notification', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');

      await handlers.handleClearAll();

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'All detections cleared',
        'success',
        3000
      );
    });

    it('should handle errors gracefully', async () => {
      const { clearAllEvents } = await import('../../../src/utils/storage.js');
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');
      clearAllEvents.mockRejectedValueOnce(new Error('Storage error'));

      await handlers.handleClearAll();

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Failed to clear detections',
        'error',
        3000
      );
    });
  });

  describe('generateReport', () => {
    it('should show info if no unacknowledged events', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');
      mockEvents.forEach(e => { e.acknowledged = true; });

      await handlers.generateReport();

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'No unacknowledged detections to report',
        'info',
        3000
      );
    });

    it('should group detections by sender', async () => {
      await handlers.generateReport();

      const report = navigator.clipboard.writeText.mock.calls[0][0];
      expect(report).toContain('From: John Doe');
      expect(report).toContain('From: Jane Smith');
    });

    it('should acknowledge all events after copy', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');

      await handlers.generateReport();

      expect(acknowledgeEvent).toHaveBeenCalledTimes(2);
      expect(mockEvents[0].acknowledged).toBe(true);
      expect(mockEvents[1].acknowledged).toBe(true);
    });

    it('should trigger UI update after acknowledgment', async () => {
      await handlers.generateReport();

      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      await handlers.generateReport();

      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Failed to generate report',
        'error',
        3000
      );
    });
  });

  describe('acknowledgeMultipleEvents', () => {
    it('should acknowledge all events in parallel', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');

      await handlers.acknowledgeMultipleEvents(mockEvents);

      expect(acknowledgeEvent).toHaveBeenCalledTimes(2);
    });

    it('should mark all as acknowledged locally', async () => {
      await handlers.acknowledgeMultipleEvents(mockEvents);

      expect(mockEvents[0].acknowledged).toBe(true);
      expect(mockEvents[1].acknowledged).toBe(true);
    });

    it('should handle partial failures gracefully', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');
      acknowledgeEvent.mockResolvedValueOnce(undefined);
      acknowledgeEvent.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(handlers.acknowledgeMultipleEvents(mockEvents)).resolves.toBeUndefined();

      // Both should still be marked acknowledged locally
      expect(mockEvents[0].acknowledged).toBe(true);
      expect(mockEvents[1].acknowledged).toBe(true);
    });
  });
});
