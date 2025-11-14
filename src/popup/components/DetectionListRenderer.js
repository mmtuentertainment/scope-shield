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
  }

  /**
   * Render list of detections
   * @param {Array} detectionEvents - Array of detection events
   * @param {Object} handlers - Event handlers {onAcknowledge, onView, onCopy}
   */
  render(detectionEvents, handlers) {
    if (!this.container) return;

    if (detectionEvents.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Clear list
    this.container.textContent = '';

    // Sort by timestamp (newest first)
    const sortedEvents = [...detectionEvents]
      .sort((a, b) => b.timestamp - a.timestamp);

    // Render limited set
    const maxDisplay = 50;
    // TODO: Consider virtual scrolling for 100+ items to maintain <500ms render time
    const displayEvents = sortedEvents.slice(0, maxDisplay);

    displayEvents.forEach(event => {
      const itemEl = this.createDetectionItem(event, handlers);
      if (itemEl) {
        this.container.appendChild(itemEl);
      }
    });

    // Add truncation notice if needed
    if (sortedEvents.length > maxDisplay) {
      this.showTruncationNotice(sortedEvents.length, maxDisplay);
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
    icon.src = '../assets/icons/icon48.png';
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
      console.error('[ScopeShield] Detection item template not found');
      return null;
    }

    const clone = template.content.cloneNode(true);
    const itemEl = clone.querySelector('.detection-item');

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
    itemEl.querySelector('.detection-sender').textContent = event.senderName || event.sender || 'Unknown';
    itemEl.querySelector('.detection-time').textContent = formatRelativeTime(event.timestamp);
    itemEl.querySelector('.detection-text').textContent = event.detectedText || event.context || 'No text available';
    itemEl.querySelector('.trigger-word').textContent = event.triggerWord || 'Unknown trigger';
  }

  /**
   * Set confidence badge styling
   * @param {HTMLElement} itemEl - Item element
   * @param {number} weight - Confidence weight (0-10)
   */
  setConfidenceBadge(itemEl, weight) {
    const badge = itemEl.querySelector('.confidence-badge');
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
      acknowledgeBtn.addEventListener('click', () => handlers.onAcknowledge(event.id));
    }

    if (viewBtn && handlers.onView) {
      viewBtn.addEventListener('click', () => handlers.onView(event.url));
    }

    if (copyBtn && handlers.onCopy) {
      copyBtn.addEventListener('click', () => handlers.onCopy(event));
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
}
