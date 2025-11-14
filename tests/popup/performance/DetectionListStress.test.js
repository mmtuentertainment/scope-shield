/**
 * Stress tests for Detection List with large datasets
 * Validates handling of >500 detections (Constitution III)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DetectionListRenderer } from '../../../src/popup/components/DetectionListRenderer.js';
import { MAX_DISPLAYED_DETECTIONS } from '../../../src/popup/constants.js';

describe('DetectionListRenderer Stress Tests', () => {
  let container;
  let renderer;

  beforeEach(() => {
    // Safe DOM cleanup - remove all child nodes
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    container = document.createElement('div');
    document.body.appendChild(container);

    // Create minimal template
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
      itemDiv.appendChild(btn);
    });
    template.content.appendChild(itemDiv);
    document.body.appendChild(template);

    renderer = new DetectionListRenderer(container);
  });

  describe('Large Dataset Handling', () => {
    it('should handle 500 detections efficiently', () => {
      const events = Array.from({ length: 500 }, (_, i) => ({
        id: `event-${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Detection text ${i} with some longer content to simulate real data`,
        triggerWord: i % 2 === 0 ? 'also' : 'one more thing',
        triggerWeight: (i % 10) + 1,
        timestamp: Date.now() - i * 1000
      }));

      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      // Should still render fast (only displays 50, not 500)
      expect(duration).toBeLessThan(500);

      // Verify truncation works correctly
      const items = container.querySelectorAll('.detection-item');
      expect(items.length).toBe(MAX_DISPLAYED_DETECTIONS);

      const notice = container.querySelector('.truncation-notice');
      expect(notice).toBeTruthy();
      expect(notice.textContent).toContain('Showing 50 of 500');

      console.log(`[Stress Test] 500→50 items rendered in ${duration.toFixed(2)}ms`);
    });

    it('should handle 1000 detections without memory issues', () => {
      const events = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        senderName: `Sender ${i % 50}`, // Repeat senders
        detectedText: `Text ${i}`,
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now() - i * 60000 // 1 minute apart
      }));

      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      // Should still be fast (sorting 1000 + slicing to 50)
      expect(duration).toBeLessThan(500);

      // Only 50 should be rendered
      expect(container.querySelectorAll('.detection-item').length).toBe(50);

      console.log(`[Stress Test] 1000→50 items in ${duration.toFixed(2)}ms`);
    });

    it('should maintain sort order with large dataset', () => {
      const events = Array.from({ length: 200 }, (_, i) => ({
        id: `event-${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Text ${i}`,
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now() - (199 - i) * 1000 // Reverse chronological
      }));

      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      const items = container.querySelectorAll('.detection-item');

      // First item should be newest (event-199)
      expect(items[0].dataset.id).toBe('event-199');

      // Last displayed item should be event-150 (199 - 49)
      expect(items[49].dataset.id).toBe('event-150');
    });
  });

  describe('Memory Management Under Load', () => {
    it('should not accumulate listeners with repeated renders', () => {
      const events = Array.from({ length: 30 }, (_, i) => ({
        id: `event-${i}`,
        senderName: 'Test',
        detectedText: 'Test',
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now() - i * 1000
      }));

      // Render 5 times
      for (let i = 0; i < 5; i++) {
        renderer.render(events, {
          onAcknowledge: () => {},
          onView: () => {},
          onCopy: () => {}
        });
      }

      // Should only have listeners from last render (30 items × 3 buttons = 90)
      expect(renderer.eventListeners.length).toBe(90);
    });

    it('should cleanup listeners when rendering empty state', () => {
      const events = Array.from({ length: 20 }, (_, i) => ({
        id: `event-${i}`,
        senderName: 'Test',
        detectedText: 'Test',
        triggerWord: 'test',
        triggerWeight: 5,
        timestamp: Date.now()
      }));

      // Render with items
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      expect(renderer.eventListeners.length).toBe(60); // 20 × 3

      // Render empty state
      renderer.render([], {});

      // All listeners should be cleaned up
      expect(renderer.eventListeners.length).toBe(0);
    });
  });
});
