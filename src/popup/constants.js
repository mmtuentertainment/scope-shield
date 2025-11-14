/**
 * Popup UI Constants
 *
 * Centralized constants for popup behavior and limits
 *
 * @module PopupConstants
 */

/**
 * Maximum number of detection items to display in popup list
 * Prevents performance degradation with large datasets
 */
export const MAX_DISPLAYED_DETECTIONS = 50;

/**
 * Threshold for marking unacknowledged count as "urgent"
 * Adds visual emphasis when exceeded
 */
export const URGENT_THRESHOLD = 5;

/**
 * Performance target for popup load time (milliseconds)
 * Warn if exceeded
 */
export const LOAD_TIME_TARGET_MS = 200;

/**
 * Debounce delay for UI updates (milliseconds)
 * Prevents excessive re-renders during batch operations
 */
export const UI_UPDATE_DEBOUNCE_MS = 100;

/**
 * Debounce delay for badge updates (milliseconds)
 * Prevents excessive chrome.runtime.sendMessage calls
 */
export const BADGE_UPDATE_DEBOUNCE_MS = 100;
