/**
 * ScopeShield Content Script for Gmail
 * Detects scope creep in real-time and provides visual feedback
 */

import { detectScopeCreep } from '../utils/detector.js';
import { saveDetectionEvent, getDetectionEvents } from '../utils/storage.js';
import { generateUUID } from '../utils/uuid.js';
import { debounce } from '../utils/helpers.js';
import { SELECTORS as GMAIL_SELECTORS } from './gmail-dom.js';
import { highlightText, removeHighlights, getHighlightStats } from './highlighter.js';

// Constants
const SCAN_DEBOUNCE_MS = 300;

// State
let isScanning = false;
let processedMessages = new Set();
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
    // Find all message elements
    const messages = findMessages();
    console.log(`[ScopeShield] Found ${messages.length} messages to scan`);

    let newDetections = 0;

    for (const messageEl of messages) {
      // Get unique ID for this message
      const messageId = getMessageId(messageEl);

      // Skip if already processed
      if (processedMessages.has(messageId)) {
        continue;
      }

      // Extract message text
      const messageData = extractMessageText(messageEl);
      if (!messageData.text) {
        continue;
      }

      // Detect scope creep
      const result = detectScopeCreep(messageData.text);

      if (result.matched) {
        console.log('[ScopeShield] Scope creep detected:', result);

        // Highlight the detected text (T035)
        const highlighted = highlightText(messageEl, result);

        // Create detection event
        const event = {
          id: generateUUID(),
          timestamp: Date.now(),
          url: window.location.href,
          sender: messageData.sender,
          senderName: messageData.senderName,
          detectedText: result.matchedText,
          fullText: messageData.text.substring(0, 500), // Limit stored text
          triggerWord: result.triggerWord,
          triggerWeight: result.triggerWeight,
          context: result.context,
          acknowledged: false,
          highlighted: highlighted
        };

        // Save to storage (T040)
        await saveDetectionEvent(event);

        // Send message to background worker (T039)
        try {
          chrome.runtime.sendMessage({
            type: 'SCOPE_CREEP_DETECTED',
            event: event
          });
        } catch (error) {
          console.error('[ScopeShield] Failed to send message to background:', error);
        }

        newDetections++;
      }

      // Mark as processed
      processedMessages.add(messageId);
    }

    const elapsed = performance.now() - startTime;
    console.log(`[ScopeShield] Scan complete in ${elapsed.toFixed(2)}ms, ${newDetections} new detections`);

    // Send performance metric
    if (messages.length > 0) {
      try {
        chrome.runtime.sendMessage({
          type: 'PERFORMANCE_METRIC',
          metric: 'detection_latency',
          value: elapsed / messages.length,
          messageCount: messages.length
        });
      } catch (error) {
        console.error('[ScopeShield] Failed to send performance metric:', error);
      }
    }

  } catch (error) {
    console.error('[ScopeShield] Error during scan:', error);
  } finally {
    isScanning = false;
  }
}

/**
 * Find all message elements in the current view
 * @returns {Element[]} Array of message elements
 */
function findMessages() {
  const messages = [];

  // Try each selector
  for (const selector of Object.values(GMAIL_SELECTORS)) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      messages.push(...elements);
    }
  }

  // Remove duplicates
  return [...new Set(messages)];
}

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
    // Get sender info
    const senderEl = messageEl.querySelector('[email]') ||
                    messageEl.querySelector('span[name]') ||
                    messageEl.querySelector('.gD');

    if (senderEl) {
      data.sender = senderEl.getAttribute('email') || '';
      data.senderName = senderEl.getAttribute('name') ||
                        senderEl.textContent.trim() || '';
    }

    // Get message body
    const bodyEl = messageEl.querySelector('.a3s') ||
                  messageEl.querySelector('[role="listitem"]') ||
                  messageEl;

    if (!bodyEl) {
      return data;
    }

    // Get text content
    let text = bodyEl.textContent || '';

    // Enhanced quoted text detection (T026)
    text = removeQuotedText(text);

    // Enhanced signature detection (T027)
    text = removeSignature(text);

    // Remove "On [date] [person] wrote:" lines
    text = text.replace(/On .+ wrote:?\s*$/gm, '');

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    data.text = text;

  } catch (error) {
    console.error('[ScopeShield] Error extracting message text:', error);
  }

  return data;
}

/**
 * Remove quoted text from message (T026)
 * @param {string} text - Raw message text
 * @returns {string} Text without quotes
 */
function removeQuotedText(text) {
  const lines = text.split('\n');
  const cleanLines = [];
  let inQuoteBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for quote indicators
    if (trimmed.startsWith('>')) {
      inQuoteBlock = true;
      continue;
    }

    // Gmail quote blocks often start with "..."
    if (trimmed === '...' || trimmed.startsWith('...')) {
      inQuoteBlock = true;
      continue;
    }

    // Check for "On [date] wrote:" pattern
    if (/^On .+ wrote:?$/i.test(trimmed)) {
      inQuoteBlock = true;
      continue;
    }

    // Check for forward indicators
    if (/^-+ Forwarded message -+$/i.test(trimmed)) {
      inQuoteBlock = true;
      continue;
    }

    // Reset quote block on substantial new content
    if (trimmed.length > 20) {
      inQuoteBlock = false;
    }

    // Add line if not in quote block
    if (!inQuoteBlock) {
      cleanLines.push(line);
    }
  }

  return cleanLines.join('\n');
}

/**
 * Remove email signature from message (T027)
 * @param {string} text - Message text
 * @returns {string} Text without signature
 */
function removeSignature(text) {
  // Extended signature patterns
  const extendedPatterns = [
    /^--\s*$/m,
    /^-{3,}$/m,
    /^_{3,}$/m,
    /^regards[,.]?\s*$/mi,
    /^best[,.]?\s*$/mi,
    /^thanks[,.]?\s*$/mi,
    /^thank you[,.]?\s*$/mi,
    /^sincerely[,.]?\s*$/mi,
    /^cheers[,.]?\s*$/mi,
    /^best regards[,.]?\s*$/mi,
    /^kind regards[,.]?\s*$/mi,
    /^warm regards[,.]?\s*$/mi,
    /^sent from my (iphone|ipad|android|phone|mobile)/mi,
    /^get outlook for/mi,
    /^this email was sent from/mi
  ];

  let shortestText = text;

  // Find the earliest signature marker
  for (const pattern of extendedPatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      const truncated = text.substring(0, match.index);
      if (truncated.length < shortestText.length && truncated.length > 50) {
        shortestText = truncated;
      }
    }
  }

  // Also check for common signature structures (name + title + company)
  const structurePattern = /\n{2,}[\w\s]+\n[\w\s,]+\n[\w\s&,.-]+$/;
  const structureMatch = shortestText.match(structurePattern);
  if (structureMatch && structureMatch.index !== undefined) {
    const beforeSig = shortestText.substring(0, structureMatch.index);
    if (beforeSig.length > 50) {
      shortestText = beforeSig;
    }
  }

  return shortestText;
}

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