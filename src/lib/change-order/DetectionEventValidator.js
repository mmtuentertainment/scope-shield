/**
 * Detection Event Validator
 *
 * Validates detection event structure before processing.
 * Ensures required fields are present and properly typed.
 *
 * @module DetectionEventValidator
 */

/**
 * Validate detection event structure
 *
 * @param {Object} detectionEvent - Detection event to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateDetectionEvent(detectionEvent) {
  const errors = [];

  if (!detectionEvent || typeof detectionEvent !== 'object') {
    errors.push('Detection event must be an object');
    return { valid: false, errors };
  }

  if (!detectionEvent.sender || typeof detectionEvent.sender !== 'object') {
    errors.push('Detection event must have sender object');
  }

  if (!detectionEvent.detectedText || typeof detectionEvent.detectedText !== 'string') {
    errors.push('Detection event must have detectedText string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
