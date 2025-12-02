/**
 * Common utilities for all GLTF/GLB importers
 */

/**
 * Standard result structure for all importers
 */
export function createImportResult(success, data = {}, error = null) {
  return {
    success,
    modelUrl: data.modelUrl || null,
    nodes: data.nodes || [],
    edges: data.edges || [],
    sceneData: data.sceneData || null,
    error,
    metadata: {
      filename: data.filename || null,
      fileType: data.fileType || null,
      fileSize: data.fileSize || null,
      ...data.metadata
    }
  };
}

/**
 * URL cleanup tracker for managing blob URLs
 */
export class URLCleanupTracker {
  constructor() {
    this.urls = new Set();
  }

  /**
   * Track a URL for cleanup
   */
  track(url) {
    this.urls.add(url);
    return url;
  }

  /**
   * Cleanup all tracked URLs
   */
  cleanup() {
    this.urls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Failed to revoke URL:', url, e);
      }
    });
    this.urls.clear();
  }

  /**
   * Get count of tracked URLs
   */
  get count() {
    return this.urls.size;
  }
}

/**
 * Detect file type from filename
 */
export function detectFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'glb') return 'glb';
  if (ext === 'gltf') return 'gltf';

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
