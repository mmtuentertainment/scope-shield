/**
 * ScopeShield Options Page Script (Standalone - No Imports)
 * Simplified version for bundling issues
 */

// Storage key (matches SettingsStorage.js)
const STORAGE_KEY = 'scopeshield_settings_v1';

// DOM Elements
const freelancerName = document.getElementById('freelancer-name');
const hourlyRate = document.getElementById('hourly-rate');
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
  freelancerName: '',
  hourlyRate: 0,
  enableNotifications: true,
  enableHighlights: true,
  confidenceThreshold: 5,
  highlightColor: '#FFEB3B',
  highlightOpacity: 0.8,
  defaultExportMethod: 'pdf',
  autoExportEnabled: true,
  autoExportDelay: 5
};

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const settings = result[STORAGE_KEY] || DEFAULT_SETTINGS;

    freelancerName.value = settings.freelancerName || '';
    hourlyRate.value = settings.hourlyRate || '';
    enableNotifications.checked = settings.enableNotifications !== false;
    enableHighlights.checked = settings.enableHighlights !== false;
    confidenceThreshold.value = settings.confidenceThreshold || 5;
    highlightColor.value = settings.highlightColor || '#FFEB3B';
    highlightOpacity.value = settings.highlightOpacity || 0.8;
    opacityValue.textContent = `${Math.round((settings.highlightOpacity || 0.8) * 100)}%`;
    defaultExportMethod.value = settings.defaultExportMethod || 'pdf';
    autoExportEnabled.checked = settings.autoExportEnabled !== false;
    autoExportDelay.value = settings.autoExportDelay || 5;
  } catch (error) {
    console.error('[ScopeShield ERROR] Error loading settings', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  // Validate required fields
  const nameValue = freelancerName.value.trim();
  if (!nameValue) {
    showStatus('Freelancer name is required', 'error');
    freelancerName.focus();
    return;
  }

  const settings = {
    freelancerName: nameValue,
    hourlyRate: Math.max(0, Math.min(10000, hourlyRate.value ? parseFloat(hourlyRate.value) : 0)),
    enableNotifications: enableNotifications.checked,
    enableHighlights: enableHighlights.checked,
    confidenceThreshold: Math.max(1, Math.min(10, parseInt(confidenceThreshold.value))),
    highlightColor: highlightColor.value,
    highlightOpacity: Math.max(0.3, Math.min(1, parseFloat(highlightOpacity.value))),
    defaultExportMethod: defaultExportMethod.value,
    autoExportEnabled: autoExportEnabled.checked,
    autoExportDelay: Math.max(1, Math.min(10, parseInt(autoExportDelay.value))),
    lastUpdated: new Date().toISOString()
  };

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    console.log('[ScopeShield] Settings saved successfully', settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('[ScopeShield ERROR] Error saving settings', error);
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
    await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
    await loadSettings();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('[ScopeShield ERROR] Error resetting settings', error);
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
