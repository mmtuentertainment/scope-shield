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
import { ManualChangeOrderButton } from './components/ManualChangeOrderButton.js'; // Phase 8 (T281-T285)

// Draft autosave interval (30 seconds)
const DRAFT_AUTOSAVE_INTERVAL_MS = 30000;

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
let draftAutosaveInterval = null; // Periodic autosave timer

// Initialize components
const listRenderer = new DetectionListRenderer(DOM.detectionsList);
const badgeManager = new BadgeManager();
const eventHandlers = new DetectionEventHandlers({
  getEvents: () => detectionEvents,
  onEventsChanged: debounce(() => {
    updateSummaryStats();
    renderList();
    badgeManager.update();
    updateManualButtonVisibility(); // Phase 8 (T281-T285)
  }, 100),
  onModalCreated: (modal) => {
    // Store modal reference for draft saving
    currentModal = modal;
    logInfo('Change order modal created and tracked for draft saving');

    // Start periodic autosave (every 30 seconds)
    startDraftAutosave();
  }
});

// Phase 8 (T281-T285): Manual change order button
const manualButton = new ManualChangeOrderButton({
  onCreateManual: () => eventHandlers.createManualChangeOrder()
});

/**
 * Prepare and mount the popup UI and related background state.
 *
 * Performs the initial detection load, checks for any saved change-order draft (which can surface a Resume Draft button),
 * attaches UI and lifecycle event handlers, mounts the manual change-order button, and refreshes the extension badge.
 */
async function initialize() {
  console.log('[ScopeShield] Popup initializing...');

  await loadDetections();
  checkForDraft(); // Non-blocking - Resume Draft button appears when check completes
  setupEventListeners();
  mountManualButton(); // Phase 8 (T281-T285)
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
 * Insert the manual change order button into the popup DOM just before the detections list.
 *
 * If the detections list element is not present, the function does nothing. After mounting the
 * button it updates the button's visibility based on the current detectionEvents state.
 */
function mountManualButton() {
  if (!DOM.detectionsList) return;

  const buttonContainer = manualButton.render();
  DOM.detectionsList.parentNode.insertBefore(buttonContainer, DOM.detectionsList);

  // Update visibility based on current detections
  updateManualButtonVisibility();
}

/**
 * Toggle visibility of the manual change-order button based on current detections.
 *
 * Shows the manual button when there are zero detection events; hides it when any detections exist.
 * If the manual button is not initialized, this function is a no-op.
 */
function updateManualButtonVisibility() {
  if (!manualButton) return;

  if (detectionEvents.length === 0) {
    manualButton.show();
  } else {
    manualButton.hide();
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
 * Save draft immediately (used by multiple event handlers)
 */
function saveDraftNow() {
  // Check if modal has been closed (overlay null or removed from DOM)
  // ChangeOrderModal.close() sets overlay = null, or overlay.parentNode = null during removal
  if (currentModal && (!currentModal.overlay || !currentModal.overlay.parentNode)) {
    // Modal was closed, stop autosave and clear reference
    logInfo('Modal closed, stopping autosave');
    stopDraftAutosave();
    currentModal = null;
    return;
  }

  // Save draft if modal exists and has data (even if DOM is destroyed)
  // Don't save if auto-export is active (draft will be deleted after export)
  if (currentModal && !currentModal.autoExportActive) {
    try {
      const draftState = currentModal.getDraftState();
      logInfo('Saving draft...');

      // Fire-and-forget save
      DraftStorage.save(draftState).catch(error => {
        logError('Failed to save draft', error);
      });
    } catch (error) {
      logError('Failed to get draft state', error);
    }
  }
}

/**
 * Start periodic autosave while modal is open
 */
function startDraftAutosave() {
  // Clear any existing interval
  stopDraftAutosave();

  draftAutosaveInterval = setInterval(() => {
    saveDraftNow();
  }, DRAFT_AUTOSAVE_INTERVAL_MS);

  logInfo(`Draft autosave started (${DRAFT_AUTOSAVE_INTERVAL_MS / 1000}s interval)`);
}

/**
 * Stop periodic autosave
 */
function stopDraftAutosave() {
  if (draftAutosaveInterval) {
    clearInterval(draftAutosaveInterval);
    draftAutosaveInterval = null;
    logInfo('Draft autosave stopped');
  }
}

/**
 * Mark calculator inputs as read-only with visual indicator
 */
function markCalculatorAsReadOnly() {
  if (!currentModal || !currentModal.modal) return;

  // Find calculator inputs
  const rateInput = currentModal.modal.querySelector('#calc-rate');
  const hoursInput = currentModal.modal.querySelector('#calc-hours');

  if (rateInput) {
    rateInput.disabled = true;
    rateInput.title = 'Calculator is read-only when resuming drafts';
  }

  if (hoursInput) {
    hoursInput.disabled = true;
    hoursInput.title = 'Calculator is read-only when resuming drafts';
  }

  // Add read-only badge to calculator header
  const calcHeader = currentModal.modal.querySelector('.calculator-header');
  if (calcHeader && !calcHeader.querySelector('.readonly-badge')) {
    const badge = document.createElement('span');
    badge.className = 'readonly-badge';
    badge.textContent = '(Read-only)';
    badge.style.cssText = 'color: #666; font-size: 0.9em; font-weight: normal; margin-left: 8px;';
    calcHeader.appendChild(badge);
  }

  logInfo('Calculator marked as read-only');
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

    // Restore modal from draft
    // Note: Calculator will be read-only (no recalculation) since we don't have
    // the original detection events to rebuild the document with new pricing
    const modal = await ChangeOrderModal.restoreFromDraft(
      draftData,
      null  // No recalculate callback - calculator is read-only on resume
    );

    currentModal = modal;

    // Start autosave for resumed draft (CodeRabbit: missing autosave on resume)
    startDraftAutosave();

    // Mark calculator as read-only (CodeRabbit: UI indicator for read-only state)
    markCalculatorAsReadOnly();

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

  // Multi-layered draft save (Chrome extension popup lifecycle)
  // Note: Multiple handlers may fire on popup close - redundant calls to saveDraftNow()
  // are safe due to guard conditions and fire-and-forget pattern.
  // Layer 1: visibilitychange (most reliable per Chrome 2025 guidance)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      logInfo('Popup hidden, saving draft');
      saveDraftNow();
    }
  });

  // Layer 2: pagehide (navigation/close detection)
  window.addEventListener('pagehide', () => {
    logInfo('Popup pagehide, saving draft');
    saveDraftNow();
  });

  // Layer 3: unload (legacy fallback, being deprecated 2025-2026)
  window.addEventListener('unload', () => {
    logInfo('Popup unload, saving draft');
    saveDraftNow();
    stopDraftAutosave(); // Cleanup interval
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}