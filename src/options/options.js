/**
 * ScopeShield Options Page Script
 */

import { logError } from '../lib/utils/Logger.js';

// DOM Elements
const enableNotifications = document.getElementById('enable-notifications');
const enableHighlights = document.getElementById('enable-highlights');
const confidenceThreshold = document.getElementById('confidence-threshold');
const highlightColor = document.getElementById('highlight-color');
const highlightOpacity = document.getElementById('highlight-opacity');
const opacityValue = document.getElementById('opacity-value');
const defaultExportMethod = document.getElementById('default-export-method');
const autoExportEnabled = document.getElementById('auto-export-enabled');
const autoExportDelay = document.getElementById('auto-export-delay');
const saveBtn = document.getElementById('save');
const resetBtn = document.getElementById('reset');
const statusEl = document.getElementById('status');

// Default settings
const DEFAULT_SETTINGS = {
  enableNotifications: true,
  enableHighlights: true,
  confidenceThreshold: 5,
  highlightColor: '#FFEB3B',
  highlightOpacity: 0.8,
  defaultExportMethod: 'pdf',
  autoExportEnabled: true,
  autoExportDelay: 3
};

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || DEFAULT_SETTINGS;

    enableNotifications.checked = settings.enableNotifications;
    enableHighlights.checked = settings.enableHighlights;
    confidenceThreshold.value = settings.confidenceThreshold;
    highlightColor.value = settings.highlightColor;
    highlightOpacity.value = settings.highlightOpacity;
    opacityValue.textContent = `${Math.round(settings.highlightOpacity * 100)}%`;
    defaultExportMethod.value = settings.defaultExportMethod || 'pdf';
    autoExportEnabled.checked = settings.autoExportEnabled !== false;
    autoExportDelay.value = settings.autoExportDelay || 3;
  } catch (error) {
    logError('Error loading settings', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  const settings = {
    enableNotifications: enableNotifications.checked,
    enableHighlights: enableHighlights.checked,
    confidenceThreshold: parseInt(confidenceThreshold.value),
    highlightColor: highlightColor.value,
    highlightOpacity: parseFloat(highlightOpacity.value),
    defaultExportMethod: defaultExportMethod.value,
    autoExportEnabled: autoExportEnabled.checked,
    autoExportDelay: parseInt(autoExportDelay.value)
  };

  try {
    await chrome.storage.local.set({ settings });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    logError('Error saving settings', error);
    showStatus('Failed to save settings', 'error');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    await loadSettings();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    logError('Error resetting settings', error);
    showStatus('Failed to reset settings', 'error');
  }
}

/**
 * Show status message
 */
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type;
  statusEl.style.display = 'block';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

/**
 * Update opacity display
 */
highlightOpacity.addEventListener('input', () => {
  opacityValue.textContent = `${Math.round(highlightOpacity.value * 100)}%`;
});

// Event listeners
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetSettings);

// Load settings on page load
loadSettings();