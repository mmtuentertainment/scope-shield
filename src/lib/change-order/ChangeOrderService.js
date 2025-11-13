/**
 * Change Order Service
 *
 * Main orchestrator for change order generation.
 * Handles detection event processing, data extraction, history lookup,
 * and change order creation with multi-item bundling support.
 *
 * @module ChangeOrderService
 */

import { ChangeOrder } from './ChangeOrder.js';
import changeOrderHistory from './ChangeOrderHistory.js';
import changeOrderNumbering from './ChangeOrderNumbering.js';
import { formatDateLong } from '../utils/DateFormatter.js';
import { logInfo, logError, logPerformance } from '../utils/Logger.js';
import {
  extractClientInfo,
  extractRequestedChanges
} from './ChangeOrderDataExtractor.js';
import {
  loadFreelancerName,
  loadOriginalScope
} from './ChangeOrderPreFiller.js';
import {
  validateDetectionEvent as validateEvent
} from './DetectionEventValidator.js';

class ChangeOrderServiceClass {
  /**
   * Generate change order from detection event(s)
   *
   * @param {Object|Array<Object>} detectionEventOrEvents - Single detection event or array of events
   * @param {Object} detectionEventOrEvents.sender - Email sender info
   * @param {string} detectionEventOrEvents.sender.name - Client name
   * @param {string} detectionEventOrEvents.sender.email - Client email
   * @param {string} detectionEventOrEvents.detectedText - Detected scope creep text
   * @param {Object} [options] - Generation options
   * @param {string} [options.freelancerName] - Override freelancer name
   * @param {string} [options.originalScope] - Override original scope
   * @returns {Promise<ChangeOrder>} Generated change order instance
   * @throws {Error} If generation fails
   */
  async generate(detectionEventOrEvents, options = {}) {
    const startTime = performance.now();

    try {
      // Normalize to array for consistent handling
      const detectionEvents = Array.isArray(detectionEventOrEvents)
        ? detectionEventOrEvents
        : [detectionEventOrEvents];

      if (detectionEvents.length === 0) {
        throw new Error('At least one detection event is required');
      }

      logInfo('ChangeOrderService.generate: Starting generation', {
        eventCount: detectionEvents.length,
        hasOptions: Object.keys(options).length > 0
      });

      // Extract client information from first event (delegate to extractor)
      const clientInfo = extractClientInfo(detectionEvents[0]);

      // Extract and combine requested changes from all events (delegate to extractor)
      const requestedChanges = extractRequestedChanges(detectionEvents);

      // Load freelancer name from settings or options (delegate to pre-filler)
      const freelancerName = await loadFreelancerName(options);

      // Pre-fill original scope from history (delegate to pre-filler)
      const originalScope = await loadOriginalScope(
        clientInfo.clientEmail,
        options
      );

      // Generate sequential change order number
      const changeOrderNumber = await changeOrderNumbering.getNextNumberForClient(
        clientInfo.clientEmail
      );

      // Get current date
      const dateCreated = formatDateLong(new Date());

      // Create change order instance
      const changeOrder = new ChangeOrder({
        changeOrderNumber,
        clientName: clientInfo.clientName,
        clientEmail: clientInfo.clientEmail,
        freelancerName,
        dateCreated,
        originalScope,
        requestedChanges,
        costEstimate: '$XXX', // Placeholder for pricing calculator
        revisedTimeline: '', // User will fill
        paymentTerms: 'Net 30', // Default
        additionalNotes: '',
        status: 'generated' // Mark as generated (not draft)
      });

      // Validate before saving
      const validation = changeOrder.validate();
      if (!validation.valid) {
        throw new Error(`Change order validation failed: ${validation.errors.join(', ')}`);
      }

      // Save to history
      const saved = await changeOrderHistory.save(changeOrder);
      if (!saved) {
        logError('ChangeOrderService.generate: Failed to save to history');
        // Don't throw - change order is still usable, just not in history
      }

      // Log performance
      const duration = performance.now() - startTime;
      logPerformance('ChangeOrderService.generate', duration);

      if (duration > 5000) {
        logError('ChangeOrderService.generate: Generation exceeded 5s threshold', {
          duration: `${duration.toFixed(0)}ms`,
          threshold: '5000ms'
        });
      }

      logInfo('ChangeOrderService.generate: Generation complete', {
        changeOrderId: changeOrder.id,
        changeOrderNumber: changeOrder.changeOrderNumber,
        clientEmail: clientInfo.clientEmail,
        duration: `${duration.toFixed(0)}ms`
      });

      return changeOrder;
    } catch (error) {
      const duration = performance.now() - startTime;
      logError('ChangeOrderService.generate: Generation failed', {
        error: error.message,
        duration: `${duration.toFixed(0)}ms`
      });
      throw error;
    }
  }

  /**
   * Create manual change order (no detection event)
   *
   * @param {Object} data - Change order data
   * @param {string} data.clientName - Client name
   * @param {string} data.clientEmail - Client email
   * @param {Array<string>} [data.requestedChanges] - Requested changes
   * @param {string} [data.originalScope] - Original scope
   * @returns {Promise<ChangeOrder>} Generated change order instance
   */
  async createManual(data) {
    logInfo('ChangeOrderService.createManual: Creating manual change order', {
      clientEmail: data.clientEmail
    });

    // Create synthetic detection event
    const syntheticEvent = {
      sender: {
        name: data.clientName,
        email: data.clientEmail
      },
      detectedText: data.requestedChanges
        ? data.requestedChanges.join('\n')
        : 'Manual change order request'
    };

    // Generate using standard flow
    return await this.generate(syntheticEvent, {
      originalScope: data.originalScope || ''
    });
  }

  /**
   * Validate detection event structure (delegates to validator)
   * @param {Object} detectionEvent - Detection event to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateDetectionEvent(detectionEvent) {
    return validateEvent(detectionEvent);
  }
}

// Export singleton instance
const ChangeOrderService = new ChangeOrderServiceClass();
export default ChangeOrderService;

// Export class for testing
export { ChangeOrderServiceClass };
