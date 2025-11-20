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
import { logError } from '../utils/Logger.js';
import { renderFallback } from './fallbackTemplate.js';
import { showNotification } from '../../popup/components/NotificationManager.js';

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
      // Phase 8 (T370-T374): Enhanced error handling with fallback
      logError('Template rendering failed', error);

      // Show user notification about template error
      try {
        showNotification(
          'template-error',
          'Template error detected. Using simplified format.',
          'warning',
          5000
        );
      } catch (notificationError) {
        // Notification failed (likely popup not open), just log
        logError('Failed to show template error notification', notificationError);
      }

      // Use fallback template
      return renderFallback(safeData);
    }
  }
}
