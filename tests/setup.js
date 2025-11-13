// T010: Chrome API mocking setup for tests
import { vi, beforeEach, afterEach } from 'vitest';

// Mock chrome.storage.local with in-memory storage
const mockStorage = {
  data: {}, // In-memory storage

  get: vi.fn((keys, callback) => {
    // Handle different input types
    if (typeof keys === 'function') {
      callback = keys;
      keys = null;
    }

    const result = {};

    if (keys === null) {
      // Return all storage
      Object.assign(result, mockStorage.data);
    } else if (typeof keys === 'string') {
      // Single key
      result[keys] = mockStorage.data[keys];
    } else if (Array.isArray(keys)) {
      // Array of keys
      keys.forEach(key => {
        result[key] = mockStorage.data[key];
      });
    } else if (typeof keys === 'object') {
      // Object with defaults
      Object.keys(keys).forEach(key => {
        result[key] = mockStorage.data[key] !== undefined
          ? mockStorage.data[key]
          : keys[key];
      });
    }

    // Async callback (simulates Chrome API)
    setTimeout(() => callback(result), 0);
  }),

  set: vi.fn((items, callback) => {
    Object.assign(mockStorage.data, items);
    if (callback) setTimeout(() => callback(), 0);
  }),

  remove: vi.fn((keys, callback) => {
    if (typeof keys === 'string') {
      delete mockStorage.data[keys];
    } else if (Array.isArray(keys)) {
      keys.forEach(key => delete mockStorage.data[key]);
    }
    if (callback) setTimeout(() => callback(), 0);
  }),

  clear: vi.fn((callback) => {
    mockStorage.data = {};
    if (callback) setTimeout(() => callback(), 0);
  })
};

// Mock chrome.runtime API
const mockRuntime = {
  lastError: null,
  getManifest: vi.fn(() => ({
    version: '0.2.0',
    name: 'ScopeShield',
    manifest_version: 3
  }))
};

// Stub global chrome object
vi.stubGlobal('chrome', {
  storage: {
    local: mockStorage
  },
  runtime: mockRuntime
});

// Reset storage before each test for isolation
beforeEach(() => {
  mockStorage.data = {};
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
