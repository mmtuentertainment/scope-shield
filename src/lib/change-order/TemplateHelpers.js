/**
 * Template helper utilities for variable replacement and value access
 *
 * @module TemplateHelpers
 */

// Match {{variableName}} and {{@index}} but NOT {{@each...}} or {{@if...}}
const VAR_PATTERN = /\{\{(?!@(?:each|if|else)\b)([^}]+)\}\}/g;

/**
 * Replace simple variables {{variableName}} and {{@index}}
 * @param {string} text - Text to process
 * @param {object} data - Data containing variables
 * @returns {string} Text with variables replaced
 */
export function replaceVariables(text, data) {
  return text.replace(VAR_PATTERN, (match, varName) => {
    const value = getValue(varName.trim(), data);
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get value from data object, supporting nested properties
 * @param {string} path - Property path (e.g., 'user.name')
 * @param {object} data - Data object
 * @returns {*} Value at path, or undefined if not found
 */
export function getValue(path, data) {
  if (typeof path !== 'string' || !path) {
    return undefined;
  }

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
 * @param {*} value - Value to check
 * @returns {boolean} True if value is truthy
 */
export function isTruthy(value) {
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
