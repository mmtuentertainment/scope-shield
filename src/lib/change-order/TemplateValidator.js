/**
 * Template Validator Service
 *
 * Validates template structure before processing to prevent:
 * - Unclosed conditional/loop blocks
 * - Malformed delimiters
 * - Excessive nesting depth
 * - Circular reference patterns
 *
 * Part of Phase 8 (T370-T374): Template Robustness
 *
 * @module TemplateValidator
 */

import { logWarning } from '../utils/Logger.js';

/**
 * Maximum allowed nesting depth for templates
 * @constant {number}
 */
export const MAX_NESTING_DEPTH = 5;

/**
 * Template validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether template is valid
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 */

/**
 * Template Validator
 * Static service for validating template structure
 */
export class TemplateValidator {
  /**
   * Validate template structure
   * @param {string} template - Template to validate
   * @returns {ValidationResult} Validation result with errors and warnings
   */
  static validate(template) {
    if (!template || typeof template !== 'string') {
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check for unclosed conditional blocks
    const ifResult = this.validateMatchingTags(template, '{{@if', '{{/@if}}');
    if (!ifResult.valid) {
      errors.push(`Unclosed conditional block: ${ifResult.error}`);
    }

    // Check for unclosed loop blocks
    const eachResult = this.validateMatchingTags(template, '{{@each', '{{/@each}}');
    if (!eachResult.valid) {
      errors.push(`Unclosed loop block: ${eachResult.error}`);
    }

    // Check for malformed delimiters
    const delimiterResult = this.validateDelimiters(template);
    if (!delimiterResult.valid) {
      errors.push(...delimiterResult.errors);
    }
    if (delimiterResult.warnings.length > 0) {
      warnings.push(...delimiterResult.warnings);
    }

    // Check nesting depth
    const depthResult = this.validateNestingDepth(template);
    if (!depthResult.valid) {
      errors.push(`Nesting depth exceeds limit (max ${MAX_NESTING_DEPTH} levels): ${depthResult.depth} levels found`);
    }

    // Check for potential circular references
    const circularResult = this.checkCircularReferences(template);
    if (circularResult.length > 0) {
      warnings.push(...circularResult);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate that opening and closing tags match
   * @param {string} text - Text to validate
   * @param {string} openTag - Opening tag to match
   * @param {string} closeTag - Closing tag to find
   * @returns {{valid: boolean, error?: string}} Validation result
   */
  static validateMatchingTags(text, openTag, closeTag) {
    let depth = 0;
    let i = 0;
    let openCount = 0;

    while (i < text.length) {
      if (text.substring(i).startsWith(openTag)) {
        depth++;
        openCount++;
        i += openTag.length;
      } else if (text.substring(i).startsWith(closeTag)) {
        depth--;
        if (depth < 0) {
          return {
            valid: false,
            error: `Closing tag ${closeTag} without matching opening tag`
          };
        }
        i += closeTag.length;
      } else {
        i++;
      }
    }

    if (depth > 0) {
      return {
        valid: false,
        error: `${depth} unclosed ${openTag} tag(s)`
      };
    }

    return { valid: true };
  }

  /**
   * Validate delimiter syntax
   * @param {string} text - Text to validate
   * @returns {{valid: boolean, errors: string[], warnings: string[]}} Validation result
   */
  static validateDelimiters(text) {
    const errors = [];
    const warnings = [];

    // Check for unclosed delimiters
    const openCount = (text.match(/\{\{/g) || []).length;
    const closeCount = (text.match(/\}\}/g) || []).length;

    if (openCount !== closeCount) {
      errors.push(`Mismatched delimiters: ${openCount} opening {{ but ${closeCount} closing }}`);
    }

    // Check for malformed variable references (empty or whitespace-only)
    const emptyVarPattern = /\{\{\s*\}\}/g;
    const emptyMatches = text.match(emptyVarPattern);
    if (emptyMatches) {
      warnings.push(`Found ${emptyMatches.length} empty variable reference(s): {{}}`);
    }

    // Check for potentially invalid variable names (contains special chars)
    const varPattern = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = varPattern.exec(text)) !== null) {
      const varName = match[1].trim();

      // Skip directives (@if, @each, etc.) and closing tags (/@if, /@each)
      if (varName.startsWith('@') || varName.startsWith('/@')) {
        continue;
      }

      // Check for invalid characters (except dots for nested properties)
      if (/[^a-zA-Z0-9_.$]/.test(varName)) {
        warnings.push(`Potentially invalid variable name: "${varName}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate maximum nesting depth
   * @param {string} text - Text to analyze
   * @returns {{valid: boolean, depth: number}} Validation result with max depth
   */
  static validateNestingDepth(text) {
    let maxDepth = 0;
    let currentDepth = 0;
    let i = 0;

    while (i < text.length) {
      // Check for any opening tag
      if (text.substring(i).startsWith('{{@if') || text.substring(i).startsWith('{{@each')) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);

        // Skip to end of tag
        const tagEnd = text.indexOf('}}', i);
        if (tagEnd !== -1) {
          i = tagEnd + 2;
        } else {
          i++;
        }
      }
      // Check for any closing tag
      else if (text.substring(i).startsWith('{{/@if}}') || text.substring(i).startsWith('{{/@each}}')) {
        currentDepth--;
        i += 8; // Length of {{/@if}} or {{/@each}}
      }
      else {
        i++;
      }
    }

    return {
      valid: maxDepth <= MAX_NESTING_DEPTH,
      depth: maxDepth
    };
  }

  /**
   * Check for potential circular reference patterns
   * Detects patterns like {{@each items}}...{{items}}...{{/@each}} which might cause issues
   * @param {string} text - Text to check
   * @returns {string[]} Array of warning messages
   */
  static checkCircularReferences(text) {
    const warnings = [];

    // Find all loop blocks
    const loopPattern = /\{\{@each\s+([^}]+)\}\}([\s\S]*?)\{\{\/@each\}\}/g;
    let match;

    while ((match = loopPattern.exec(text)) !== null) {
      const arrayName = match[1].trim();
      const loopContent = match[2];

      // Check if loop content references the same array variable
      const varPattern = new RegExp(`\\{\\{${arrayName}(?:[.}]|\\s)`, 'g');
      if (varPattern.test(loopContent)) {
        warnings.push(`Loop over "${arrayName}" references itself inside loop body (potential circular reference)`);
      }
    }

    return warnings;
  }

  /**
   * Suggest fixes for common validation errors
   * @param {ValidationResult} validationResult - Result from validate()
   * @returns {string[]} Array of suggested fixes
   */
  static suggestFixes(validationResult) {
    const suggestions = [];

    for (const error of validationResult.errors) {
      if (error.includes('Unclosed conditional block')) {
        suggestions.push('Add missing {{/@if}} closing tag');
      } else if (error.includes('Unclosed loop block')) {
        suggestions.push('Add missing {{/@each}} closing tag');
      } else if (error.includes('Mismatched delimiters')) {
        suggestions.push('Check for missing {{ or }} in variable references');
      } else if (error.includes('Nesting depth exceeds limit')) {
        suggestions.push('Simplify template by reducing nested conditionals and loops');
      }
    }

    return suggestions;
  }
}
