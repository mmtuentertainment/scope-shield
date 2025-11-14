/**
 * ScopeShield Popup Script (T042)
 * Displays detection events and provides management interface
 *
 * Orchestrates:
 * - DetectionListRenderer: Renders detection list
 * - DetectionEventHandlers: Processes user actions
 * - BadgeManager: Updates extension badge
 * - NotificationManager: Shows toast notifications
 */

import { getDetectionEvents } from '../utils/storage.js';
import { DetectionListRenderer } from './components/DetectionListRenderer.js';
import { DetectionEventHandlers } from './components/DetectionEventHandlers.js';
import { BadgeManager } from './components/BadgeManager.js';
import { showNotification } from './components/NotificationManager.js';

// DOM Elements
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

// Initialize components
const listRenderer = new DetectionListRenderer(detectionsListEl);
const badgeManager = new BadgeManager();
const eventHandlers = new DetectionEventHandlers({
  getEvents: () => detectionEvents,
  onEventsChanged: () => {
    updateSummaryStats();
    renderList();
    badgeManager.update();
  }
});

/**
 * Initialize popup
 */
async function initialize() {
  console.log('[ScopeShield] Popup initializing...');

  await loadDetections();
  setupEventListeners();
  await badgeManager.update();
}

/**
 * Load detection events from storage
 */
async function loadDetections() {
  try {
    detectionEvents = await getDetectionEvents();
    console.log(`[ScopeShield] Loaded ${detectionEvents.length} detection events`);

    updateSummaryStats();
    renderList();
  } catch (error) {
    console.error('[ScopeShield] Error loading detections:', error);
    showNotification('toast-notification', 'Failed to load detections', 'error', 5000);
  }
}

/**
 * Render detection list
 */
function renderList() {
  listRenderer.render(detectionEvents, {
    onAcknowledge: (id) => eventHandlers.handleAcknowledge(id),
    onView: (url) => eventHandlers.handleView(url),
    onCopy: (event) => eventHandlers.handleCopy(event)
  });
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

  // Add visual emphasis for high numbers
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
 * Set up event listeners
 */
function setupEventListeners() {
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => eventHandlers.handleClearAll());
  }

  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => eventHandlers.generateReport());
  }

  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/yourusername/scopeshield/wiki' });
    });
  }

  if (feedbackLink) {
    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/yourusername/scopeshield/issues' });
    });
  }

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
