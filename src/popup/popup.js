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
import { debounce } from './utils/debounce.js';
import { logError } from '../lib/utils/Logger.js';
import { URGENT_THRESHOLD, LOAD_TIME_TARGET_MS } from './constants.js';

// DOM Elements (cached to avoid redundant queries)
const DOM = {
  totalDetections: document.getElementById('total-detections'),
  unacknowledged: document.getElementById('unacknowledged'),
  detectionsList: document.getElementById('detections-list'),
  clearAllBtn: document.getElementById('clear-all'),
  generateReportBtn: document.getElementById('generate-report'),
  openOptionsBtn: document.getElementById('open-options'),
  helpLink: document.getElementById('help-link'),
  feedbackLink: document.getElementById('feedback-link')
};

// Validate critical DOM elements exist
if (!DOM.totalDetections || !DOM.unacknowledged || !DOM.detectionsList) {
  logError('Popup initialization: Critical DOM elements missing', new Error('totalDetections, unacknowledged, or detectionsList not found'));
}

// State
let detectionEvents = [];

// Initialize components
const listRenderer = new DetectionListRenderer(DOM.detectionsList);
const badgeManager = new BadgeManager();
const eventHandlers = new DetectionEventHandlers({
  getEvents: () => detectionEvents,
  onEventsChanged: debounce(() => {
    updateSummaryStats();
    renderList();
    badgeManager.update();
  }, 100)
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
  const startTime = performance.now();
  try {
    detectionEvents = await getDetectionEvents();
    const loadTime = performance.now() - startTime;

    console.log(`[ScopeShield] Loaded ${detectionEvents.length} detection events`);

    if (loadTime > LOAD_TIME_TARGET_MS) {
      console.warn(`[ScopeShield] Popup load took ${loadTime.toFixed(1)}ms (target: <${LOAD_TIME_TARGET_MS}ms)`);
    }

    updateSummaryStats();
    renderList();
  } catch (error) {
    logError('Popup.loadDetections failed', error);
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
  if (!DOM.totalDetections || !DOM.unacknowledged) return;

  const total = detectionEvents.length;
  const unacknowledged = detectionEvents.filter(e => !e.acknowledged).length;

  DOM.totalDetections.textContent = total;
  DOM.unacknowledged.textContent = unacknowledged;

  // Add visual emphasis for high numbers
  const parentEl = DOM.unacknowledged.parentElement;
  if (parentEl) {
    if (unacknowledged > URGENT_THRESHOLD) {
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
  if (DOM.clearAllBtn) {
    DOM.clearAllBtn.addEventListener('click', () => eventHandlers.handleClearAll());
  }

  if (DOM.generateReportBtn) {
    DOM.generateReportBtn.addEventListener('click', () => eventHandlers.generateReport());
  }

  if (DOM.openOptionsBtn) {
    DOM.openOptionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  if (DOM.helpLink) {
    DOM.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/mmtuentertainment/scope-shield/wiki' });
    });
  }

  if (DOM.feedbackLink) {
    DOM.feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/mmtuentertainment/scope-shield/issues' });
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
