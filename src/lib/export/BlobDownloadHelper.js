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
 * Initiates a browser download for the provided Blob using a temporary link.
 *
 * Creates an object URL for the Blob, appends a hidden anchor with the given filename,
 * programmatically clicks it to start the download, and schedules removal of the anchor
 * and revocation of the object URL.
 *
 * @param {Blob} blob - The Blob to download.
 * @param {string} filename - Suggested filename for the downloaded file.
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