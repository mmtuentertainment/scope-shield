/**
 * Template Engine for Change Order Generation
 *
 * Provides string interpolation for professional-v1.html template.
 * Handles placeholder replacement, array conversion to lists, and template caching.
 *
 * @module TemplateEngine
 */

class TemplateEngine {
  constructor() {
    /**
     * In-memory cache for loaded template
     * @private
     */
    this._templateCache = null;
  }

  /**
   * Load template from file (with caching)
   * @private
   * @returns {Promise<string>} Template HTML content
   */
  async _loadTemplate() {
    if (this._templateCache) {
      return this._templateCache;
    }

    try {
      const templatePath = chrome.runtime.getURL('assets/templates/professional-v1.html');
      const response = await fetch(templatePath);

      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
      }

      this._templateCache = await response.text();
      return this._templateCache;
    } catch (error) {
      console.error('[TemplateEngine] Error loading template:', error);
      throw new Error('Template loading failed: ' + error.message);
    }
  }

  /**
   * Convert array to HTML bulleted list
   * @private
   * @param {Array<string>} items - Array of items to convert
   * @returns {string} HTML bulleted list
   */
  _arrayToBulletedList(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<p class="empty-placeholder">No changes specified</p>';
    }

    const listItems = items
      .map(item => `<li>${this._escapeHtml(String(item))}</li>`)
      .join('\n      ');

    return `<ul>\n      ${listItems}\n    </ul>`;
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Replace placeholders in template with actual values
   * @param {string} template - Template HTML
   * @param {Object} values - Key-value pairs for replacement
   * @returns {string} Interpolated HTML
   */
  _replacePlaceholders(template, values) {
    let result = template;

    // Replace all {{placeholder}} patterns
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (!(key in values)) {
        // Missing placeholder: return empty string
        return '';
      }

      const value = values[key];

      // Handle array values (convert to bulleted list)
      if (Array.isArray(value)) {
        return this._arrayToBulletedList(value);
      }

      // Handle null/undefined
      if (value == null) {
        return '';
      }

      // Handle regular string values (escape for security)
      return this._escapeHtml(String(value));
    });

    return result;
  }

  /**
   * Interpolate template with provided values
   *
   * Replaces {{placeholder}} patterns with actual values.
   * - Simple values: Direct string replacement
   * - Arrays: Converted to bulleted HTML lists
   * - Missing placeholders: Replaced with empty string
   *
   * @param {Object} values - Key-value pairs for template interpolation
   * @param {string} [values.changeOrderNumber] - Change order number (e.g., "#001")
   * @param {string} [values.date] - Document date (ISO or formatted)
   * @param {string} [values.clientName] - Client's name
   * @param {string} [values.freelancerName] - Freelancer's name
   * @param {string} [values.originalScope] - Original project scope
   * @param {Array<string>|string} [values.requestedChanges] - Requested changes (array or string)
   * @param {string} [values.costEstimate] - Cost estimate (e.g., "$1,200")
   * @param {string} [values.revisedTimeline] - Revised timeline
   * @param {string} [values.paymentTerms] - Payment terms
   * @param {string} [values.additionalNotes] - Additional notes
   * @returns {Promise<string>} Interpolated HTML document
   * @throws {Error} If template loading fails
   *
   * @example
   * const engine = new TemplateEngine();
   * const html = await engine.interpolate({
   *   changeOrderNumber: '#001',
   *   date: '2025-11-12',
   *   clientName: 'Acme Corp',
   *   freelancerName: 'John Doe',
   *   requestedChanges: ['Add user authentication', 'Implement dark mode'],
   *   costEstimate: '$2,400'
   * });
   */
  async interpolate(values = {}) {
    try {
      const template = await this._loadTemplate();
      return this._replacePlaceholders(template, values);
    } catch (error) {
      console.error('[TemplateEngine] Interpolation error:', error);
      throw error;
    }
  }

  /**
   * Clear template cache (useful for testing or hot-reloading)
   */
  clearCache() {
    this._templateCache = null;
  }
}

// Export singleton instance
const templateEngineInstance = new TemplateEngine();
export default templateEngineInstance;

// Export class for testing
export { TemplateEngine };
