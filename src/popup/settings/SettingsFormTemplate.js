// T048-T052: Settings Form HTML Template

/**
 * Generate settings form HTML template
 * Extracted from SettingsForm.js to maintain 250-line modular standard
 * @returns {string} Form HTML template
 */
export function getFormHTML() {
  return `
      <!-- T048: Freelancer Name Field -->
      <div class="form-group">
        <label for="freelancer-name" class="form-label">
          Your Name <span class="required">*</span>
        </label>
        <input
          type="text"
          id="freelancer-name"
          name="freelancerName"
          class="form-input"
          placeholder="e.g., Jane Doe"
          required
          maxlength="100"
        />
        <span class="form-hint">Used in change order documents</span>
      </div>

      <!-- T049: Hourly Rate Field -->
      <div class="form-group">
        <label for="hourly-rate" class="form-label">
          Hourly Rate (USD)
        </label>
        <input
          type="number"
          id="hourly-rate"
          name="hourlyRate"
          class="form-input"
          placeholder="e.g., 150"
          min="0"
          max="10000"
          step="1"
        />
        <span class="form-hint">Optional. Used for pricing calculator suggestions.</span>
      </div>

      <!-- T050: Default Export Method Dropdown -->
      <div class="form-group">
        <label for="export-method" class="form-label">
          Default Export Method
        </label>
        <select id="export-method" name="defaultExportMethod" class="form-select">
          <option value="clipboard">Copy to Clipboard</option>
          <option value="pdf">Export as PDF</option>
          <option value="text">Export as Text</option>
        </select>
        <span class="form-hint">Default method for exporting change orders</span>
      </div>

      <!-- T051: Auto-Export Enabled Checkbox -->
      <div class="form-group">
        <label class="form-checkbox-label">
          <input
            type="checkbox"
            id="auto-export-enabled"
            name="autoExportEnabled"
            class="form-checkbox"
          />
          <span>Enable auto-export after editing</span>
        </label>
        <span class="form-hint">Automatically export change orders after you finish editing</span>
      </div>

      <!-- T052: Auto-Export Delay Input -->
      <div class="form-group" id="auto-export-delay-group">
        <label for="auto-export-delay" class="form-label">
          Auto-Export Delay (seconds)
        </label>
        <input
          type="number"
          id="auto-export-delay"
          name="autoExportDelay"
          class="form-input"
          min="1"
          max="10"
          step="1"
          value="3"
        />
        <span class="form-hint">Wait time before auto-exporting (1-10 seconds)</span>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="save-settings-btn">
          Save Settings
        </button>
        <button type="button" class="btn btn-secondary" id="cancel-settings-btn">
          Cancel
        </button>
      </div>

      <!-- Validation Errors Container -->
      <div id="validation-errors" class="validation-errors" style="display: none;"></div>
  `;
}
