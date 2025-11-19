/**
 * Background service worker for ScopeShield
 * Handles notifications, badge updates, and message passing
 */

import { getUnacknowledgedCount } from '../utils/storage.js';
import { logError, logWarning } from '../lib/utils/Logger.js';

// Performance metrics storage with memory leak protection
// Limits: Keep max 100 metrics, trim to 50 when exceeded
const MAX_METRICS = 100;
const METRICS_TRIM_SIZE = 50;
const performanceMetrics = [];

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SCOPE_CREEP_DETECTED':
      handleScopeCreepDetection(message.event);
      break;

    case 'UPDATE_BADGE':
      updateBadgeCount(message.count);
      break;

    case 'GET_BADGE_COUNT':
      getUnacknowledgedCount().then(count => {
        sendResponse({ count });
      });
      return true; // Will respond asynchronously

    case 'PERFORMANCE_METRIC':
      recordPerformanceMetric(message);
      break;

    default:
      console.log('[ScopeShield] Unknown message type:', message.type);
  }
});

/**
 * Handle scope creep detection
 * @param {Object} event - Detection event
 */
async function handleScopeCreepDetection(event) {
  // Send notification
  await sendNotification(event);

  // Update badge
  await updateBadge();
}

/**
 * Send browser notification (T036)
 * @param {Object} event - Detection event
 */
async function sendNotification(event) {
  try {
    // Validate required fields
    if (!event || !event.detectedText || !event.id) {
      logWarning('Invalid event data for notification', event);
      return;
    }

    // Create notification with confidence-based messaging
    const triggerWeight = Number.isFinite(event.triggerWeight) ? event.triggerWeight : 0;
    const confidenceText = triggerWeight >= 8 ? 'High confidence' :
                          triggerWeight >= 5 ? 'Medium confidence' : 'Low confidence';

    // Safe string handling
    const senderName = event.senderName || event.sender || 'Unknown sender';
    const detectedText = String(event.detectedText).substring(0, 50);
    const triggerWord = event.triggerWord || 'Unknown trigger';

    const notificationOptions = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('/assets/icons/icon128.png'),
      title: 'ScopeShield: Scope Creep Detected',
      message: `${senderName}: "${detectedText}..."`,
      contextMessage: `${confidenceText} • ${triggerWord}`,
      priority: triggerWeight >= 8 ? 2 : 1,
      requireInteraction: triggerWeight >= 8,
      buttons: [
        { title: 'View Details' },
        { title: 'Dismiss' }
      ]
    };

    await chrome.notifications.create(event.id, notificationOptions);
    console.log(`[ScopeShield] Notification sent for event: ${event.id}`);
  } catch (error) {
    logError('Failed to send notification', error);
  }
}

/**
 * Update extension badge with unacknowledged count
 */
async function updateBadge() {
  try {
    const count = await getUnacknowledgedCount();
    await updateBadgeCount(count);
  } catch (error) {
    logError('Failed to update badge', error);
  }
}

/**
 * Set badge text and color
 * @param {number} count - Number to display
 */
async function updateBadgeCount(count) {
  try {
    // Set badge text
    await chrome.action.setBadgeText({
      text: count > 0 ? String(count) : ''
    });

    // Set badge color (amber)
    await chrome.action.setBadgeBackgroundColor({
      color: '#FFA000'
    });

    console.log(`[ScopeShield] Badge updated: ${count}`);
  } catch (error) {
    logError('Failed to set badge', error);
  }
}

/**
 * Handle notification clicks (T037)
 */
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open popup in new tab (chrome.action.openPopup() not allowed from notifications in MV3)
  chrome.tabs.create({
    url: chrome.runtime.getURL('src/popup/popup.html')
  });

  // Clear notification
  chrome.notifications.clear(notificationId);
});

/**
 * Handle notification button clicks
 */
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // "View Details" button - open in new tab (MV3 restriction)
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/popup/popup.html')
    });
  }

  // Clear notification for both buttons
  chrome.notifications.clear(notificationId);
});

/**
 * Initialize on install/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[ScopeShield] Extension installed/updated:', details.reason);

  // Initialize badge
  updateBadge();

  // Set up context menus (future feature)
  // setupContextMenus();
});

/**
 * Handle extension startup
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[ScopeShield] Extension started');

  // Update badge on startup
  updateBadge();
});

/**
 * Record performance metrics
 * @param {Object} metric - Performance metric data
 */
function recordPerformanceMetric(metric) {
  performanceMetrics.push({
    metric: metric.metric,
    value: metric.value,
    timestamp: Date.now(),
    messageCount: metric.messageCount || 1
  });

  // Calculate p95 if we have enough data
  if (performanceMetrics.length >= 20) {
    const sorted = [...performanceMetrics]
      .filter(m => m.metric === metric.metric)
      .sort((a, b) => a.value - b.value);

    if (sorted.length > 0) {
      const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
      const p95 = sorted[p95Index].value;
      console.log(`[ScopeShield] ${metric.metric} p95: ${p95.toFixed(2)}ms`);

      // Warn if performance budget exceeded
      if (metric.metric === 'detection_latency' && p95 > 500) {
        logWarning(`Detection latency exceeds budget: ${p95.toFixed(2)}ms > 500ms`);
      }
    }
  }

  // Memory leak protection: Trim metrics array when it exceeds MAX_METRICS
  if (performanceMetrics.length > MAX_METRICS) {
    const metricsToRemove = performanceMetrics.length - METRICS_TRIM_SIZE;
    performanceMetrics.splice(0, metricsToRemove);
    console.log(`[ScopeShield] Trimmed ${metricsToRemove} old metrics (keeping ${METRICS_TRIM_SIZE})`);
  }
}

/**
 * Export performance metrics (for debugging)
 */
globalThis.getScopeShieldMetrics = () => {
  return {
    metrics: performanceMetrics,
    summary: {
      detectionLatency: calculateMetricSummary('detection_latency'),
      highlightLatency: calculateMetricSummary('highlight_latency')
    }
  };
};

/**
 * Calculate metric summary (min, max, avg, p95)
 * @param {string} metricName - Name of metric
 * @returns {Object} Metric summary
 */
function calculateMetricSummary(metricName) {
  const metrics = performanceMetrics.filter(m => m.metric === metricName);
  if (metrics.length === 0) return null;

  const values = metrics.map(m => m.value);
  const sorted = [...values].sort((a, b) => a - b);

  return {
    count: metrics.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    p95: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)]
  };
}