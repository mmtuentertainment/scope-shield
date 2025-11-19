/**
 * Gmail DOM selector utilities
 * Provides stable selectors with fallback chain for Gmail elements
 *
 * TODO Feature 003: Remote Selector Configuration
 * These selectors can break when Gmail updates (every 3-6 months).
 * Future: Fetch configs from GitHub gist, cache locally.
 * Trigger: Gmail DOM breaks OR 1000+ users
 * See: specs/003-remote-selector-config/BACKLOG.md
 */

/**
 * Gmail DOM selectors with fallback chain
 * Priority: data-* attributes → ARIA roles → CSS classes
 */
export const SELECTORS = {
  // Thread and message selectors
  thread: '[data-thread-id], [role="main"], .nH.ar4.z',
  message: '[data-message-id], [role="listitem"], .ii.gt',
  messageBody: '[data-message-id] .a3s, [role="listitem"] .a3s, .ii.gt .a3s',

  // Quoted text and signatures
  quoted: 'div.gmail_quote, blockquote, .im',
  signature: 'div.gmail_signature, .gmail_attr, [data-smartmail="gmail_signature"]',

  // Email metadata
  emailSubject: 'h2[data-legacy-subject], .hP',
  senderEmail: '[email], span.gD',
  senderName: '[data-name], span.gD',

  // Thread info
  threadContainer: '[role="main"], .nH.ar4.z',
  expandedMessage: '.ii.gt.adP',

  // Gmail layout
  inbox: '[role="main"]',
  conversationView: '.adn.ads',
  messageList: '.Cp tbody'
};

/**
 * Find messages in the current Gmail view
 * @returns {NodeList} List of message elements
 */
export function findMessages() {
  // Try data attributes first (most stable)
  let messages = document.querySelectorAll('[data-message-id]');

  // Fallback to ARIA roles
  if (!messages || messages.length === 0) {
    messages = document.querySelectorAll('[role="listitem"]');
  }

  // Fallback to CSS classes (least stable)
  if (!messages || messages.length === 0) {
    messages = document.querySelectorAll('.ii.gt');
  }

  return messages;
}

/**
 * Extract message body from a message element
 * @param {Element} messageElement - The message element
 * @returns {Element|null} The message body element
 */
export function findMessageBody(messageElement) {
  if (!messageElement) return null;

  // Try data attribute selector first
  let body = messageElement.querySelector('.a3s');

  // Fallback to searching within expanded message
  if (!body) {
    body = messageElement.querySelector('.ii.gt .a3s');
  }

  return body;
}

/**
 * Check if element is quoted text
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is quoted text
 */
export function isQuotedText(element) {
  if (!element) return false;

  // Check if element or any parent matches quoted selectors
  return element.matches(SELECTORS.quoted) ||
         element.closest(SELECTORS.quoted) !== null;
}

/**
 * Check if element is a signature
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is a signature
 */
export function isSignature(element) {
  if (!element) return false;

  // Check if element or any parent matches signature selectors
  return element.matches(SELECTORS.signature) ||
         element.closest(SELECTORS.signature) !== null;
}

/**
 * Extract clean text from message body (excluding quotes and signatures)
 * @param {Element} messageBody - The message body element
 * @returns {string} Clean text content
 */
export function extractCleanText(messageBody) {
  if (!messageBody) return '';

  // Clone to avoid modifying the actual DOM
  const clone = messageBody.cloneNode(true);

  // Remove quoted text
  clone.querySelectorAll(SELECTORS.quoted).forEach(el => el.remove());

  // Remove signatures
  clone.querySelectorAll(SELECTORS.signature).forEach(el => el.remove());

  // Get text content and clean up whitespace
  return clone.textContent.trim().replace(/\s+/g, ' ');
}

/**
 * Get email metadata from message element
 * @param {Element} messageElement - The message element
 * @returns {Object} Email metadata (subject, sender, etc.)
 */
export function getEmailMetadata(messageElement) {
  if (!messageElement) {
    return {
      subject: 'No subject',
      sender: 'unknown@gmail.com',
      senderName: null,
      threadId: extractThreadId(),
      messageId: ''
    };
  }

  const container = messageElement.closest(SELECTORS.threadContainer) || document;

  return {
    subject: container.querySelector(SELECTORS.emailSubject)?.textContent?.trim() || 'No subject',
    sender: messageElement.querySelector(SELECTORS.senderEmail)?.textContent?.trim() ||
            messageElement.querySelector(SELECTORS.senderName)?.getAttribute('email') ||
            'unknown@gmail.com',
    senderName: messageElement.querySelector(SELECTORS.senderName)?.textContent?.trim() || null,
    threadId: extractThreadId(),
    messageId: extractMessageId(messageElement)
  };
}

/**
 * Extract Gmail thread ID from URL or DOM
 * @returns {string} Thread ID or empty string
 */
export function extractThreadId() {
  // Try to get from URL first (stricter validation: 16 hex chars typical for Gmail thread IDs)
  const urlMatch = window.location.href.match(/\/([a-f0-9]{16})$/i);
  if (urlMatch) return urlMatch[1];

  // Try to get from DOM
  const threadElement = document.querySelector('[data-thread-id]');
  if (threadElement) {
    const threadId = threadElement.getAttribute('data-thread-id');
    // Validate format (Gmail uses 16 hex chars)
    if (threadId && /^[a-f0-9]{16}$/i.test(threadId)) {
      return threadId;
    }
  }

  // Fallback: extract from URL hash (stricter validation)
  const hashMatch = window.location.hash.match(/#[^/]+\/([a-f0-9]{16})/i);
  if (hashMatch) return hashMatch[1];

  return '';
}

/**
 * Extract Gmail message ID from element
 * @param {Element} messageElement - The message element
 * @returns {string} Message ID or empty string
 */
export function extractMessageId(messageElement) {
  // Try data attribute
  if (messageElement.hasAttribute('data-message-id')) {
    return messageElement.getAttribute('data-message-id');
  }

  // Try legacy ID attribute
  if (messageElement.id) {
    return messageElement.id;
  }

  // Generate from index as fallback
  const messages = findMessages();
  const index = Array.from(messages).indexOf(messageElement);
  return index >= 0 ? `msg-${index}` : '';
}

/**
 * Get Gmail URL for current email/thread
 * @returns {string} Gmail URL
 */
export function getCurrentGmailUrl() {
  return window.location.href;
}

/**
 * Check if Gmail is in dark mode
 * @returns {boolean} True if dark mode is active
 */
export function isDarkMode() {
  // Check for Gmail's dark mode class
  return document.body.classList.contains('aAU') ||
         document.documentElement.classList.contains('dark');
}
