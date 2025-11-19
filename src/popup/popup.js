/**
 * ScopeShield Popup Script (T042)
 * Displays detection events and provides management interface
 *
 * Orchestrates:
 * - DetectionListRenderer: Renders detection list
 * - DetectionEventHandlers: Processes user actions
 * - BadgeManager: Updates extension badge
 * - NotificationManager: Shows toast notifications
 * - DraftStorage: Auto-save/restore change order drafts
 */

import { getDetectionEvents } from '../utils/storage.js';
import { DetectionListRenderer } from './components/DetectionListRenderer.js';
import { DetectionEventHandlers } from './components/DetectionEventHandlers.js';
import { BadgeManager } from './components/BadgeManager.js';
import { showNotification } from './components/NotificationManager.js';
import { debounce } from './utils/debounce.js';
import { logError, logWarning, logInfo } from '../lib/utils/Logger.js';
import { URGENT_THRESHOLD, LOAD_TIME_TARGET_MS } from './constants.js';
import { DraftStorage } from '../lib/change-order/DraftStorage.js';
import { ChangeOrderModal } from './components/ChangeOrderModal.js';

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
let currentModal = null; // Track active change order modal for draft saving

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
  await checkForDraft();
  setupEventListeners();
  await badgeManager.update();
}

/**
 * Check for existing draft and show Resume Draft button if found
 */
async function checkForDraft() {
  try {
    const hasDraft = await DraftStorage.hasDraft();
    if (hasDraft) {
      logInfo('Draft found, showing Resume Draft button');
      showResumeDraftButton();
    }
  } catch (error) {
    logError('Failed to check for draft', error);
  }
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
      logWarning(`Popup load took ${loadTime.toFixed(1)}ms (target: <${LOAD_TIME_TARGET_MS}ms)`);
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
 * Show Resume Draft button in actions section
 */
function showResumeDraftButton() {
  if (!DOM.generateReportBtn) return;

  // Check if button already exists
  if (document.getElementById('resume-draft-btn')) return;

  const resumeBtn = document.createElement('button');
  resumeBtn.id = 'resume-draft-btn';
  resumeBtn.className = 'btn btn-secondary';
  resumeBtn.textContent = 'Resume Draft';
  resumeBtn.setAttribute('aria-label', 'Resume unsaved change order draft');
  resumeBtn.setAttribute('role', 'button');
  resumeBtn.tabIndex = 0;

  // Insert before "Generate Change Order" button
  DOM.generateReportBtn.parentNode.insertBefore(resumeBtn, DOM.generateReportBtn);

  // Add event listener
  resumeBtn.addEventListener('click', handleResumeDraft);

  logInfo('Resume Draft button added');
}

/**
 * Handle Resume Draft button click
 */
async function handleResumeDraft() {
  const resumeBtn = document.getElementById('resume-draft-btn');
  if (!resumeBtn) return;

  try {
    // Show loading state
    resumeBtn.disabled = true;
    resumeBtn.textContent = 'Loading...';

    const draftData = await DraftStorage.load();

    if (!draftData) {
      showNotification('toast-notification', 'Draft no longer available', 'info', 3000);
      resumeBtn.remove();
      return;
    }

    logInfo('Restoring draft from storage');

    // Restore modal from draft (pass recalculate callback from eventHandlers)
    const modal = await ChangeOrderModal.restoreFromDraft(
      draftData,
      eventHandlers.calculatorRecalculateCallback
    );

    currentModal = modal;

    // Remove Resume Draft button
    resumeBtn.remove();

  } catch (error) {
    logError('Failed to restore draft', error);
    showNotification('toast-notification', 'Failed to restore draft', 'error', 3000);

    // Reset button state
    if (resumeBtn) {
      resumeBtn.disabled = false;
      resumeBtn.textContent = 'Resume Draft';
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

  // Save draft when popup closes (beforeunload)
  window.addEventListener('beforeunload', () => {
    if (currentModal && currentModal.modal && !currentModal.autoExportActive) {
      const draftState = currentModal.getDraftState();
      // Fire-and-forget (don't block popup close)
      DraftStorage.save(draftState).catch(error => {
        logError('Failed to save draft on beforeunload', error);
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
