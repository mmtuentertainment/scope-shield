/**
 * Performance tests for Detection List Rendering
 * Constitution Principle III: Real-time performance <500ms
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DetectionListRenderer } from '../../../src/popup/components/DetectionListRenderer.js';
import { MAX_DISPLAYED_DETECTIONS } from '../../../src/popup/constants.js';

describe('DetectionListRenderer Performance', () => {
  let container;
  let renderer;

  beforeEach(() => {
    container = document.createElement('div');
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
      itemDiv.appendChild(btn);
    });
    template.content.appendChild(itemDiv);
    document.body.appendChild(template);

    renderer = new DetectionListRenderer(container);
  });

  describe('Render Performance (Constitution III)', () => {
    it('should render 50 items in <500ms', () => {
      const events = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Detection text ${i}`,
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now() - i * 1000
      }));

      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500);
      console.log(`[Performance] Rendered 50 items in ${duration.toFixed(2)}ms`);
    });

    it('should render MAX_DISPLAYED_DETECTIONS items efficiently', () => {
      const events = Array.from({ length: MAX_DISPLAYED_DETECTIONS }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Detection text ${i}`,
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now() - i * 1000
      }));

      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      // Should be well under 500ms target
      expect(duration).toBeLessThan(500);
      console.log(`[Performance] Rendered ${MAX_DISPLAYED_DETECTIONS} items in ${duration.toFixed(2)}ms`);
    });

    it('should handle 100+ items without degradation', () => {
      // Create 150 items to test truncation + performance
      const events = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Detection text ${i}`,
        triggerWord: 'also',
        triggerWeight: 7,
        timestamp: Date.now() - i * 1000
      }));

      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      // Should still render fast (only displays 50, not 150)
      expect(duration).toBeLessThan(500);

      // Verify truncation
      const items = container.querySelectorAll('.detection-item');
      expect(items.length).toBe(MAX_DISPLAYED_DETECTIONS);

      const notice = container.querySelector('.truncation-notice');
      expect(notice).toBeTruthy();

      console.log(`[Performance] Rendered 150→50 items in ${duration.toFixed(2)}ms`);
    });

    it('should destroy and re-render efficiently', () => {
      const events = Array.from({ length: 30 }, (_, i) => ({
        id: `${i}`,
        senderName: `Sender ${i}`,
        detectedText: `Text ${i}`,
        triggerWord: 'also',
        triggerWeight: 5,
        timestamp: Date.now() - i * 1000
      }));

      // First render
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      // Second render (should clean up and re-render)
      const startTime = performance.now();
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });
      const duration = performance.now() - startTime;

      // Re-render should be fast with cleanup
      expect(duration).toBeLessThan(500);
      console.log(`[Performance] Re-render with cleanup: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on destroy', () => {
      const events = [
        {
          id: '1',
          senderName: 'Test',
          detectedText: 'Test',
          triggerWord: 'test',
          triggerWeight: 5,
          timestamp: Date.now()
        }
      ];

      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      // Should have 3 listeners per item (acknowledge, view, copy)
      expect(renderer.eventListeners.length).toBe(3);

      // Destroy should clear all
      renderer.destroy();
      expect(renderer.eventListeners.length).toBe(0);
    });

    it('should clean up listeners before re-render', () => {
      const events = [
        { id: '1', senderName: 'Test', detectedText: 'Test', triggerWord: 'test', triggerWeight: 5, timestamp: Date.now() }
      ];

      // First render
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      const firstListenerCount = renderer.eventListeners.length;
      expect(firstListenerCount).toBe(3);

      // Second render should not accumulate listeners
      renderer.render(events, {
        onAcknowledge: () => {},
        onView: () => {},
        onCopy: () => {}
      });

      // Should still be 3, not 6 (proves cleanup works)
      expect(renderer.eventListeners.length).toBe(3);
    });
  });
});
