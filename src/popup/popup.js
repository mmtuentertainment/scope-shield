/**
 * ScopeShield Popup Script (T042, T058)
 * Displays detection events and provides management interface
 */

import { getDetectionEvents, acknowledgeEvent, clearAllEvents, getUnacknowledgedCount, updateMultipleEventsAcknowledged } from '../utils/storage.js';
import { SettingsView } from './settings/SettingsView.js';
import { SettingsStorage } from '../lib/storage/SettingsStorage.js';
import { WelcomeModal } from './WelcomeModal.js';
import { FirstRunDetector } from '../lib/utils/FirstRunDetector.js';
import ChangeOrderService from '../lib/change-order/ChangeOrderService.js';
import changeOrderView from './change-order/ChangeOrderView.js';
import multiItemSelector from './change-order/MultiItemSelector.js';

// DOM Elements (with null checks)
const totalDetectionsEl = document.getElementById('total-detections');
const unacknowledgedEl = document.getElementById('unacknowledged');
const detectionsListEl = document.getElementById('detections-list');
const clearAllBtn = document.getElementById('clear-all');
const generateReportBtn = document.getElementById('generate-report');
const helpLink = document.getElementById('help-link');
const feedbackLink = document.getElementById('feedback-link');

// Validate critical DOM elements exist
if (!totalDetectionsEl || !unacknowledgedEl || !detectionsListEl) {
  console.error('[ScopeShield] Critical DOM elements missing');
}

// State
let detectionEvents = [];
let settingsView = null;
let settingsLoaded = false;

// T060: Cached settings in memory to avoid repeated chrome.storage calls
let cachedSettings = null;

/**
 * Initialize the popup UI and application state.
 *
 * Performs first-run flow (shows the welcome modal when appropriate), loads and caches settings,
 * loads detection events, attaches event listeners, initializes tab navigation, and updates the extension badge.
 */
async function initialize() {
  console.log('[ScopeShield] Popup initializing...');

  // T062: Check for first run and show welcome modal
  const isFirstRun = await FirstRunDetector.isFirstRun();
  if (isFirstRun) {
    const welcomeModal = new WelcomeModal();
    await welcomeModal.show();
    // After welcome modal completes, reload cached settings
    await loadCachedSettings();
  } else {
    // T060: Load and cache settings
    await loadCachedSettings();
  }

  // Load detection events
  await loadDetections();

  // Set up event listeners
  setupEventListeners();

  // T058: Set up tab navigation
  setupTabNavigation();

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
 * Generate a plain-text change order report grouping detection events by sender.
 *
 * @param {Array} unacknowledged - Array of detection event objects to include. Each object is expected to contain fields used in the report such as `detectedText`, `triggerWord`, `triggerWeight`, `timestamp`, and either `senderName` or `sender`.
 * @returns {string} The formatted report text with a header, generation timestamp, total item count, and per-sender sections listing each detection's text, trigger (with confidence as `weight/10`), and date.
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
 * Mark multiple detection events as acknowledged using a single batch update.
 *
 * Performs a single batch update for the provided events and sets each event object's
 * `acknowledged` property to `true`.
 * @param {Array<Object>} events - Array of detection event objects whose `id` values will be acknowledged.
 * @returns {Promise<void>} Nothing.
 */
async function acknowledgeMultipleEvents(events) {
  // Use batch update to prevent race condition
  const eventIds = events.map(event => event.id);

  try {
    await updateMultipleEventsAcknowledged(eventIds, true);
  } catch (error) {
    console.warn(`[ScopeShield] Failed to batch acknowledge ${events.length} events:`, error);
    throw error;
  }

  // Mark all as acknowledged locally
  events.forEach(event => {
    event.acknowledged = true;
  });
}

/**
 * Generate a change order from current unacknowledged detection events and render the result.
 *
 * If there are no unacknowledged detections, the function shows a toast and exits.
 * When two or more unacknowledged detections exist, the user is prompted with a multi-item selector to choose which detections to include.
 * Selected detections are converted to the format expected by ChangeOrderService, submitted to generate a change order, and rendered with ChangeOrderView.
 * After successful generation the chosen detections are marked acknowledged and the UI (summary, list, and extension badge) is updated.
 * User-facing progress and errors are communicated via toasts; errors are caught and displayed rather than thrown.
 */
async function generateReport() {
  const unacknowledged = detectionEvents.filter(e => !e.acknowledged);

  if (unacknowledged.length === 0) {
    showToast('No unacknowledged detections to report');
    return;
  }

  try {
    console.log('[ScopeShield] Starting change order generation', {
      totalDetections: unacknowledged.length
    });

    // T121-T122: Show multi-item selector if 2+ detections
    let selectedDetections = unacknowledged;

    if (unacknowledged.length >= 2) {
      // Initialize multi-item selector
      multiItemSelector.init(unacknowledged);
      multiItemSelector.render();

      // Wait for user to review selection (show modal or confirmation)
      const proceed = await showSelectionDialog();

      if (!proceed) {
        multiItemSelector.hide();
        return;
      }

      // Get selected detections
      selectedDetections = multiItemSelector.getSelectedDetections();

      if (selectedDetections.length === 0) {
        showToast('Please select at least one detection');
        return;
      }

      multiItemSelector.hide();
    }

    // Convert detection events to format expected by ChangeOrderService
    const formattedDetections = selectedDetections.map(event => ({
      sender: {
        name: event.senderName || event.sender,
        email: event.sender || 'unknown@client.com'
      },
      detectedText: event.detectedText || '',
      timestamp: event.timestamp,
      id: event.id
    }));

    // T083-T093: Generate change order using ChangeOrderService
    showToast('Generating change order...');

    const changeOrder = await ChangeOrderService.generate(formattedDetections);

    console.log('[ScopeShield] Change order generated successfully', {
      changeOrderId: changeOrder.id,
      changeOrderNumber: changeOrder.changeOrderNumber
    });

    // T114-T120: Render change order using ChangeOrderView
    changeOrderView.init();
    await changeOrderView.render(changeOrder);

    // Show success message
    showToast('Change order generated successfully!');

    // Mark selected detections as acknowledged
    await acknowledgeMultipleEvents(selectedDetections);

    // Update UI
    updateSummaryStats();
    renderDetectionsList();
    await updateBadge();

  } catch (error) {
    console.error('[ScopeShield] Error generating change order:', error);
    showError(`Failed to generate change order: ${error.message}`);
  }
}

/**
 * Present a modal that lets the user select detections to include in a change order.
 * Renders a multi-item selector with Cancel and Generate controls and closes when the overlay is dismissed.
 * @returns {boolean} `true` if the user confirmed generation, `false` otherwise.
 */
async function showSelectionDialog() {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const modal = document.createElement('div');
    modal.className = 'selection-modal';
    modal.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    modal.innerHTML = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        Select Detections to Include
      </h2>
      <div id="multi-item-selector-container"></div>
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
        <button id="cancel-selection-btn" class="btn btn-text">Cancel</button>
        <button id="proceed-selection-btn" class="btn btn-primary">Generate Change Order</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Attach multi-item selector to modal
    const container = modal.querySelector('#multi-item-selector-container');
    if (container) {
      multiItemSelector.containerSelector = '#multi-item-selector-container';
      multiItemSelector.container = container;
      multiItemSelector.render();
    }

    // Handle buttons
    modal.querySelector('#cancel-selection-btn').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });

    modal.querySelector('#proceed-selection-btn').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
  });
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
 * Display an error toast prefixed with "Error:".
 * @param {string} message - The error message text to display.
 */
function showError(message) {
  showToast(`Error: ${message}`);
}

/**
 * Load settings from persistent storage into the in-memory cache.
 *
 * Fetches settings via SettingsStorage.get() and assigns the result to the module-level
 * `cachedSettings` variable. If loading fails, `cachedSettings` is left unchanged and the
 * error is logged.
 */
async function loadCachedSettings() {
  try {
    cachedSettings = await SettingsStorage.get();
    console.log('[ScopeShield] Settings loaded and cached');
  } catch (error) {
    console.error('[ScopeShield] Error loading settings:', error);
  }
}

/**
 * Retrieve the cached settings, loading and caching them if not already present.
 * @returns {Promise<FreelancerSettings>} The cached settings object.
 */
async function getCachedSettings() {
  if (!cachedSettings) {
    await loadCachedSettings();
  }
  return cachedSettings;
}

/**
 * Initialize tabbed navigation and attach click handlers that switch the active tab button and corresponding content pane.
 *
 * When the Settings tab is activated for the first time, the settings view is loaded lazily.
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const tabName = button.dataset.tab;

      // Update active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update active pane
      tabPanes.forEach(pane => pane.classList.remove('active'));
      const targetPane = document.getElementById(`${tabName}-tab`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Load settings view if switching to settings tab
      if (tabName === 'settings' && !settingsLoaded) {
        await loadSettingsView();
      }
    });
  });
}

/**
 * Load and render the Settings view into the settings tab and wire its UI events.
 *
 * If the Settings view has not been created, this initializes a SettingsView, renders
 * its element into the '#settings-tab' container, attaches listeners for
 * 'settings-saved' and 'settings-error' events, marks settings as loaded, and
 * refreshes cached settings when a save occurs.
 */
async function loadSettingsView() {
  try {
    const settingsTab = document.getElementById('settings-tab');
    if (!settingsTab) return;

    // Create settings view if not already created
    if (!settingsView) {
      settingsView = new SettingsView();
      const settingsElement = await settingsView.render();

      // Store reference to settingsView for event handling
      settingsElement.__settingsView = settingsView;

      settingsTab.innerHTML = '';
      settingsTab.appendChild(settingsElement);

      // Listen for settings saved/error events
      window.addEventListener('settings-saved', (e) => {
        settingsView.showSuccess(e.detail.message);
        // T060: Update cached settings when saved
        loadCachedSettings();
      });

      window.addEventListener('settings-error', (e) => {
        settingsView.showError(e.detail.message);
      });
    }

    settingsLoaded = true;
    console.log('[ScopeShield] Settings view loaded');
  } catch (error) {
    console.error('[ScopeShield] Error loading settings view:', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  clearAllBtn.addEventListener('click', handleClearAll);
  generateReportBtn.addEventListener('click', generateReport);

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
    // T060: Update cached settings when they change
    if (namespace === 'local' && changes.scopeshield_settings_v1) {
      loadCachedSettings();
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}