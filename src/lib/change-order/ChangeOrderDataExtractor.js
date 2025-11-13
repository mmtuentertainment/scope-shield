/**
 * Change Order Data Extractor
 *
 * Extracts client information and requested changes from detection events.
 * Handles sanitization, truncation, and fallback values.
 *
 * @module ChangeOrderDataExtractor
 */

import { sanitizeText } from '../utils/Sanitizer.js';
import { logInfo } from '../utils/Logger.js';

/**
 * Maximum length for detected text before truncation
 * @const
 */
const MAX_DETECTED_TEXT_LENGTH = 500;

/**
 * Truncated text display length
 * @const
 */
const TRUNCATED_TEXT_LENGTH = 200;

/**
 * Derives a sanitized client name and a validated email address from a detection event's sender.
 *
 * If the sender name or email is missing or invalid, the function falls back to the placeholders
 * `Client` for the name and `unknown@client.com` for the email.
 *
 * @param {Object} detectionEvent - Event object expected to include a `sender` object with optional `name` and `email` properties.
 * @returns {{clientName: string, clientEmail: string}} clientName is a trimmed, sanitized name (or `Client`); clientEmail is a trimmed, sanitized, lowercased email that contains an `@` (or `unknown@client.com`).
 */
export function extractClientInfo(detectionEvent) {
  if (!detectionEvent || !detectionEvent.sender) {
    return {
      clientName: 'Client', // Placeholder
      clientEmail: 'unknown@client.com' // Placeholder
    };
  }

  const sender = detectionEvent.sender;

  // Extract client name (sanitize for safety)
  let clientName = sender.name || sender.email || 'Client';
  clientName = sanitizeText(clientName).trim();

  if (!clientName || clientName === '') {
    clientName = 'Client'; // Fallback placeholder
  }

  // Extract client email (sanitize and validate basic format)
  let clientEmail = sender.email || 'unknown@client.com';
  clientEmail = sanitizeText(clientEmail).trim().toLowerCase();

  if (!clientEmail || !clientEmail.includes('@')) {
    clientEmail = 'unknown@client.com'; // Fallback placeholder
  }

  return { clientName, clientEmail };
}

/**
 * Extracts sanitized, trimmed requested-change strings from detection events, truncating long entries for display.
 *
 * Sanitizes each event's `detectedText`, trims whitespace, and if the result exceeds the display threshold it is truncated and appended with `...`. Logs truncation details when a text is truncated. If no valid texts are found, returns a single placeholder string.
 *
 * @param {Array<Object>} detectionEvents - Array of detection event objects; each may contain a `detectedText` string.
 * @returns {Array<string>} Array of sanitized requested-change strings, or `['No specific changes detected']` if none were extracted.
 */
export function extractRequestedChanges(detectionEvents) {
  const changes = [];

  for (const event of detectionEvents) {
    if (!event || !event.detectedText) {
      continue;
    }

    // Sanitize with max length to prevent excessive processing
    let text = sanitizeText(event.detectedText, MAX_DETECTED_TEXT_LENGTH).trim();

    // Truncate for display if still too long
    if (text.length > TRUNCATED_TEXT_LENGTH) {
      text = text.substring(0, TRUNCATED_TEXT_LENGTH) + '...';
      logInfo('ChangeOrderDataExtractor.extractRequestedChanges: Text truncated', {
        originalLength: event.detectedText.length,
        truncatedLength: text.length
      });
    }

    if (text && text !== '') {
      changes.push(text);
    }
  }

  // If no valid changes extracted, add placeholder
  if (changes.length === 0) {
    changes.push('No specific changes detected');
  }

  return changes;
}