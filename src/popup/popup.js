/**
 * ScopeShield Popup Script (T042)
 * Displays detection events and provides management interface
 */

import { getDetectionEvents, acknowledgeEvent, clearAllEvents, getUnacknowledgedCount } from '../utils/storage.js';

// DOM Elements (with null checks)
const totalDetectionsEl = document.getElementById('total-detections');
const unacknowledgedEl = document.getElementById('unacknowledged');
const detectionsListEl = document.getElementById('detections-list');
const clearAllBtn = document.getElementById('clear-all');
const generateReportBtn = document.getElementById('generate-report');
const openOptionsBtn = document.getElementById('open-options');
const helpLink = document.getElementById('help-link');
const feedbackLink = document.getElementById('feedback-link');

// Validate critical DOM elements exist
if (!totalDetectionsEl || !unacknowledgedEl || !detectionsListEl) {
  console.error('[ScopeShield] Critical DOM elements missing');
}

// State
let detectionEvents = [];

/**
 * Initialize popup
 */
async function initialize() {
  console.log('[ScopeShield] Popup initializing...');

  // Load detection events
  await loadDetections();

  // Set up event listeners
  setupEventListeners();

  // Update badge
  await updateBadge();
}

/**
 * Load detection events from storage
 */
async function loadDetections() {
  try {
    detectionEvents = await getDetectionEvents();
    console.log(`[ScopeShield] Loaded ${detectionEvents.length} detection events`);

    // Update UI
    updateSummaryStats();
    renderDetectionsList();
  } catch (error) {
    console.error('[ScopeShield] Error loading detections:', error);
    showError('Failed to load detections');
  }
}

/**
 * Update summary statistics
 */
function updateSummaryStats() {
  if (!totalDetectionsEl || !unacknowledgedEl) return;

  const total = detectionEvents.length;
  const unacknowledged = detectionEvents.filter(e => !e.acknowledged).length;

  totalDetectionsEl.textContent = total;
  unacknowledgedEl.textContent = unacknowledged;

  // Add visual emphasis for high numbers (and ensure it's removed when below threshold)
  const parentEl = unacknowledgedEl.parentElement;
  if (parentEl) {
    if (unacknowledged > 5) {
      parentEl.classList.add('urgent');
    } else {
      parentEl.classList.remove('urgent');
    }
  }
}

/**
 * Render detections list
 */
function renderDetectionsList() {
  if (!detectionsListEl) return;

  if (detectionEvents.length === 0) {
    // Show empty state
    detectionsListEl.innerHTML = `
      <div class="empty-state">
        <img src="../assets/icons/icon48.png" alt="No detections" width="48" height="48">
        <p>No scope creep detected yet</p>
        <small>Open Gmail to start monitoring</small>
      </div>
    `;
    return;
  }

  // Clear list
  detectionsListEl.innerHTML = '';

  // Sort by timestamp (newest first)
  const sortedEvents = [...detectionEvents].sort((a, b) => b.timestamp - a.timestamp);

  // Render each detection (show truncation indicator if list is truncated)
  const maxDisplay = 50;
  const displayEvents = sortedEvents.slice(0, maxDisplay);

  displayEvents.forEach(event => {
    const itemEl = createDetectionItem(event);
    if (itemEl) {
      detectionsListEl.appendChild(itemEl);
    }
  });

  // Add truncation notice if there are more events
  if (sortedEvents.length > maxDisplay) {
    const notice = document.createElement('div');
    notice.className = 'truncation-notice';
    notice.textContent = `Showing ${maxDisplay} of ${sortedEvents.length} detections. Clear old items to see more.`;
    detectionsListEl.appendChild(notice);
  }
}

/**
 * Populate text fields in detection item
 * @param {HTMLElement} itemEl - Item element
 * @param {Object} event - Detection event
 */
function populateDetectionItemText(itemEl, event) {
  itemEl.querySelector('.detection-sender').textContent = event.senderName || event.sender || 'Unknown';
  itemEl.querySelector('.detection-time').textContent = formatTime(event.timestamp);
  itemEl.querySelector('.detection-text').textContent = event.detectedText || event.context || 'No text available';
  itemEl.querySelector('.trigger-word').textContent = event.triggerWord || 'Unknown trigger';
}

/**
 * Set confidence badge styling
 * @param {HTMLElement} itemEl - Item element
 * @param {number} weight - Confidence weight
 */
function setConfidenceBadge(itemEl, weight) {
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
 */
function attachDetectionItemListeners(itemEl, event) {
  itemEl.querySelector('.acknowledge').addEventListener('click', () => handleAcknowledge(event.id));
  itemEl.querySelector('.view').addEventListener('click', () => handleView(event.url));
  itemEl.querySelector('.copy').addEventListener('click', () => handleCopy(event));
}

/**
 * Create detection item element
 * @param {Object} event - Detection event
 * @returns {HTMLElement|null} Detection item element or null if template missing
 */
function createDetectionItem(event) {
  const template = document.getElementById('detection-item-template');
  if (!template) {
    console.error('[ScopeShield] Detection item template not found');
    return null;
  }

  const clone = template.content.cloneNode(true);
  const itemEl = clone.querySelector('.detection-item');

  // Set data
  itemEl.dataset.id = event.id;
  if (event.acknowledged) {
    itemEl.classList.add('acknowledged');
  }

  // Populate fields and attach listeners
  populateDetectionItemText(itemEl, event);
  setConfidenceBadge(itemEl, event.triggerWeight || 0);
  attachDetectionItemListeners(itemEl, event);

  return itemEl;
}

/**
 * Format timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes === 0 ? 'Just now' : `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Handle acknowledge button click
 * @param {string} eventId - Event ID
 */
async function handleAcknowledge(eventId) {
  try {
    await acknowledgeEvent(eventId);

    // Update local state
    const event = detectionEvents.find(e => e.id === eventId);
    if (event) {
      event.acknowledged = true;
    }

    // Update UI
    const itemEl = document.querySelector(`[data-id="${eventId}"]`);
    if (itemEl) {
      itemEl.classList.add('acknowledged');
    }

    updateSummaryStats();
    await updateBadge();
  } catch (error) {
    console.error('[ScopeShield] Error acknowledging event:', error);
  }
}

/**
 * Handle view button click
 * @param {string} url - Gmail URL
 */
function handleView(url) {
  if (url) {
    chrome.tabs.create({ url });
  }
}

/**
 * Handle copy button click
 * @param {Object} event - Detection event
 */
async function handleCopy(event) {
  const text = `Scope Creep Detected:
From: ${event.senderName || event.sender}
Text: ${event.detectedText}
Trigger: ${event.triggerWord} (Confidence: ${event.triggerWeight}/10)
Time: ${new Date(event.timestamp).toLocaleString()}`;

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (error) {
    console.error('[ScopeShield] Error copying to clipboard:', error);
    // Fallback: show user-friendly message
    showToast('Failed to copy. Please try again.', 'error');
  }
}

/**
 * Handle clear all button click
 */
async function handleClearAll() {
  if (!confirm('Clear all detection history? This cannot be undone.')) {
    return;
  }

  try {
    // Execute clearAllEvents and updateBadge in parallel since they're independent
    await Promise.all([
      clearAllEvents(),
      updateBadge()
    ]);

    detectionEvents = [];
    updateSummaryStats();
    renderDetectionsList();
    showToast('All detections cleared');
  } catch (error) {
    console.error('[ScopeShield] Error clearing events:', error);
    showError('Failed to clear detections');
  }
}

/**
 * Build change order report text
 * @param {Array} unacknowledged - Unacknowledged events
 * @returns {string} Report text
 */
function buildChangeOrderReport(unacknowledged) {
  // Group by sender
  const bySender = {};
  unacknowledged.forEach(event => {
    const sender = event.senderName || event.sender || 'Unknown';
    if (!bySender[sender]) {
      bySender[sender] = [];
    }
    bySender[sender].push(event);
  });

  // Generate report text
  let report = 'SCOPE CREEP CHANGE ORDER\n';
  report += '========================\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Total Items: ${unacknowledged.length}\n\n`;

  Object.entries(bySender).forEach(([sender, events]) => {
    report += `From: ${sender}\n`;
    report += `${'-'.repeat(40)}\n`;
    events.forEach((event, index) => {
      report += `${index + 1}. "${event.detectedText}"\n`;
      report += `   Trigger: ${event.triggerWord} (Confidence: ${event.triggerWeight}/10)\n`;
      report += `   Date: ${new Date(event.timestamp).toLocaleDateString()}\n\n`;
    });
  });

  return report;
}

/**
 * Acknowledge multiple events in batch (fixes await-in-loop)
 * @param {Array} events - Events to acknowledge
 * @returns {Promise<void>}
 */
async function acknowledgeMultipleEvents(events) {
  const promises = events.map(event => acknowledgeEvent(event.id));
  await Promise.allSettled(promises);

  // Mark all as acknowledged locally
  events.forEach(event => {
    event.acknowledged = true;
  });
}

/**
 * Generate change order report
 */
async function generateReport() {
  const unacknowledged = detectionEvents.filter(e => !e.acknowledged);

  if (unacknowledged.length === 0) {
    showToast('No unacknowledged detections to report');
    return;
  }

  // Build report and copy to clipboard
  const report = buildChangeOrderReport(unacknowledged);

  try {
    await navigator.clipboard.writeText(report);
    showToast('Change order copied to clipboard!');

    // Mark all as acknowledged (fixes await-in-loop)
    await acknowledgeMultipleEvents(unacknowledged);

    updateSummaryStats();
    renderDetectionsList();
    await updateBadge();
  } catch (error) {
    console.error('[ScopeShield] Error generating report:', error);
    showError('Failed to generate report');
  }
}

/**
 * Update extension badge
 */
async function updateBadge() {
  try {
    const count = await getUnacknowledgedCount();
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: count
    });
  } catch (error) {
    console.error('[ScopeShield] Error updating badge:', error);
  }
}

/**
 * Show toast message
 * @param {string} message - Message to show
 */
function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  showToast(`Error: ${message}`);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  clearAllBtn.addEventListener('click', handleClearAll);
  generateReportBtn.addEventListener('click', generateReport);
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/yourusername/scopeshield/wiki' });
  });

  feedbackLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/yourusername/scopeshield/issues' });
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.detectionEvents) {
      loadDetections();
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}