/**
 * DetectionEvent entity type definition
 * Represents a single instance of detected scope creep
 */

/**
 * @typedef {Object} DetectionEvent
 * @property {string} id - Unique identifier (UUID v4)
 * @property {string} timestamp - ISO 8601 timestamp when detected
 * @property {string} emailSubject - Subject line of the email (max 200 chars)
 * @property {string} sender - Email address of sender
 * @property {string} [senderName] - Display name of sender (optional)
 * @property {string} detectedText - The trigger phrase found (max 100 chars)
 * @property {string} triggerWord - Which keyword triggered detection
 * @property {number} triggerWeight - Confidence score (1-10)
 * @property {string} emailUrl - Gmail URL to the email
 * @property {string} threadId - Gmail thread ID
 * @property {string} messageId - Gmail message ID
 * @property {boolean} acknowledged - Whether user has seen/dismissed this event
 */

/**
 * Create a new DetectionEvent
 * @param {Object} params - Event parameters
 * @returns {DetectionEvent} A new DetectionEvent object
 */
export function createDetectionEvent({
  id,
  emailSubject,
  sender,
  senderName,
  detectedText,
  triggerWord,
  triggerWeight,
  emailUrl,
  threadId,
  messageId
}) {
  // Validate threadId format before creating event
  const validThreadId = threadId && /^[a-f0-9]{16}$/i.test(threadId) ? threadId : '';

  // Validate messageId format before creating event
  const validMessageId = messageId && typeof messageId === 'string' ? messageId : '';

  return {
    id: id,
    timestamp: new Date().toISOString(),
    emailSubject: emailSubject ? emailSubject.substring(0, 200) : 'No subject',
    sender: sender || 'unknown@gmail.com',
    senderName: senderName || null,
    detectedText: detectedText ? detectedText.substring(0, 100) : '',
    triggerWord: triggerWord || '',
    triggerWeight: triggerWeight || 5,
    emailUrl: emailUrl || '',
    threadId: validThreadId,
    messageId: validMessageId,
    acknowledged: false
  };
}

/**
 * Validate a DetectionEvent object
 * @param {Object} event - The event to validate
 * @returns {Array} Array of validation errors (empty if valid)
 */
export function validateDetectionEvent(event) {
  const errors = [];

  // Required fields
  if (!event.id || !event.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    errors.push('Invalid or missing id (must be UUID v4)');
  }

  if (!event.timestamp || isNaN(Date.parse(event.timestamp))) {
    errors.push('Invalid or missing timestamp (must be ISO 8601)');
  }

  if (!event.emailSubject || event.emailSubject.length > 200) {
    errors.push('Invalid emailSubject (max 200 chars)');
  }

  if (!event.sender || !event.sender.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Invalid or missing sender (must be valid email)');
  }

  if (!event.detectedText || event.detectedText.length > 100) {
    errors.push('Invalid detectedText (max 100 chars)');
  }

  if (!event.triggerWord || typeof event.triggerWord !== 'string') {
    errors.push('Missing triggerWord');
  }

  if (typeof event.triggerWeight !== 'number' || event.triggerWeight < 1 || event.triggerWeight > 10) {
    errors.push('Invalid triggerWeight (must be 1-10)');
  }

  if (!event.emailUrl || !event.emailUrl.startsWith('https://mail.google.com/')) {
    errors.push('Invalid emailUrl (must be Gmail URL)');
  }

  // Validate threadId if present (Gmail uses 16 hex chars)
  if (event.threadId && !/^[a-f0-9]{16}$/i.test(event.threadId)) {
    errors.push('Invalid threadId format (must be 16 hex characters)');
  }

  // Validate messageId if present
  if (event.messageId && typeof event.messageId !== 'string') {
    errors.push('Invalid messageId (must be string)');
  }

  if (typeof event.acknowledged !== 'boolean') {
    errors.push('Invalid acknowledged (must be boolean)');
  }

  return errors;
}