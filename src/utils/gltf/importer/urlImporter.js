import { importGLBFromFile } from './glbImporter';
import { importGLTFWithTextures } from './gltfImporter';
import { createImportResult, detectFileType } from './importerCommon';

/**
 * Import a model from a URL
 * @param {string} url - URL to fetch the model from
 * @returns {Promise<ImportResult>} Import result with model URL, nodes, edges, and scene data
 */
export async function importFromURL(url) {
  try {
    // Validate URL
    if (!isValidURL(url)) {
      return createImportResult(
        false,
        {},
        'Invalid URL. Please provide a valid HTTP or HTTPS URL.'
      );
    }

    // Fetch the file
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return createImportResult(
          false,
          {},
          'Failed to fetch URL. This might be due to CORS restrictions or network issues.'
        );
      }
      throw error;
    }

    if (!response.ok) {
      return createImportResult(
        false,
        {},
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    // Get the blob
    const blob = await response.blob();

    // Extract filename from URL
    const filename = extractFilenameFromURL(url);

    // Detect file type
    const fileType = detectFileType(filename);

    if (!fileType) {
      return createImportResult(
        false,
        {},
        'Unable to determine file type. URL must end with .glb or .gltf'
      );
    }

    // Create File object
    const file = new File(
      [blob],
      filename,
      { type: blob.type || (fileType === 'glb' ? 'model/gltf-binary' : 'model/gltf+json') }
    );

    // Route to appropriate importer
    if (fileType === 'glb') {
      return await importGLBFromFile(file);
    } else if (fileType === 'gltf') {
      // For GLTF from URL, we can only handle self-contained files
      // or files with embedded data URIs
      return await importGLTFWithTextures([file]);
    }

    return createImportResult(
      false,
      {},
      'Unsupported file type'
    );
  } catch (error) {
    console.error('URL import failed:', error);
    return createImportResult(
      false,
      {},
      `Failed to import from URL: ${error.message}`
    );
  }
}

/**
 * Validate if string is a valid URL
 */
export function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract filename from URL
 */
function extractFilenameFromURL(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();

    if (filename && filename.includes('.')) {
      return filename;
    }

    // If no extension found, try to detect from URL
    if (url.toLowerCase().includes('.glb')) {
      return 'model.glb';
    } else if (url.toLowerCase().includes('.gltf')) {
      return 'model.gltf';
    }

    return 'model.glb';
  } catch {
    return 'model.glb';
  }
}

/**
 * Validate and sanitize URL
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  url = url.trim();

  if (!isValidURL(url)) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  const fileType = detectFileType(extractFilenameFromURL(url));
  if (!fileType) {
    return { isValid: false, error: 'URL must point to a .glb or .gltf file' };
  }

  return { isValid: true, url, fileType };
}
