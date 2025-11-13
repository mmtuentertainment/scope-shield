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
 * Extract client information from detection event
 *
 * @param {Object} detectionEvent - Detection event
 * @returns {{clientName: string, clientEmail: string}}
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
 * Extract and combine requested changes from detection events
 *
 * @param {Array<Object>} detectionEvents - Detection events
 * @returns {Array<string>} Array of requested changes
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
