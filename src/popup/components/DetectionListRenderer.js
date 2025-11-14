/**
 * Detection List Renderer
 *
 * Renders detection events list in popup UI with:
 * - Empty state handling
 * - Sorting (newest first)
 * - Truncation for >50 items
 * - Confidence badges
 * - Template-based DOM creation
 *
 * @module DetectionListRenderer
 */

import { formatRelativeTime } from '../utils/FormatHelpers.js';
import { logError } from '../../lib/utils/Logger.js';
import { MAX_DISPLAYED_DETECTIONS } from '../constants.js';

/**
 * Detection List Renderer Class
 */
export class DetectionListRenderer {
  /**
   * Create renderer instance
   * @param {HTMLElement} containerElement - Container element for list
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.eventListeners = []; // Track listeners for cleanup
  }

  /**
   * Render list of detections
   * @param {Array} detectionEvents - Array of detection events
   * @param {Object} handlers - Event handlers {onAcknowledge, onView, onCopy}
   */
  render(detectionEvents, handlers) {
    if (!this.container) return;

    // Clean up existing listeners before re-render
    this.destroy();

    if (detectionEvents.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Clear list (safe: textContent removes content and detaches listeners automatically)
    this.container.textContent = '';

    // Sort by timestamp (newest first)
    const sortedEvents = [...detectionEvents]
      .sort((a, b) => b.timestamp - a.timestamp);

    // Render limited set using DocumentFragment for batching (performance optimization)
    // TODO: Consider virtual scrolling for 100+ items to maintain <500ms render time
    const displayEvents = sortedEvents.slice(0, MAX_DISPLAYED_DETECTIONS);

    // Use DocumentFragment to batch DOM operations (single reflow instead of N reflows)
    const fragment = document.createDocumentFragment();

    displayEvents.forEach(event => {
      const itemEl = this.createDetectionItem(event, handlers);
      if (itemEl) {
        fragment.appendChild(itemEl);
      }
    });

    // Single DOM append (triggers one reflow)
    this.container.appendChild(fragment);

    // Add truncation notice if needed
    if (sortedEvents.length > MAX_DISPLAYED_DETECTIONS) {
      this.showTruncationNotice(sortedEvents.length, MAX_DISPLAYED_DETECTIONS);
    }
  }

  /**
   * Render empty state using safe DOM methods
   */
  renderEmptyState() {
    // Clear container first
    this.container.textContent = '';

    // Create empty state using safe DOM methods
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    const icon = document.createElement('img');
    icon.src = '../../assets/icons/icon48.png';
    icon.alt = 'No detections';
    icon.width = 48;
    icon.height = 48;

    const message = document.createElement('p');
    message.textContent = 'No scope creep detected yet';

    const hint = document.createElement('small');
    hint.textContent = 'Open Gmail to start monitoring';

    emptyState.appendChild(icon);
    emptyState.appendChild(message);
    emptyState.appendChild(hint);

    this.container.appendChild(emptyState);
  }

  /**
   * Create detection item element
   * @param {Object} event - Detection event
   * @param {Object} handlers - Event handlers {onAcknowledge, onView, onCopy}
   * @returns {HTMLElement|null} Detection item element or null if template missing
   */
  createDetectionItem(event, handlers) {
    const template = document.getElementById('detection-item-template');
    if (!template) {
      logError('DetectionListRenderer.createDetectionItem: Template not found', new Error('detection-item-template missing from DOM'));
      return null;
    }

    const clone = template.content.cloneNode(true);
    const itemEl = clone.querySelector('.detection-item');

    if (!itemEl) {
      logError('DetectionListRenderer.createDetectionItem: .detection-item not found in template', new Error('Template structure incomplete'));
      return null;
    }

    // Set data attributes
    itemEl.dataset.id = event.id;
    if (event.acknowledged) {
      itemEl.classList.add('acknowledged');
    }

    // Populate fields and attach listeners
    this.populateText(itemEl, event);
    this.setConfidenceBadge(itemEl, event.triggerWeight || 0);
    this.attachListeners(itemEl, event, handlers);

    return itemEl;
  }

  /**
   * Populate text fields in detection item
   * @param {HTMLElement} itemEl - Item element
   * @param {Object} event - Detection event
   */
  populateText(itemEl, event) {
    const senderEl = itemEl.querySelector('.detection-sender');
    const timeEl = itemEl.querySelector('.detection-time');
    const textEl = itemEl.querySelector('.detection-text');
    const triggerEl = itemEl.querySelector('.trigger-word');

    if (senderEl) senderEl.textContent = event.senderName || event.sender || 'Unknown';
    if (timeEl) timeEl.textContent = formatRelativeTime(event.timestamp);
    if (textEl) textEl.textContent = event.detectedText || event.context || 'No text available';
    if (triggerEl) triggerEl.textContent = event.triggerWord || 'Unknown trigger';
  }

  /**
   * Set confidence badge styling
   * @param {HTMLElement} itemEl - Item element
   * @param {number} weight - Confidence weight (0-10)
   */
  setConfidenceBadge(itemEl, weight) {
    const badge = itemEl.querySelector('.confidence-badge');
    if (!badge) return;

    badge.textContent = `${weight}/10`;

    if (weight >= 8) {
      badge.classList.add('high');
    } else if (weight >= 5) {
      badge.classList.add('medium');
    } else {
      badge.classList.add('low');
    }
  }

  /**
   * Attach button event listeners to detection item
   * @param {HTMLElement} itemEl - Item element
   * @param {Object} event - Detection event
   * @param {Object} handlers - Event handlers {onAcknowledge, onView, onCopy}
   */
  attachListeners(itemEl, event, handlers) {
    const acknowledgeBtn = itemEl.querySelector('.acknowledge');
    const viewBtn = itemEl.querySelector('.view');
    const copyBtn = itemEl.querySelector('.copy');

    if (acknowledgeBtn && handlers.onAcknowledge) {
      const handler = () => handlers.onAcknowledge(event.id);
      acknowledgeBtn.addEventListener('click', handler);
      this.eventListeners.push({ element: acknowledgeBtn, type: 'click', handler });
    }

    if (viewBtn && handlers.onView) {
      const handler = () => handlers.onView(event.url);
      viewBtn.addEventListener('click', handler);
      this.eventListeners.push({ element: viewBtn, type: 'click', handler });
    }

    if (copyBtn && handlers.onCopy) {
      const handler = () => handlers.onCopy(event);
      copyBtn.addEventListener('click', handler);
      this.eventListeners.push({ element: copyBtn, type: 'click', handler });
    }
  }

  /**
   * Show truncation notice
   * @param {number} total - Total number of events
   * @param {number} displayed - Number of events displayed
   */
  showTruncationNotice(total, displayed) {
    const notice = document.createElement('div');
    notice.className = 'truncation-notice';
    notice.textContent = `Showing ${displayed} of ${total} detections. Clear old items to see more.`;
    this.container.appendChild(notice);
  }

  /**
   * Clean up event listeners to prevent memory leaks
   * Call before re-rendering or when component is destroyed
   */
  destroy() {
    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }
}
