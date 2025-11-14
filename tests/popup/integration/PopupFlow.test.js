/* global chrome */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectionListRenderer } from '../../../src/popup/components/DetectionListRenderer.js';
import { DetectionEventHandlers } from '../../../src/popup/components/DetectionEventHandlers.js';

// Mock storage
vi.mock('../../../src/utils/storage.js', () => ({
  getDetectionEvents: vi.fn().mockResolvedValue([]),
  acknowledgeEvent: vi.fn().mockResolvedValue(undefined),
  clearAllEvents: vi.fn().mockResolvedValue(undefined),
  getUnacknowledgedCount: vi.fn().mockResolvedValue(3)
}));

// Mock NotificationManager
vi.mock('../../../src/popup/components/NotificationManager.js', () => ({
  showNotification: vi.fn()
}));

// Mock Logger
vi.mock('../../../src/lib/utils/Logger.js', () => ({
  logError: vi.fn()
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

describe('Popup Integration', () => {
  let container;
  let listRenderer;
  let eventHandlers;
  let mockEvents;
  let getEvents;
  let onEventsChanged;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    container.id = 'detections-list';
    document.body.appendChild(container);

    // Create template
    const template = document.createElement('template');
    template.id = 'detection-item-template';
    const itemDiv = document.createElement('div');
    itemDiv.className = 'detection-item';
    ['detection-sender', 'detection-time', 'detection-text', 'trigger-word', 'confidence-badge'].forEach(cls => {
      const div = document.createElement('div');
      div.className = cls;
      itemDiv.appendChild(div);
    });
    ['acknowledge', 'view', 'copy'].forEach(cls => {
      const btn = document.createElement('button');
      btn.className = cls;
      btn.textContent = cls;
      itemDiv.appendChild(btn);
    });
    template.content.appendChild(itemDiv);
    document.body.appendChild(template);

    // Setup mocks
    mockEvents = [
      {
        id: '1',
        senderName: 'John Doe',
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
        detectedText: 'One more thing',
        triggerWord: 'one more thing',
        triggerWeight: 9,
        timestamp: Date.now() - 3600000,
        acknowledged: false,
        url: 'https://mail.google.com/test2'
      }
    ];

    getEvents = vi.fn(() => mockEvents);
    onEventsChanged = vi.fn();

    // Initialize components
    listRenderer = new DetectionListRenderer(container);
    eventHandlers = new DetectionEventHandlers({
      getEvents,
      onEventsChanged
    });

    // Mock Chrome APIs
    global.chrome = {
      tabs: { create: vi.fn() },
      runtime: { sendMessage: vi.fn() }
    };
    global.navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    global.confirm = vi.fn().mockReturnValue(true);
    document.querySelector = vi.fn().mockReturnValue({
      classList: { add: vi.fn() }
    });
  });

  describe('Full User Workflows', () => {
    it('should handle acknowledge → badge update flow', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');

      // Render initial list
      listRenderer.render(mockEvents, {
        onAcknowledge: (id) => eventHandlers.handleAcknowledge(id),
        onView: (url) => eventHandlers.handleView(url),
        onCopy: (event) => eventHandlers.handleCopy(event)
      });

      expect(container.querySelectorAll('.detection-item').length).toBe(2);

      // User acknowledges first item
      await eventHandlers.handleAcknowledge('1');

      expect(acknowledgeEvent).toHaveBeenCalledWith('1');
      expect(mockEvents[0].acknowledged).toBe(true);
      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should handle copy → view → acknowledge flow', async () => {
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');

      // Render list
      listRenderer.render(mockEvents, {
        onAcknowledge: (id) => eventHandlers.handleAcknowledge(id),
        onView: (url) => eventHandlers.handleView(url),
        onCopy: (event) => eventHandlers.handleCopy(event)
      });

      // User copies event
      await eventHandlers.handleCopy(mockEvents[0]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Copied to clipboard!',
        'success',
        3000
      );

      // User views in Gmail
      eventHandlers.handleView(mockEvents[0].url);
      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: mockEvents[0].url });

      // User acknowledges
      await eventHandlers.handleAcknowledge('1');
      expect(mockEvents[0].acknowledged).toBe(true);
    });

    it('should handle generate report → acknowledge all flow', async () => {
      const { acknowledgeEvent } = await import('../../../src/utils/storage.js');
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');

      // Generate report
      await eventHandlers.generateReport();

      // Should copy report
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const report = navigator.clipboard.writeText.mock.calls[0][0];
      expect(report).toContain('CHANGE ORDER REQUEST');
      expect(report).toContain('2 items'); // New format shows count as "N items"

      // Should acknowledge all
      expect(acknowledgeEvent).toHaveBeenCalledTimes(2);
      expect(mockEvents[0].acknowledged).toBe(true);
      expect(mockEvents[1].acknowledged).toBe(true);

      // Should show success
      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'Change order copied to clipboard!',
        'success',
        3000
      );

      // Should trigger UI update
      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should handle clear all → empty state flow', async () => {
      const { clearAllEvents } = await import('../../../src/utils/storage.js');
      const { showNotification } = await import('../../../src/popup/components/NotificationManager.js');

      // Initial render with events
      listRenderer.render(mockEvents, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });
      expect(container.querySelectorAll('.detection-item').length).toBe(2);

      // User clears all
      await eventHandlers.handleClearAll();

      expect(confirm).toHaveBeenCalled();
      expect(clearAllEvents).toHaveBeenCalled();
      expect(showNotification).toHaveBeenCalledWith(
        'toast-notification',
        'All detections cleared',
        'success',
        3000
      );
      expect(onEventsChanged).toHaveBeenCalled();
    });

    it('should handle empty state → new detection flow', () => {
      // Start with no events
      listRenderer.render([], {});
      expect(container.querySelector('.empty-state')).toBeTruthy();

      // Add events and re-render
      listRenderer.render(mockEvents, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      expect(container.querySelector('.empty-state')).toBeFalsy();
      expect(container.querySelectorAll('.detection-item').length).toBe(2);
    });
  });
});
