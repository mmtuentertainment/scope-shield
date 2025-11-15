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

import { processConditionals, processLoops } from './TemplateProcessor.js';
import { replaceVariables } from './TemplateHelpers.js';

export class TemplateEngine {
  /**
   * Render a template with provided data
   * @param {string} template - Template string with {{variables}}
   * @param {object} data - Data object for variable replacement
   * @returns {string} Rendered template
   * @throws {TypeError} If template is not a string
   */
  render(template, data) {
    // Validate input types
    if (template !== undefined && template !== null && typeof template !== 'string') {
      throw new TypeError('Template must be a string');
    }

    if (!template) {
      return '';
    }

    // Normalize data
    const safeData = data || {};

    try {
      // Process in order: conditionals -> loops -> variables
      let result = template;
      result = processConditionals(result, safeData);
      result = processLoops(result, safeData);
      result = replaceVariables(result, safeData);

      return result;
    } catch (error) {
      // If rendering fails, return original template to avoid data loss
      console.error('[ScopeShield] Template rendering failed:', error);
      return template;
    }
  }
}
