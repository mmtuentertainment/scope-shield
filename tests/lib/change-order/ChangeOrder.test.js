// T032: Basic ChangeOrder entity tests

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeOrder } from '../../../src/lib/change-order/ChangeOrder.js';

describe('ChangeOrder', () => {
  let validChangeOrderData;

  beforeEach(() => {
    validChangeOrderData = {
      changeOrderNumber: '001',
      clientName: 'Acme Corp',
      clientEmail: 'client@acme.com',
      freelancerName: 'Jane Doe',
      originalScope: 'Build landing page',
      requestedChanges: ['Add authentication', 'Add payment gateway'],
      costEstimate: '$1,200',
      revisedTimeline: '5 business days',
      paymentTerms: 'Net 30',
      status: 'generated'
    };
  });

  describe('constructor', () => {
    it('should create ChangeOrder with valid data', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);

      expect(changeOrder.changeOrderNumber).toBe('001');
      expect(changeOrder.clientName).toBe('Acme Corp');
      expect(changeOrder.clientEmail).toBe('client@acme.com');
      expect(changeOrder.freelancerName).toBe('Jane Doe');
      expect(changeOrder.requestedChanges).toHaveLength(2);
      expect(changeOrder.status).toBe('generated');
    });

    it('should generate UUID for new change orders', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);

      expect(changeOrder.id).toBeDefined();
      expect(changeOrder.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should set dateCreated automatically', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);

      expect(changeOrder.dateCreated).toBeDefined();
      expect(changeOrder.dateCreated).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
    });

    it('should use defaults for missing fields', () => {
      const changeOrder = new ChangeOrder({
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        freelancerName: 'Test Freelancer'
      });

      expect(changeOrder.costEstimate).toBe('$XXX');
      expect(changeOrder.paymentTerms).toBe('Net 30');
      expect(changeOrder.status).toBe('draft');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid change order', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);
      const result = changeOrder.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when clientName is missing', () => {
      const changeOrder = new ChangeOrder({
        ...validChangeOrderData,
        clientName: ''
      });
      const result = changeOrder.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client name is required');
    });

    it('should fail validation when clientEmail is missing', () => {
      const changeOrder = new ChangeOrder({
        ...validChangeOrderData,
        clientEmail: ''
      });
      const result = changeOrder.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client email is required');
    });

    it('should fail validation for invalid status', () => {
      const changeOrder = new ChangeOrder({
        ...validChangeOrderData,
        status: 'invalid-status'
      });
      const result = changeOrder.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Status must be one of'))).toBe(true);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);
      const json = changeOrder.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('changeOrderNumber', '001');
      expect(json).toHaveProperty('clientName', 'Acme Corp');
      expect(json.requestedChanges).toHaveLength(2);
    });

    it('should deserialize from JSON', () => {
      const changeOrder1 = new ChangeOrder(validChangeOrderData);
      const json = changeOrder1.toJSON();
      const changeOrder2 = ChangeOrder.fromJSON(json);

      expect(changeOrder2.id).toBe(changeOrder1.id);
      expect(changeOrder2.clientName).toBe(changeOrder1.clientName);
      expect(changeOrder2.requestedChanges).toEqual(changeOrder1.requestedChanges);
    });
  });

  describe('markAsExported', () => {
    it('should mark change order as exported with PDF format', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);
      changeOrder.markAsExported('pdf');

      expect(changeOrder.status).toBe('exported');
      expect(changeOrder.exportFormat).toBe('pdf');
      expect(changeOrder.exportedAt).toBeDefined();
    });
  });

  describe('canExport', () => {
    it('should return true for valid generated change order', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);

      expect(changeOrder.canExport()).toBe(true);
    });

    it('should return false for draft change order', () => {
      const changeOrder = new ChangeOrder({
        ...validChangeOrderData,
        status: 'draft'
      });

      expect(changeOrder.canExport()).toBe(false);
    });

    it('should return false for invalid change order', () => {
      const changeOrder = new ChangeOrder({
        ...validChangeOrderData,
        clientName: '' // Invalid
      });

      expect(changeOrder.canExport()).toBe(false);
    });
  });

  describe('markAsExported', () => {
    it('should validate export format', () => {
      const changeOrder = new ChangeOrder(validChangeOrderData);

      // Valid formats should work
      expect(() => changeOrder.markAsExported('pdf')).not.toThrow();
      expect(() => changeOrder.markAsExported('text')).not.toThrow();
      expect(() => changeOrder.markAsExported('clipboard')).not.toThrow();

      // Invalid format should throw
      expect(() => changeOrder.markAsExported('invalid'))
        .toThrow('Invalid export format: invalid. Must be one of: pdf, text, clipboard');

      expect(() => changeOrder.markAsExported('xml'))
        .toThrow('Invalid export format: xml');
    });
  });
});
