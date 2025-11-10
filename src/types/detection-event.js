/**
 * DetectionEvent entity type definition
 * Represents a single instance of detected scope creep
 */

import {
  validateUuid,
  validateEmail,
  validateGmailUrl,
  validateWeight,
  validateThreadId,
  validateMessageId,
  validateStringLength,
  validateTimestamp,
  validateBoolean
} from '../validation/validators.js';

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
  // Validate all required parameters using validators
  const validations = {
    id: validateUuid(id),
    sender: validateEmail(sender),
    triggerWeight: validateWeight(triggerWeight),
    emailUrl: validateGmailUrl(emailUrl),
    threadId: validateThreadId(threadId),
    messageId: validateMessageId(messageId)
  };

  // Check for validation errors and throw the first one found
  for (const [_field, result] of Object.entries(validations)) {
    if (!result.valid) {
      throw new Error(result.error);
    }
  }

  // Validate simple string fields
  if (!emailSubject || typeof emailSubject !== 'string') {
    throw new Error('Invalid or missing emailSubject (must be non-empty string)');
  }
  if (!detectedText || typeof detectedText !== 'string') {
    throw new Error('Invalid or missing detectedText (must be non-empty string)');
  }
  if (!triggerWord || typeof triggerWord !== 'string') {
    throw new Error('Invalid or missing triggerWord (must be non-empty string)');
  }

  return {
    id,
    timestamp: new Date().toISOString(),
    emailSubject: emailSubject.substring(0, 200),
    sender,
    senderName: senderName || null,
    detectedText: detectedText.substring(0, 100),
    triggerWord,
    triggerWeight,
    emailUrl,
    threadId,
    messageId,
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

  // Validate required fields using validators
  const validations = [
    validateUuid(event.id),
    validateTimestamp(event.timestamp),
    validateStringLength(event.emailSubject, 'emailSubject', 200),
    validateEmail(event.sender),
    validateStringLength(event.detectedText, 'detectedText', 100),
    validateGmailUrl(event.emailUrl),
    validateWeight(event.triggerWeight),
    validateBoolean(event.acknowledged, 'acknowledged')
  ];

  // Collect errors from validators
  validations.forEach(result => {
    if (!result.valid) {
      errors.push(result.error);
    }
  });

  // Validate triggerWord separately (special case)
  if (!event.triggerWord || typeof event.triggerWord !== 'string') {
    errors.push('Missing triggerWord');
  }

  // Validate optional threadId if present
  if (event.threadId) {
    const threadIdResult = validateThreadId(event.threadId);
    if (!threadIdResult.valid) {
      errors.push(threadIdResult.error);
    }
  }

  // Validate optional messageId if present
  if (event.messageId) {
    const messageIdResult = validateMessageId(event.messageId);
    if (!messageIdResult.valid) {
      errors.push(messageIdResult.error);
    }
  }

  return errors;
}