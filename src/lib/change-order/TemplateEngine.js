/**
 * Safe template engine for change order generation
 *
 * Features:
 * - Variable replacement: {{variableName}}
 * - Nested properties: {{user.name}}
 * - Array iteration: {{@each items}}...{{/@each}}
 * - Index access: {{@index}} within loops
 * - Conditionals: {{@if condition}}...{{/@if}}
 * - Else blocks: {{@else}}
 *
 * Security:
 * - Uses string replacement only (RegExp-based)
 * - Safe for user-provided data
 * - Handles circular references
 *
 * Performance:
 * - <500ms for 50-item templates
 */
export class TemplateEngine {
  /**
   * Render a template with provided data
   * @param {string} template - Template string with {{variables}}
   * @param {object} data - Data object for variable replacement
   * @returns {string} Rendered template
   */
  render(template, data) {
    if (!template) {
      return '';
    }

    // Normalize data
    const safeData = data || {};

    // Process in order: conditionals -> loops -> variables
    let result = template;
    result = this.processConditionals(result, safeData);
    result = this.processLoops(result, safeData);
    result = this.replaceVariables(result, safeData);

    return result;
  }

  /**
   * Process conditional blocks {{@if condition}}...{{@else}}...{{/@if}}
   * Handles nested conditionals by finding matching pairs
   * @private
   */
  processConditionals(text, data) {
    let result = text;
    let changed = true;

    // Process innermost conditionals first by repeating until no more changes
    while (changed) {
      const before = result;
      result = this.processSingleConditionalPass(result, data);
      changed = before !== result;
    }

    return result;
  }

  /**
   * Process one level of conditionals
   * @private
   */
  processSingleConditionalPass(text, data) {
    const openMatch = text.match(/\{\{@if\s+([^}]+)\}\}/);
    if (!openMatch) {
      return text;
    }

    const condition = openMatch[1].trim();
    const startPos = openMatch.index;
    const contentStart = startPos + openMatch[0].length;

    const endInfo = this.findMatchingClose(text, contentStart, '{{@if', '{{/@if}}');
    if (!endInfo) {
      return text;
    }

    const content = text.substring(contentStart, endInfo.pos);
    const { ifContent, elseContent } = this.splitConditionalContent(content);

    const value = this.getValue(condition, data);
    const isTruthy = this.isTruthy(value);
    const replacement = isTruthy ? ifContent : elseContent;

    return this.replaceBlock(text, startPos, endInfo, replacement);
  }

  /**
   * Split conditional content into if and else parts
   * @private
   */
  splitConditionalContent(content) {
    const elseIndex = this.findElseAtLevel(content);

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
   * Replace a block in the text
   * @private
   */
  replaceBlock(text, startPos, endInfo, replacement) {
    return text.substring(0, startPos) + replacement + text.substring(endInfo.pos + endInfo.closeTag.length);
  }

  /**
   * Find {{@else}} at the current nesting level (not inside nested conditionals)
   * @private
   */
  findElseAtLevel(content) {
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
   * @private
   */
  processLoops(text, data) {
    let result = text;
    let changed = true;

    // Process innermost loops first by repeating until no more changes
    while (changed) {
      const before = result;
      result = this.processSingleLoopPass(result, data);
      changed = before !== result;
    }

    return result;
  }

  /**
   * Process one level of loops
   * @private
   */
  processSingleLoopPass(text, data) {
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
    const endInfo = this.findMatchingClose(result, contentStart, '{{@each', '{{/@each}}');
    if (!endInfo) {
      return result;
    }

    const loopContent = result.substring(contentStart, endInfo.pos);
    const array = this.getValue(arrayName, data);

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
      itemResult = this.processConditionals(itemResult, loopData);
      itemResult = this.processLoops(itemResult, loopData);
      itemResult = this.replaceVariables(itemResult, loopData);

      return itemResult;
    }).join('');

    // Replace this loop
    return this.replaceBlock(result, startPos, endInfo, rendered);
  }

  /**
   * Find matching closing tag by counting nesting depth
   * @private
   */
  findMatchingClose(text, startPos, openTag, closeTag) {
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
   * Replace simple variables {{variableName}} and {{@index}}
   * @private
   */
  replaceVariables(text, data) {
    // Match {{variableName}} and {{@index}} but NOT {{@each...}} or {{@if...}}
    const varPattern = /\{\{(?!@(?:each|if|else)\b)([^}]+)\}\}/g;

    return text.replace(varPattern, (match, varName) => {
      const value = this.getValue(varName.trim(), data);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get value from data object, supporting nested properties
   * @private
   */
  getValue(path, data) {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    // Handle @index special case
    if (path === '@index') {
      return data['@index'];
    }

    // Split path and traverse object
    const parts = path.split('.');
    let value = data;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Determine if value is truthy for conditionals
   * @private
   */
  isTruthy(value) {
    if (value === undefined || value === null) {
      return false;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      return value.length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return true;
  }
}
