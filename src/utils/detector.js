/**
 * Scope creep detection logic
 * Implements keyword matching with context awareness
 */

import { TRIGGER_WORDS, shouldExclude, findBestMatch } from './trigger-words.js';
import { extractContext } from './helpers.js';

/**
 * Detection result type
 * @typedef {Object} DetectionResult
 * @property {boolean} matched - Whether scope creep was detected
 * @property {string} [triggerWord] - Which trigger word matched
 * @property {number} [triggerWeight] - Confidence score (1-10)
 * @property {string} [matchedText] - The exact text that matched
 * @property {string} [context] - Context around the match
 * @property {number} [matchIndex] - Index where match was found
 */

/**
 * Pre-compiled regex pattern for high-confidence triggers (cached for performance & security)
 * Compiled once at module load to prevent ReDoS from dynamic regex construction
 */
let cachedTriggerPattern = null;

/**
 * Get or create the high-confidence trigger pattern (memoized)
 * @returns {RegExp} Pre-compiled trigger pattern
 */
function getHighConfidenceTriggerPattern() {
  if (!cachedTriggerPattern) {
    // Extract high-confidence phrases (weight >= 6)
    const highConfidencePhrases = TRIGGER_WORDS
      .filter(t => t.weight >= 6)
      .map(t => t.phrase.replace(/\s+\(.*?\)/, '')); // Remove (weak) suffixes

    // Escape special regex characters for safety
    const escapedPhrases = highConfidencePhrases
      .map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(phrase => phrase.length > 0 && phrase.length < 100); // Validate: non-empty and reasonable length

    // Create pattern with word boundaries
    const patternString = '\\b(' + escapedPhrases.join('|') + ')\\b';

    // Validate total pattern length to prevent ReDoS
    if (patternString.length > 10000) {
      console.error('[ScopeShield] Trigger pattern too long, using safe default');
      cachedTriggerPattern = /\b(also|additionally|one more thing)\b/gi;
    } else {
      cachedTriggerPattern = new RegExp(patternString, 'gi');
    }
  }
  return cachedTriggerPattern;
}

/**
 * Detect scope creep in text
 * @param {string} text - Text to analyze
 * @returns {DetectionResult} Detection result
 */
export function detectScopeCreep(text) {
  const startTime = performance.now();

  // Skip empty text
  if (!text || text.trim().length === 0) {
    return { matched: false };
  }

  // Normalize text for matching
  const normalizedText = text.toLowerCase().trim();

  // Remove quoted email replies (lines starting with >)
  const lines = normalizedText.split('\n');
  const unquotedLines = lines.filter(line => !line.trim().startsWith('>'));
  const cleanText = unquotedLines.join('\n').trim();

  // Skip if all text was quoted
  if (!cleanText) {
    return { matched: false };
  }

  // Check exclusion patterns first (T024)
  if (shouldExclude(cleanText)) {
    console.log('[ScopeShield] Text excluded by exclusion pattern');
    return { matched: false };
  }

  // Additional exclusion: pure questions without action verbs (T025)
  if (isQuestionWithoutAction(cleanText)) {
    console.log('[ScopeShield] Question without action verb excluded');
    return { matched: false };
  }

  // Find best matching trigger
  const trigger = findBestMatch(cleanText);

  if (!trigger) {
    return { matched: false };
  }

  // Get match details
  const match = cleanText.match(trigger.pattern);
  if (!match) {
    return { matched: false };
  }

  // Extract context (preserve original case) - T028
  const matchIndex = match.index || 0;
  const matchLength = match[0].length;
  const context = extractContext(text, matchIndex, matchLength);

  // Calculate adjusted weight based on context (T029)
  const adjustedWeight = calculateAdjustedWeight(trigger, cleanText, matchIndex);

  const result = {
    matched: true,
    triggerWord: trigger.phrase,
    triggerWeight: adjustedWeight,
    matchedText: match[0],
    context: context,
    matchIndex: matchIndex
  };

  // Log performance
  const elapsed = performance.now() - startTime;
  if (elapsed > 10) {
    console.log(`[ScopeShield] Detection took ${elapsed.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Check if text is a question without action verbs (T025)
 * @param {string} text - Normalized text
 * @returns {boolean} True if question without action
 */
function isQuestionWithoutAction(text) {
  // Check if it's a question
  const questionPattern = /\b(what|when|where|who|how|why|is|are|was|were|will|would|could|should)\b/i;
  if (!questionPattern.test(text)) {
    return false;
  }

  // Check if it lacks action verbs
  const actionPattern = /\b(add|create|build|implement|fix|update|change|modify|develop|design|integrate|include)\b/i;
  return !actionPattern.test(text);
}

/**
 * Calculate adjusted weight based on context (T029)
 * @param {Object} trigger - Trigger object
 * @param {string} text - Full text
 * @param {number} matchIndex - Index of match
 * @returns {number} Adjusted weight
 */
function calculateAdjustedWeight(trigger, text, matchIndex) {
  let weight = trigger.weight;

  // Boost weight if multiple triggers present
  // Using pre-compiled pattern for performance and security (ReDoS prevention)
  const triggerPattern = getHighConfidenceTriggerPattern();
  const triggerCount = (text.match(triggerPattern) || []).length;

  if (triggerCount > 1) {
    weight = Math.min(10, weight + 1);
  }

  // Reduce weight if match is in a question
  if (text.includes('?') && matchIndex < text.indexOf('?')) {
    weight = Math.max(1, weight - 1);
  }

  // Boost weight if request includes urgency words
  if (/\b(asap|urgent|immediately|right away|today|now)\b/i.test(text)) {
    weight = Math.min(10, weight + 1);
  }

  return weight;
}

/**
 * Detect scope creep in multiple texts
 * @param {Array<string>} texts - Array of texts to analyze
 * @returns {Array<DetectionResult>} Array of detection results
 */
export function detectScopeCreepBatch(texts) {
  return texts.map(text => detectScopeCreep(text));
}

/**
 * Check if detection confidence is high enough
 * @param {DetectionResult} result - Detection result
 * @param {number} threshold - Minimum weight threshold (default: 5)
 * @returns {boolean} True if confidence is high enough
 */
export function isHighConfidence(result, threshold = 5) {
  return result.matched && result.triggerWeight >= threshold;
}

/**
 * Filter out low-confidence detections
 * @param {Array<DetectionResult>} results - Array of results
 * @param {number} threshold - Minimum weight threshold
 * @returns {Array<DetectionResult>} Filtered results
 */
export function filterHighConfidence(results, threshold = 5) {
  return results.filter(r => isHighConfidence(r, threshold));
}

/**
 * Get detection statistics from results
 * @param {Array<DetectionResult>} results - Array of results
 * @returns {Object} Statistics object
 */
export function getDetectionStats(results) {
  const matched = results.filter(r => r.matched);
  const weights = matched.map(r => r.triggerWeight || 0);

  return {
    total: results.length,
    detected: matched.length,
    detectionRate: results.length > 0 ? (matched.length / results.length) * 100 : 0,
    averageWeight: weights.length > 0 ?
      weights.reduce((a, b) => a + b, 0) / weights.length : 0,
    highConfidence: matched.filter(r => r.triggerWeight >= 7).length,
    mediumConfidence: matched.filter(r => r.triggerWeight >= 5 && r.triggerWeight < 7).length,
    lowConfidence: matched.filter(r => r.triggerWeight < 5).length
  };
}

// Export test corpus for validation
export const TEST_CORPUS = {
  scopeCreep: [
    'Also, can you add user authentication?',
    'Additionally, could you build a dashboard?',
    'One more thing - please create a report feature',
    'While you\'re at it, update the logo',
    'By the way, can we change the colors?',
    'Quick favor - adjust the layout',
    'I forgot to mention, we need analytics',
    'Actually, let\'s redesign the homepage instead',
    'Oh and can you add social media integration?',
    'Another thing - we need email notifications'
  ],
  normal: [
    'Also, thank you for your work!',
    'Also, I\'m excited about this project',
    'By the way, when is the deadline?',
    'I appreciate your help with this',
    'Looking forward to seeing the results',
    'Also, the current design looks great',
    'Additionally, everything is on track',
    'One more thing - great job so far!',
    'While you\'re at it, keep up the good work',
    'Actually, I\'m very happy with the progress'
  ]
};

/**
 * Validate detection accuracy on test corpus
 * @returns {Object} Validation results
 */
export function validateAccuracy() {
  // Test scope creep detection
  const scopeCreepResults = TEST_CORPUS.scopeCreep.map(text => ({
    text,
    result: detectScopeCreep(text)
  }));

  const scopeCreepDetected = scopeCreepResults.filter(r => r.result.matched).length;
  const scopeCreepAccuracy = (scopeCreepDetected / TEST_CORPUS.scopeCreep.length) * 100;

  // Test false positive rate
  const normalResults = TEST_CORPUS.normal.map(text => ({
    text,
    result: detectScopeCreep(text)
  }));

  const falsePositives = normalResults.filter(r => r.result.matched).length;
  const falsePositiveRate = (falsePositives / TEST_CORPUS.normal.length) * 100;

  const overallAccuracy =
    ((scopeCreepDetected + (TEST_CORPUS.normal.length - falsePositives)) /
    (TEST_CORPUS.scopeCreep.length + TEST_CORPUS.normal.length)) * 100;

  return {
    scopeCreepAccuracy,
    falsePositiveRate,
    overallAccuracy,
    scopeCreepDetected,
    falsePositives,
    totalScopeCreep: TEST_CORPUS.scopeCreep.length,
    totalNormal: TEST_CORPUS.normal.length,
    details: {
      scopeCreep: scopeCreepResults,
      normal: normalResults
    }
  };
}
