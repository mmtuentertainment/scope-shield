/**
 * Trigger word patterns configuration for scope creep detection
 */

/**
 * @typedef {Object} TriggerWord
 * @property {string} phrase - The trigger phrase identifier
 * @property {RegExp} pattern - Regex pattern for matching
 * @property {boolean} contextRequired - Whether additional context is needed
 * @property {number} weight - Confidence score (1-10)
 * @property {string} description - Human-readable description
 */

/**
 * Trigger word patterns organized by confidence level
 * @type {Array<TriggerWord>}
 */
 
export const TRIGGER_WORDS = [
  // ============ HIGH-CONFIDENCE PATTERNS (weight: 8-10) ============
  // These patterns strongly indicate scope creep with explicit requests

  {
    phrase: 'also + action',
    pattern: /\b(also|additionally|one more thing)[,\s]+(?:(can you|could you|would you|can we|could we|please)\s+(\w+ly\s+)?|(\w+ly\s+))(add|create|build|implement|design|develop|make|include|update|change|modify|have)/i,
    contextRequired: false,
    weight: 9,
    description: 'Strong scope creep indicator: trigger word + explicit request'
  },

  {
    phrase: 'forgot to mention',
    pattern: /\b(I\s+)?(forgot to (mention|ask|include|tell|say|add)|should have mentioned|just realized)/i,
    contextRequired: false,
    weight: 9,
    description: 'Late-stage addition to scope'
  },

  {
    phrase: 'one more thing',
    pattern: /\bone more (thing|request|feature|change|update|item|task)[,:\s-]+/i,
    contextRequired: false,
    weight: 8,
    description: 'Explicit additional request'
  },

  // ============ MEDIUM-CONFIDENCE PATTERNS (weight: 5-7) ============
  // Common phrases that often indicate scope creep

  {
    phrase: 'while you\'re at it',
    pattern: /\bwhile you(?:'?re|\s+are)?\s+(?:at it|there|working)/i,
    contextRequired: false,
    weight: 7,
    description: 'Common scope creep phrase: implies additional work'
  },

  {
    phrase: 'by the way',
    pattern: /\b(by the way|btw)[,\s]+.{0,50}(can|could|would|please|I need|we need|add|create|build|implement|fix|update|change)/i,
    contextRequired: false,
    weight: 6,
    description: 'Casual additional request indicator'
  },

  {
    phrase: 'quick favor',
    pattern: /\b(quick|small|tiny|little|simple)\s+(favor|request|change|update|addition|modification)[,:\s-]+/i,
    contextRequired: false,
    weight: 7,
    description: 'Minimizes scope addition ("it\'s just a quick thing")'
  },

  {
    phrase: 'actually/instead',
    pattern: /\b(?:(?:actually|instead)[,\s]+.{0,50}(?:let'?s|can we|can you|could we|could you|would you|please|change|redesign|redo|switch|do|add)|let'?s\s+(?:\w+\s+){0,3}instead)/i,
    contextRequired: false,
    weight: 6,
    description: 'Direction change indicator'
  },

  {
    phrase: 'oh and',
    pattern: /\b(oh and|oh,? also|oh,? by the way)[,\s]+.{0,50}(can|could|would|please|add|create|build)/i,
    contextRequired: false,
    weight: 6,
    description: 'Casual addition marker'
  },

  // ============ LOW-CONFIDENCE PATTERNS (weight: 3-4) ============
  // Weak signals that require additional context

  {
    phrase: 'also (weak)',
    pattern: /\balso[,\s]+.{0,50}(add|create|build|change|modify|update|redesign|implement|include|develop)/i,
    contextRequired: true,
    weight: 4,
    description: 'Weak trigger - requires action verb within 50 chars'
  },

  {
    phrase: 'additionally (weak)',
    pattern: /\badditionally[,\s]+.{0,50}(add|create|build|change|modify|update|implement|include|need|want|require)/i,
    contextRequired: true,
    weight: 4,
    description: 'Weak trigger - requires action verb'
  },

  {
    phrase: 'another thing',
    pattern: /\b(another thing|one other thing|other thing)[,:\s-]+.{0,50}(is|would be|could be|can you|could you|we need|I need|add|create|build|implement)/i,
    contextRequired: true,
    weight: 5,
    description: 'Additional item indicator'
  },

  {
    phrase: 'would be nice',
    pattern: /\b(would be nice|would be great|would be awesome|would be helpful)\s+(if|to have|to add|to include)/i,
    contextRequired: true,
    weight: 4,
    description: 'Soft request for additional features'
  },

  // Very low confidence - generic action requests
  {
    phrase: 'can you / could you',
    pattern: /\b(can you|could you|can we|could we)\s+(add|implement|build|create|include|integrate|develop|fix|update|change|modify|have)/i,
    contextRequired: true,
    weight: 3,
    description: 'Generic action request - needs context'
  },

  // Additional low confidence patterns
  {
    phrase: 'please add',
    pattern: /\b(please|we need|need to)\s+(add|implement|build|create|include|\w+)/i,
    contextRequired: true,
    weight: 2,
    description: 'Direct request without trigger word'
  },

  // Catch-all for simple action requests
  {
    phrase: 'simple request',
    pattern: /\b(add|implement|build|create)\s+(.*\s+)?(feature|functionality|support|integration|option)/i,
    contextRequired: true,
    weight: 2,
    description: 'Simple feature request'
  }
];
 

/**
 * Exclusion patterns - phrases that should NOT trigger detection
 * @type {Array<RegExp>}
 */
 
export const EXCLUSION_PATTERNS = [
  // Pure questions without requests
  /\b(also|additionally|by the way|one more thing)[,\s-]+(what|when|where|who|how|why)\s+(is|are|was|were|will|would|could|should)(?!.*\b(add|create|build|change|implement|fix))/i,

  // Status updates or confirmations
  /\b(also|additionally|by the way)[,\s]+\b(I have|I'?ve|I am|I'?m|we have|we'?ve|we are|we'?re|everything is|everything looks|the \w+ looks)\b/i,

  // General excitement or comments
  /\b(also|additionally|by the way|one more thing)[,\s]+(excited|happy|pleased|looking forward|can'?t wait|great job|good work|excellent|perfect)/i,

  // Positive feedback
  /\b(great job|good work|excellent|perfect|looks great|looks good|on track)/i,

  // Pure status questions
  /\bwhen is the deadline/i,
  /\bwhat time is/i,
  /\bare we still on track/i,

  // Cancelled/retracted requests
  /\b(nevermind|never mind|forget it|scratch that|cancel that|actually,?\s+(forget|ignore|skip))/i,

  // Hypothetical/conditional questions (not actual requests)
  /\b(check if|see if|wonder if|ask if|if we need|if you need|should we|do we need)/i,

  // Negative requests (telling NOT to do something)
  /\b(do not|don'?t|stop|remove|delete|cancel|avoid)\s+(add|create|build|implement|change|modify)/i
];
 

/**
 * Check if text matches any exclusion patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if text should be excluded
 */
export function shouldExclude(text) {
  return EXCLUSION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Cached sorted trigger words for performance (sorted by weight, highest first)
 * @type {Array<TriggerWord>}
 */
const SORTED_TRIGGER_WORDS = [...TRIGGER_WORDS].sort((a, b) => b.weight - a.weight);

/**
 * Get all trigger patterns sorted by weight (highest first)
 * @returns {Array<TriggerWord>} Sorted trigger words
 */
export function getTriggerWordsSorted() {
  return SORTED_TRIGGER_WORDS;
}

/**
 * Find the best matching trigger word for text
 * @param {string} text - Text to analyze
 * @returns {TriggerWord|null} Best matching trigger or null
 */
export function findBestMatch(text) {
  // Check exclusions first
  if (shouldExclude(text)) {
    return null;
  }

  // Try high-confidence patterns first (already sorted by weight)
  for (const trigger of getTriggerWordsSorted()) {
    if (trigger.pattern.test(text)) {
      return trigger;
    }
  }

  return null;
}