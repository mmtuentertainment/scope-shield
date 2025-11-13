/**
 * Blob Download Helper
 *
 * Utility for triggering browser downloads of Blob objects.
 * Creates temporary download links and handles cleanup.
 *
 * @module BlobDownloadHelper
 */

import { logInfo } from '../utils/Logger.js';

/**
 * Trigger browser download for a blob
 *
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
  // Create object URL for blob
  const url = URL.createObjectURL(blob);

  // Create temporary download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  logInfo('BlobDownloadHelper.downloadBlob: Download triggered', { filename });
}
