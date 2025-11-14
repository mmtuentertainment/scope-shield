import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectionListRenderer } from '../../../src/popup/components/DetectionListRenderer.js';

describe('DetectionListRenderer', () => {
  let container;
  let renderer;

  beforeEach(() => {
    // Reset DOM to avoid leaking templates/containers between tests
    document.body.innerHTML = '';

    // Create container
    container = document.createElement('div');
    container.id = 'detections-list';
    document.body.appendChild(container);

    // Create template using safe DOM methods
    const template = document.createElement('template');
    template.id = 'detection-item-template';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'detection-item';

    const sender = document.createElement('div');
    sender.className = 'detection-sender';
    itemDiv.appendChild(sender);

    const time = document.createElement('div');
    time.className = 'detection-time';
    itemDiv.appendChild(time);

    const text = document.createElement('div');
    text.className = 'detection-text';
    itemDiv.appendChild(text);

    const trigger = document.createElement('div');
    trigger.className = 'trigger-word';
    itemDiv.appendChild(trigger);

    const badge = document.createElement('div');
    badge.className = 'confidence-badge';
    itemDiv.appendChild(badge);

    const ackBtn = document.createElement('button');
    ackBtn.className = 'acknowledge';
    ackBtn.textContent = 'Acknowledge';
    itemDiv.appendChild(ackBtn);

    const viewBtn = document.createElement('button');
    viewBtn.className = 'view';
    viewBtn.textContent = 'View';
    itemDiv.appendChild(viewBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy';
    copyBtn.textContent = 'Copy';
    itemDiv.appendChild(copyBtn);

    template.content.appendChild(itemDiv);
    document.body.appendChild(template);

    renderer = new DetectionListRenderer(container);
  });

  describe('render', () => {
    it('should show empty state when no detections', () => {
      renderer.render([], {});

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No scope creep detected yet');
    });

    it('should render detection items', () => {
      const events = [
        {
          id: '1',
          senderName: 'John Doe',
          detectedText: 'Can you also add this feature?',
          triggerWord: 'also',
          triggerWeight: 8,
          timestamp: Date.now(),
          acknowledged: false
        }
      ];

      renderer.render(events, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      const items = container.querySelectorAll('.detection-item');
      expect(items.length).toBe(1);
      expect(items[0].dataset.id).toBe('1');
    });

    it('should sort by timestamp (newest first)', () => {
      const now = Date.now();
      const events = [
        { id: '1', timestamp: now - 3600000, senderName: 'Old', detectedText: 'old', triggerWord: 'test', triggerWeight: 5 },
        { id: '2', timestamp: now, senderName: 'New', detectedText: 'new', triggerWord: 'test', triggerWeight: 5 },
        { id: '3', timestamp: now - 7200000, senderName: 'Older', detectedText: 'older', triggerWord: 'test', triggerWeight: 5 }
      ];

      renderer.render(events, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      const items = container.querySelectorAll('.detection-item');
      expect(items[0].dataset.id).toBe('2'); // Newest
      expect(items[1].dataset.id).toBe('1');
      expect(items[2].dataset.id).toBe('3'); // Oldest
    });

    it('should limit to 50 items', () => {
      const events = Array.from({ length: 75 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Text ${i}`,
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now() - i * 1000
      }));

      renderer.render(events, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      const items = container.querySelectorAll('.detection-item');
      expect(items.length).toBe(50);
    });

    it('should show truncation notice when >50 items', () => {
      const events = Array.from({ length: 75 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Text ${i}`,
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now() - i * 1000
      }));

      renderer.render(events, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      const notice = container.querySelector('.truncation-notice');
      expect(notice).toBeTruthy();
      expect(notice.textContent).toContain('Showing 50 of 75');
    });

    it('should not show truncation notice when ≤50 items', () => {
      const events = Array.from({ length: 30 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Text ${i}`,
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now() - i * 1000
      }));

      renderer.render(events, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      const notice = container.querySelector('.truncation-notice');
      expect(notice).toBeFalsy();
    });
  });

  describe('createDetectionItem', () => {
    it('should create item with correct data-id', () => {
      const event = {
        id: 'test-123',
        senderName: 'Test User',
        detectedText: 'Test text',
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now()
      };

      const itemEl = renderer.createDetectionItem(event, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      expect(itemEl.dataset.id).toBe('test-123');
    });

    it('should add acknowledged class if event acknowledged', () => {
      const event = {
        id: 'test-123',
        senderName: 'Test User',
        detectedText: 'Test text',
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now(),
        acknowledged: true
      };

      const itemEl = renderer.createDetectionItem(event, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      expect(itemEl.classList.contains('acknowledged')).toBe(true);
    });

    it('should populate sender, time, text, trigger', () => {
      const event = {
        id: 'test-123',
        senderName: 'John Doe',
        detectedText: 'Please add this feature',
        triggerWord: 'also',
        triggerWeight: 8,
        timestamp: Date.now()
      };

      const itemEl = renderer.createDetectionItem(event, {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      });

      expect(itemEl.querySelector('.detection-sender').textContent).toBe('John Doe');
      expect(itemEl.querySelector('.detection-text').textContent).toBe('Please add this feature');
      expect(itemEl.querySelector('.trigger-word').textContent).toBe('also');
    });

    // Template missing case tested implicitly - if template doesn't exist,
    // createDetectionItem logs error and returns null (line 104-106 in DetectionListRenderer.js)
  });

  describe('setConfidenceBadge', () => {
    let itemEl;

    beforeEach(() => {
      const template = document.getElementById('detection-item-template');
      const clone = template.content.cloneNode(true);
      itemEl = clone.querySelector('.detection-item');
    });

    it('should show weight as X/10', () => {
      renderer.setConfidenceBadge(itemEl, 7);
      const badge = itemEl.querySelector('.confidence-badge');
      expect(badge.textContent).toBe('7/10');
    });

    it('should add "high" class for weight ≥8', () => {
      renderer.setConfidenceBadge(itemEl, 8);
      const badge = itemEl.querySelector('.confidence-badge');
      expect(badge.classList.contains('high')).toBe(true);
    });

    it('should add "medium" class for 5≤weight<8', () => {
      renderer.setConfidenceBadge(itemEl, 6);
      const badge = itemEl.querySelector('.confidence-badge');
      expect(badge.classList.contains('medium')).toBe(true);
    });

    it('should add "low" class for weight <5', () => {
      renderer.setConfidenceBadge(itemEl, 3);
      const badge = itemEl.querySelector('.confidence-badge');
      expect(badge.classList.contains('low')).toBe(true);
    });
  });

  describe('attachListeners', () => {
    it('should call handlers when buttons clicked', () => {
      const handlers = {
        onAcknowledge: vi.fn(),
        onView: vi.fn(),
        onCopy: vi.fn()
      };

      const event = {
        id: 'test-123',
        url: 'https://mail.google.com/test',
        senderName: 'Test',
        detectedText: 'Test',
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now()
      };

      const itemEl = renderer.createDetectionItem(event, handlers);

      itemEl.querySelector('.acknowledge').click();
      expect(handlers.onAcknowledge).toHaveBeenCalledWith('test-123');

      itemEl.querySelector('.view').click();
      expect(handlers.onView).toHaveBeenCalledWith('https://mail.google.com/test');

      itemEl.querySelector('.copy').click();
      expect(handlers.onCopy).toHaveBeenCalledWith(event);
    });
  });

  describe('renderEmptyState', () => {
    it('should create empty state with icon and messages', () => {
      renderer.renderEmptyState();

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();

      const icon = emptyState.querySelector('img');
      expect(icon.src).toContain('icon48.png');

      expect(emptyState.textContent).toContain('No scope creep detected yet');
      expect(emptyState.textContent).toContain('Open Gmail to start monitoring');
    });
  });
});
