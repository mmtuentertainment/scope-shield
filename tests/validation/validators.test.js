/**
 * Tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateUuid,
  validateEmail,
  validateGmailUrl,
  validateWeight,
  validateThreadId,
  validateNonEmptyString,
  validateStringLength,
  validateTimestamp,
  validateBoolean,
  validateMessageId
} from '../../src/validation/validators.js';

describe('validateUuid', () => {
  it('should accept valid UUID v4', () => {
    const result = validateUuid('550e8400-e29b-41d4-a716-446655440000');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept lowercase UUID v4', () => {
    const result = validateUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    expect(result.valid).toBe(true);
  });

  it('should accept uppercase UUID v4', () => {
    const result = validateUuid('F47AC10B-58CC-4372-A567-0E02B2C3D479');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid UUID format', () => {
    const result = validateUuid('invalid-uuid');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('UUID v4');
  });

  it('should reject UUID v1 format', () => {
    const result = validateUuid('550e8400-e29b-11d4-a716-446655440000');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateUuid(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('UUID v4');
  });

  it('should reject undefined', () => {
    const result = validateUuid(undefined);
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateUuid('');
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateUuid(12345).valid).toBe(false);
    expect(validateUuid({}).valid).toBe(false);
    expect(validateUuid([]).valid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept email with subdomain', () => {
    const result = validateEmail('user@mail.example.com');
    expect(result.valid).toBe(true);
  });

  it('should accept email with plus sign', () => {
    const result = validateEmail('user+tag@example.com');
    expect(result.valid).toBe(true);
  });

  it('should reject email without @', () => {
    const result = validateEmail('userexample.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid email');
  });

  it('should reject email without domain', () => {
    const result = validateEmail('user@');
    expect(result.valid).toBe(false);
  });

  it('should reject email without TLD', () => {
    const result = validateEmail('user@example');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateEmail(null);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateEmail(123).valid).toBe(false);
  });
});

describe('validateGmailUrl', () => {
  it('should accept valid Gmail URL', () => {
    const result = validateGmailUrl('https://mail.google.com/mail/u/0/#inbox');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept Gmail URL with thread ID', () => {
    const url = 'https://mail.google.com/mail/u/0/#inbox/18c5f0a1b2d3e4f5';
    const result = validateGmailUrl(url);
    expect(result.valid).toBe(true);
  });

  it('should reject non-Gmail URL', () => {
    const result = validateGmailUrl('https://outlook.com/mail');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Gmail URL');
  });

  it('should reject HTTP (non-HTTPS) Gmail URL', () => {
    const result = validateGmailUrl('http://mail.google.com/mail');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateGmailUrl('');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateGmailUrl(null);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateGmailUrl(123).valid).toBe(false);
  });
});

describe('validateWeight', () => {
  it('should accept weight of 1', () => {
    const result = validateWeight(1);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept weight of 10', () => {
    const result = validateWeight(10);
    expect(result.valid).toBe(true);
  });

  it('should accept weight of 5', () => {
    const result = validateWeight(5);
    expect(result.valid).toBe(true);
  });

  it('should reject weight of 0', () => {
    const result = validateWeight(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('1-10');
  });

  it('should reject weight of 11', () => {
    const result = validateWeight(11);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('1-10');
  });

  it('should reject negative weight', () => {
    const result = validateWeight(-5);
    expect(result.valid).toBe(false);
  });

  it('should reject string number', () => {
    const result = validateWeight('7');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('number');
  });

  it('should reject null', () => {
    const result = validateWeight(null);
    expect(result.valid).toBe(false);
  });

  it('should reject undefined', () => {
    const result = validateWeight(undefined);
    expect(result.valid).toBe(false);
  });

  it('should reject NaN', () => {
    const result = validateWeight(NaN);
    expect(result.valid).toBe(false);
  });
});

describe('validateThreadId', () => {
  it('should accept valid 16-char hex thread ID', () => {
    const result = validateThreadId('18c5f0a1b2d3e4f5');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept uppercase hex thread ID', () => {
    const result = validateThreadId('18C5F0A1B2D3E4F5');
    expect(result.valid).toBe(true);
  });

  it('should reject thread ID with wrong length', () => {
    const result = validateThreadId('18c5f0a1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('16 hex characters');
  });

  it('should reject thread ID with non-hex characters', () => {
    const result = validateThreadId('18c5f0a1b2d3e4fg');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateThreadId('');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateThreadId(null);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateThreadId(123).valid).toBe(false);
  });
});

describe('validateNonEmptyString', () => {
  it('should accept non-empty string', () => {
    const result = validateNonEmptyString('Hello', 'testField');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept string with spaces', () => {
    const result = validateNonEmptyString('Hello World', 'testField');
    expect(result.valid).toBe(true);
  });

  it('should reject empty string', () => {
    const result = validateNonEmptyString('', 'testField');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('testField');
    expect(result.error).toContain('non-empty string');
  });

  it('should reject null', () => {
    const result = validateNonEmptyString(null, 'testField');
    expect(result.valid).toBe(false);
  });

  it('should reject undefined', () => {
    const result = validateNonEmptyString(undefined, 'testField');
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateNonEmptyString(123, 'testField').valid).toBe(false);
    expect(validateNonEmptyString({}, 'testField').valid).toBe(false);
  });

  it('should include field name in error message', () => {
    const result = validateNonEmptyString('', 'myCustomField');
    expect(result.error).toContain('myCustomField');
  });
});

describe('validateStringLength', () => {
  it('should accept string within max length', () => {
    const result = validateStringLength('Hello', 'subject', 10);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept string at exact max length', () => {
    const result = validateStringLength('Hello', 'subject', 5);
    expect(result.valid).toBe(true);
  });

  it('should reject string exceeding max length', () => {
    const result = validateStringLength('Very long text', 'subject', 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('subject');
    expect(result.error).toContain('max 5 chars');
  });

  it('should reject empty string', () => {
    const result = validateStringLength('', 'subject', 10);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject null', () => {
    const result = validateStringLength(null, 'subject', 10);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateStringLength(123, 'subject', 10).valid).toBe(false);
  });

  it('should include field name and max length in error', () => {
    const result = validateStringLength('Too long text here', 'title', 8);
    expect(result.error).toContain('title');
    expect(result.error).toContain('8');
  });
});

describe('validateTimestamp', () => {
  it('should accept valid ISO 8601 timestamp', () => {
    const result = validateTimestamp('2025-11-10T16:00:00.000Z');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept date string', () => {
    const result = validateTimestamp('2025-11-10');
    expect(result.valid).toBe(true);
  });

  it('should accept datetime string without Z', () => {
    const result = validateTimestamp('2025-11-10T16:00:00');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid date string', () => {
    const result = validateTimestamp('not-a-date');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('ISO 8601');
  });

  it('should reject invalid date format', () => {
    const result = validateTimestamp('2025-13-40');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateTimestamp('');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateTimestamp(null);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateTimestamp(123456789).valid).toBe(false);
    expect(validateTimestamp(new Date()).valid).toBe(false);
  });
});

describe('validateBoolean', () => {
  it('should accept true', () => {
    const result = validateBoolean(true, 'acknowledged');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept false', () => {
    const result = validateBoolean(false, 'acknowledged');
    expect(result.valid).toBe(true);
  });

  it('should reject string "true"', () => {
    const result = validateBoolean('true', 'acknowledged');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('boolean');
  });

  it('should reject number 1', () => {
    const result = validateBoolean(1, 'acknowledged');
    expect(result.valid).toBe(false);
  });

  it('should reject number 0', () => {
    const result = validateBoolean(0, 'acknowledged');
    expect(result.valid).toBe(false);
  });

  it('should reject null', () => {
    const result = validateBoolean(null, 'acknowledged');
    expect(result.valid).toBe(false);
  });

  it('should reject undefined', () => {
    const result = validateBoolean(undefined, 'acknowledged');
    expect(result.valid).toBe(false);
  });

  it('should include field name in error message', () => {
    const result = validateBoolean('yes', 'highlighted');
    expect(result.error).toContain('highlighted');
  });
});

describe('validateMessageId', () => {
  it('should accept valid message ID', () => {
    const result = validateMessageId('msg-123456');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept alphanumeric ID', () => {
    const result = validateMessageId('abc123def456');
    expect(result.valid).toBe(true);
  });

  it('should accept ID with special characters', () => {
    const result = validateMessageId('msg_id-2025.11.10');
    expect(result.valid).toBe(true);
  });

  it('should reject empty string', () => {
    const result = validateMessageId('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('messageId');
  });

  it('should reject null', () => {
    const result = validateMessageId(null);
    expect(result.valid).toBe(false);
  });

  it('should reject undefined', () => {
    const result = validateMessageId(undefined);
    expect(result.valid).toBe(false);
  });

  it('should reject non-string types', () => {
    expect(validateMessageId(12345).valid).toBe(false);
    expect(validateMessageId({}).valid).toBe(false);
  });
});
