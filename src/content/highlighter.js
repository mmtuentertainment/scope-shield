/**
 * Text highlighting functionality for scope creep detection (T032)
 * Provides visual indicators in Gmail interface
 */

// Confidence level thresholds
const CONFIDENCE_THRESHOLD_HIGH = 8;
const CONFIDENCE_THRESHOLD_MEDIUM = 5;

/**
 * Highlight detected scope creep text in message element (T032)
 * @param {Element} messageEl - Message element containing text
 * @param {Object} detection - Detection result with match details
 * @returns {boolean} True if highlighting was successful
 */
export function highlightText(messageEl, detection) {
  if (!messageEl || !detection || !detection.matched) {
    return false;
  }

  try {
    // Find the text node containing the matched text
    const textNodes = getTextNodes(messageEl);
    const matchedText = detection.matchedText;

    for (const node of textNodes) {
      const nodeText = node.textContent.toLowerCase();
      const matchIndex = nodeText.indexOf(matchedText.toLowerCase());

      if (matchIndex === -1) continue;

      // Found the node with our match
      return highlightTextNode(node, matchIndex, matchedText.length, detection);
    }

    console.warn('[ScopeShield] Could not find text to highlight:', matchedText);
    return false;
  } catch (error) {
    console.error('[ScopeShield] Error highlighting text:', error);
    return false;
  }
}

/**
 * Highlight text within a text node (T034)
 * @param {TextNode} textNode - Text node containing match
 * @param {number} startIndex - Start index of match
 * @param {number} length - Length of match
 * @param {Object} detection - Detection details
 * @returns {boolean} Success status
 */
function highlightTextNode(textNode, startIndex, length, detection) {
  const text = textNode.textContent;
  const parent = textNode.parentNode;

  // Check if already highlighted
  if (parent.classList && parent.classList.contains('scopeshield-highlight')) {
    return false;
  }

  // Split the text node into three parts: before, match, after
  const beforeText = text.substring(0, startIndex);
  const matchText = text.substring(startIndex, startIndex + length);
  const afterText = text.substring(startIndex + length);

  // Create highlight span
  const highlightSpan = document.createElement('span');
  highlightSpan.className = 'scopeshield-highlight';
  highlightSpan.setAttribute('data-trigger', detection.triggerWord);
  highlightSpan.setAttribute('data-weight', detection.triggerWeight);
  highlightSpan.setAttribute('title', `Scope Creep: ${detection.triggerWord} (confidence: ${detection.triggerWeight}/10)`);

  // Set confidence-based class
  if (detection.triggerWeight >= CONFIDENCE_THRESHOLD_HIGH) {
    highlightSpan.classList.add('scopeshield-high-confidence');
  } else if (detection.triggerWeight >= CONFIDENCE_THRESHOLD_MEDIUM) {
    highlightSpan.classList.add('scopeshield-medium-confidence');
  } else {
    highlightSpan.classList.add('scopeshield-low-confidence');
  }

  // Create text nodes
  const beforeNode = beforeText ? document.createTextNode(beforeText) : null;
  const highlightedText = document.createTextNode(matchText);
  const afterNode = afterText ? document.createTextNode(afterText) : null;

  // Build the highlighted content
  highlightSpan.appendChild(highlightedText);

  // Replace original text node with new structure
  const fragment = document.createDocumentFragment();
  if (beforeNode) fragment.appendChild(beforeNode);
  fragment.appendChild(highlightSpan);
  if (afterNode) fragment.appendChild(afterNode);

  parent.replaceChild(fragment, textNode);

  // Add animation class after a brief delay
  setTimeout(() => {
    highlightSpan.classList.add('scopeshield-highlight-animate');
  }, 10);

  return true;
}

/**
 * Get all text nodes within an element
 * @param {Element} element - Parent element
 * @returns {Array<TextNode>} Array of text nodes
 */
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip empty nodes and nodes in scripts/styles
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;

        const parent = node.parentNode;
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode()) !== null) {
    textNodes.push(node);
  }

  return textNodes;
}

/**
 * Remove all highlights from a message element
 * @param {Element} messageEl - Message element
 */
export function removeHighlights(messageEl) {
  const highlights = messageEl.querySelectorAll('.scopeshield-highlight');

  highlights.forEach(highlight => {
    const text = highlight.textContent;
    const textNode = document.createTextNode(text);
    highlight.parentNode.replaceChild(textNode, highlight);
  });
}

/**
 * Update highlight styles based on user preferences
 * @param {Object} preferences - User preferences
 */
export function updateHighlightStyles(preferences) {
  const { highlightColor, opacity, showTooltips } = preferences;

  // Create or update style element
  let styleEl = document.getElementById('scopeshield-dynamic-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'scopeshield-dynamic-styles';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .scopeshield-highlight {
      background-color: ${highlightColor || '#FFEB3B'} !important;
      opacity: ${opacity || 0.8} !important;
      ${!showTooltips ? 'pointer-events: none !important;' : ''}
    }
  `;
}

/**
 * Get highlight statistics for a message
 * @param {Element} messageEl - Message element
 * @returns {Object} Statistics object
 */
export function getHighlightStats(messageEl) {
  const highlights = messageEl.querySelectorAll('.scopeshield-highlight');
  const stats = {
    total: highlights.length,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    triggers: {}
  };

  highlights.forEach(highlight => {
    const weight = parseInt(highlight.getAttribute('data-weight') || 0);
    const trigger = highlight.getAttribute('data-trigger');

    if (weight >= CONFIDENCE_THRESHOLD_HIGH) stats.highConfidence++;
    else if (weight >= CONFIDENCE_THRESHOLD_MEDIUM) stats.mediumConfidence++;
    else stats.lowConfidence++;

    stats.triggers[trigger] = (stats.triggers[trigger] || 0) + 1;
  });

  return stats;
}

/**
 * Add click handler to highlights for showing details
 * @param {Element} highlightEl - Highlight element
 * @param {Function} callback - Click callback
 */
export function addHighlightClickHandler(highlightEl, callback) {
  highlightEl.style.cursor = 'pointer';
  highlightEl.addEventListener('click', (event) => {
    event.stopPropagation();
    const data = {
      trigger: highlightEl.getAttribute('data-trigger'),
      weight: highlightEl.getAttribute('data-weight'),
      text: highlightEl.textContent
    };
    callback(data);
  });
}
