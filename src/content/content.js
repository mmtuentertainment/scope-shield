/**
 * ScopeShield Content Script for Gmail
 * Detects scope creep in real-time and provides visual feedback
 */

import { detectScopeCreep } from '../utils/detector.js';
import { saveDetectionEvent } from '../utils/storage.js';
import { generateUUID } from '../utils/uuid.js';
import { debounce } from '../utils/helpers.js';
import {
  SELECTORS as GMAIL_SELECTORS,
  findMessages,
  findMessageBody,
  extractCleanText,
  getEmailMetadata
} from './gmail-dom.js';
import { highlightText } from './highlighter.js';

// Constants
const SCAN_DEBOUNCE_MS = 300;

// State
let isScanning = false;
const processedMessages = new Set();
let observer = null;

/**
 * Initialize the content script
 */
function initialize() {
  console.log('[ScopeShield] Content script initializing...');

  // Check if we're on Gmail (strict validation to prevent bypass)
  const hostname = window.location.hostname;
  if (hostname !== 'mail.google.com' && !hostname.endsWith('.mail.google.com')) {
    console.log('[ScopeShield] Not on Gmail, skipping initialization');
    return;
  }

  // Wait for Gmail to load
  waitForGmail().then(() => {
    console.log('[ScopeShield] Gmail detected, starting observer');
    startObserver();

    // Initial scan
    scanMessages();
  });
}

/**
 * Wait for Gmail interface to load
 * @returns {Promise<void>}
 */
function waitForGmail() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const container = document.querySelector(GMAIL_SELECTORS.messageList) ||
                       document.querySelector(GMAIL_SELECTORS.conversation);

      if (container) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('[ScopeShield] Gmail interface not detected after 30s');
      resolve();
    }, 30000);
  });
}

/**
 * Start MutationObserver to detect new messages
 */
function startObserver() {
  // Debounced scan function
  const debouncedScan = debounce(() => {
    console.log('[ScopeShield] Debounced scan triggered');
    scanMessages();
  }, SCAN_DEBOUNCE_MS);

  // Find the main container
  const container = document.querySelector(GMAIL_SELECTORS.mainContainer) || document.body;

  // Create observer
  observer = new MutationObserver((mutations) => {
    // Check if any mutations affect message content
    const hasRelevantChanges = mutations.some(mutation => {
      // Check if nodes were added
      if (mutation.addedNodes.length > 0) {
        return true;
      }

      // Check if the target contains message elements
      const target = mutation.target;
      if (target.nodeType === Node.ELEMENT_NODE) {
        return target.querySelector(GMAIL_SELECTORS.message) !== null;
      }

      return false;
    });

    if (hasRelevantChanges) {
      debouncedScan();
    }
  });

  // Start observing
  observer.observe(container, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false
  });

  console.log('[ScopeShield] MutationObserver started');
}

/**
 * Process a single message and return detection event if scope creep found
 * @param {Element} messageEl - Message element to process
 * @returns {Object|null} Detection event or null
 */
function processMessage(messageEl) {
  const messageId = getMessageId(messageEl);

  // Skip if already processed
  if (processedMessages.has(messageId)) {
    return null;
  }

  // Extract and analyze message
  const messageData = extractMessageText(messageEl);
  if (!messageData.text) {
    processedMessages.add(messageId);
    return null;
  }

  const result = detectScopeCreep(messageData.text);
  if (!result.matched) {
    processedMessages.add(messageId);
    return null;
  }

  console.log('[ScopeShield] Scope creep detected:', result);

  // Highlight the detected text
  const highlighted = highlightText(messageEl, result);

  // Mark as processed
  processedMessages.add(messageId);

  // Return detection event
  return {
    id: generateUUID(),
    timestamp: Date.now(),
    url: window.location.href,
    sender: messageData.sender,
    senderName: messageData.senderName,
    detectedText: result.matchedText,
    fullText: messageData.text.substring(0, 500),
    triggerWord: result.triggerWord,
    triggerWeight: result.triggerWeight,
    context: result.context,
    acknowledged: false,
    highlighted
  };
}

/**
 * Send detection notification to background worker
 * @param {Object} event - Detection event
 */
function notifyBackgroundOfDetection(event) {
  try {
    chrome.runtime.sendMessage({
      type: 'SCOPE_CREEP_DETECTED',
      event
    });
  } catch (error) {
    console.error('[ScopeShield] Failed to send message to background:', error);
  }
}

/**
 * Send performance metric to background worker
 * @param {number} elapsed - Elapsed time in ms
 * @param {number} messageCount - Number of messages processed
 */
function sendPerformanceMetric(elapsed, messageCount) {
  try {
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_METRIC',
      metric: 'detection_latency',
      value: elapsed / messageCount,
      messageCount
    });
  } catch (error) {
    console.error('[ScopeShield] Failed to send performance metric:', error);
  }
}

/**
 * Report scan results and performance metrics
 * @param {number} startTime - Scan start timestamp
 * @param {number} detectionCount - Number of detections
 * @param {number} messageCount - Number of messages scanned
 */
function reportScanResults(startTime, detectionCount, messageCount) {
  const elapsed = performance.now() - startTime;
  console.log(`[ScopeShield] Scan complete in ${elapsed.toFixed(2)}ms, ${detectionCount} new detections`);

  if (messageCount > 0) {
    sendPerformanceMetric(elapsed, messageCount);
  }
}

/**
 * Scan all visible messages for scope creep
 */
async function scanMessages() {
  if (isScanning) {
    console.log('[ScopeShield] Already scanning, skipping');
    return;
  }

  isScanning = true;
  const startTime = performance.now();

  try {
    const messages = findMessages();
    console.log(`[ScopeShield] Found ${messages.length} messages to scan`);

    // Process all messages and collect detection events
    const detectionEvents = [];
    for (const messageEl of messages) {
      const event = processMessage(messageEl);
      if (event) {
        detectionEvents.push(event);
        notifyBackgroundOfDetection(event);
      }
    }

    // Save all events after loop (fixes await-in-loop)
    if (detectionEvents.length > 0) {
      const savePromises = detectionEvents.map(e => saveDetectionEvent(e));
      await Promise.allSettled(savePromises);
    }

    reportScanResults(startTime, detectionEvents.length, messages.length);

  } catch (error) {
    console.error('[ScopeShield] Error during scan:', error);
  } finally {
    isScanning = false;
  }
}

// Note: findMessages is now imported from gmail-dom.js

/**
 * Extract clean text from a message element
 * @param {Element} messageEl - Message element
 * @returns {Object} Message data with text, sender, etc.
 */
function extractMessageText(messageEl) {
  const data = {
    text: '',
    sender: '',
    senderName: ''
  };

  try {
    // Use gmail-dom's getEmailMetadata for sender info (better Gmail compatibility)
    const metadata = getEmailMetadata(messageEl);
    data.sender = metadata.sender;
    data.senderName = metadata.senderName;

    // Get message body using gmail-dom's helper (fallback chain support)
    const bodyEl = findMessageBody(messageEl);

    if (!bodyEl) {
      return data;
    }

    // Use gmail-dom's extractCleanText (handles quotes and signatures)
    let text = extractCleanText(bodyEl);

    // Additional cleanup for quoted email headers
    text = text.replace(/On .+ wrote:?\s*$/gm, '');

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    data.text = text;

  } catch (error) {
    console.error('[ScopeShield] Error extracting message text:', error);
  }

  return data;
}

// Note: Quote and signature removal now handled by gmail-dom's extractCleanText

/**
 * Get a unique ID for a message element
 * @param {Element} messageEl - Message element
 * @returns {string} Unique ID
 */
function getMessageId(messageEl) {
  // Try to get Gmail's internal ID
  const dataLegacyId = messageEl.getAttribute('data-legacy-message-id');
  if (dataLegacyId) {
    return dataLegacyId;
  }

  // Try to get from parent with ID
  let parent = messageEl;
  while (parent && parent !== document.body) {
    if (parent.id) {
      return parent.id;
    }
    parent = parent.parentElement;
  }

  // Fallback: use content hash
  const text = messageEl.textContent || '';
  return hashCode(text.substring(0, 100));
}

/**
 * Simple hash function for generating IDs
 * @param {string} str - String to hash
 * @returns {string} Hash value
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Handle visibility changes (tab switching)
 */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('[ScopeShield] Tab became visible, scanning messages');
    scanMessages();
  }
});

/**
 * Handle navigation within Gmail (SPA navigation)
 */
let lastUrl = window.location.href;
setInterval(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    console.log('[ScopeShield] URL changed, rescanning');
    lastUrl = currentUrl;

    // Clear processed messages for new conversation
    if (currentUrl.includes('#inbox/') || currentUrl.includes('#label/')) {
      processedMessages.clear();
    }

    // Rescan after a short delay
    setTimeout(scanMessages, 500);
  }
}, 1000);

/**
 * Cleanup on unload
 */
window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Export for testing
export { scanMessages, extractMessageText, findMessages };