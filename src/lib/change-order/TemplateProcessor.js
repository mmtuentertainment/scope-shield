/**
 * Template processing logic for conditionals and loops
 *
 * Handles:
 * - Conditional blocks {{@if}}...{{@else}}...{{/@if}}
 * - Loop blocks {{@each}}...{{/@each}}
 * - Nested structures with proper tag matching
 *
 * @module TemplateProcessor
 */

import { getValue, isTruthy, replaceVariables } from './TemplateHelpers.js';
import { logWarning } from '../utils/Logger.js';

/**
 * Maximum iterations for nested processing to prevent infinite loops
 * @constant {number}
 */
export const MAX_ITERATIONS = 100;

/**
 * Process conditional blocks {{@if condition}}...{{@else}}...{{/@if}}
 * Handles nested conditionals by finding matching pairs
 * @param {string} text - Text to process
 * @param {object} data - Data for conditional evaluation
 * @returns {string} Processed text
 */
export function processConditionals(text, data) {
  let result = text;
  let changed = true;
  let iterations = 0;

  // Process innermost conditionals first by repeating until no more changes
  while (changed && iterations < MAX_ITERATIONS) {
    const before = result;
    result = processSingleConditionalPass(result, data);
    changed = before !== result;
    iterations++;
  }

  if (iterations >= MAX_ITERATIONS) {
    logWarning('Max iterations reached in processConditionals - possible malformed template');
  }

  return result;
}

/**
 * Process one level of conditionals
 * @param {string} text - Text to process
 * @param {object} data - Data for conditional evaluation
 * @returns {string} Processed text
 */
function processSingleConditionalPass(text, data) {
  const openMatch = text.match(/\{\{@if\s+([^}]+)\}\}/);
  if (!openMatch) {
    return text;
  }

  const condition = openMatch[1].trim();
  const startPos = openMatch.index;
  const contentStart = startPos + openMatch[0].length;

  const endInfo = findMatchingClose(text, contentStart, '{{@if', '{{/@if}}');
  if (!endInfo) {
    return text;
  }

  const content = text.substring(contentStart, endInfo.pos);
  const { ifContent, elseContent } = splitConditionalContent(content);

  const value = getValue(condition, data);
  const conditionTruthy = isTruthy(value);
  const replacement = conditionTruthy ? ifContent : elseContent;

  return replaceBlock(text, startPos, endInfo, replacement);
}

/**
 * Split conditional content into if and else parts
 * @param {string} content - Content between {{@if}} and {{/@if}}
 * @returns {{ifContent: string, elseContent: string}} Split content
 */
function splitConditionalContent(content) {
  const elseIndex = findElseAtLevel(content);

  if (elseIndex >= 0) {
    return {
      ifContent: content.substring(0, elseIndex),
      elseContent: content.substring(elseIndex + '{{@else}}'.length)
    };
  }

  return {
    ifContent: content,
    elseContent: ''
  };
}

/**
 * Find {{@else}} at the current nesting level (not inside nested conditionals)
 * @param {string} content - Content to search
 * @returns {number} Index of {{@else}} or -1 if not found
 */
function findElseAtLevel(content) {
  let depth = 0;
  let i = 0;

  while (i < content.length) {
    if (content.substring(i).startsWith('{{@if')) {
      depth++;
      i += 5;
    } else if (content.substring(i).startsWith('{{/@if}}')) {
      depth--;
      i += 8;
    } else if (depth === 0 && content.substring(i).startsWith('{{@else}}')) {
      return i;
    } else {
      i++;
    }
  }

  return -1;
}

/**
 * Process loop blocks {{@each items}}...{{/@each}}
 * Handles nested loops by finding matching pairs
 * @param {string} text - Text to process
 * @param {object} data - Data containing arrays to iterate
 * @returns {string} Processed text
 */
export function processLoops(text, data) {
  let result = text;
  let changed = true;
  let iterations = 0;

  // Process innermost loops first by repeating until no more changes
  while (changed && iterations < MAX_ITERATIONS) {
    const before = result;
    result = processSingleLoopPass(result, data);
    changed = before !== result;
    iterations++;
  }

  if (iterations >= MAX_ITERATIONS) {
    logWarning('Max iterations reached in processLoops - possible malformed template');
  }

  return result;
}

/**
 * Process one level of loops
 * @param {string} text - Text to process
 * @param {object} data - Data containing arrays to iterate
 * @returns {string} Processed text
 */
function processSingleLoopPass(text, data) {
  let result = text;

  // Find first {{@each ...}}
  const openMatch = text.match(/\{\{@each\s+([^}]+)\}\}/);
  if (!openMatch) {
    return result;
  }

  const arrayName = openMatch[1].trim();
  const startPos = openMatch.index;
  const contentStart = startPos + openMatch[0].length;

  // Find matching {{/@each}} by counting nesting
  const endInfo = findMatchingClose(result, contentStart, '{{@each', '{{/@each}}');
  if (!endInfo) {
    return result;
  }

  const loopContent = result.substring(contentStart, endInfo.pos);
  const array = getValue(arrayName, data);

  // Handle missing or non-array values
  if (!Array.isArray(array)) {
    result = `${result.substring(0, startPos)}${result.substring(endInfo.pos + endInfo.closeTag.length)}`;
    return result;
  }

  // Render each item
  const rendered = array.map((item, index) => {
    // Create context with item properties and @index
    const loopData = {
      ...data,
      ...item,
      '@index': index
    };

    // Recursively process nested constructs
    let itemResult = loopContent;
    itemResult = processConditionals(itemResult, loopData);
    itemResult = processLoops(itemResult, loopData);
    itemResult = replaceVariables(itemResult, loopData);

    return itemResult;
  }).join('');

  // Replace this loop
  return replaceBlock(result, startPos, endInfo, rendered);
}

/**
 * Find matching closing tag by counting nesting depth
 * @param {string} text - Text to search
 * @param {number} startPos - Position to start searching from
 * @param {string} openTag - Opening tag to match
 * @param {string} closeTag - Closing tag to find
 * @returns {{pos: number, closeTag: string}|null} Position and tag info, or null if not found
 */
function findMatchingClose(text, startPos, openTag, closeTag) {
  let depth = 1;
  let i = startPos;

  while (i < text.length && depth > 0) {
    if (text.substring(i).startsWith(openTag)) {
      depth++;
      i += openTag.length;
    } else if (text.substring(i).startsWith(closeTag)) {
      depth--;
      if (depth === 0) {
        return { pos: i, closeTag };
      }
      i += closeTag.length;
    } else {
      i++;
    }
  }

  return null; // No matching close found
}

/**
 * Replace a block in the text
 * @param {string} text - Original text
 * @param {number} startPos - Start position of block
 * @param {{pos: number, closeTag: string}} endInfo - End position info
 * @param {string} replacement - Replacement text
 * @returns {string} Text with block replaced
 */
function replaceBlock(text, startPos, endInfo, replacement) {
  return text.substring(0, startPos) + replacement + text.substring(endInfo.pos + endInfo.closeTag.length);
}
