const VALID_EXTENSIONS = ['.glb', '.gltf'];
const VALID_MIME_TYPES = ['model/gltf-binary', 'model/gltf+json'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validates if a file is a valid GLB/GLTF file
 * @param {File} file - File to validate
 * @returns {{isValid: boolean, error: string|null}}
 */
export function validateGLTFFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file extension
  const hasValidExtension = VALID_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a .glb or .gltf file'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 100MB'
    };
  }

  // Optionally check MIME type (may be empty for some files)
  const hasValidMimeType = VALID_MIME_TYPES.includes(file.type) || file.type === '';

  return { isValid: true, error: null };
}

export { VALID_EXTENSIONS, VALID_MIME_TYPES, MAX_FILE_SIZE };
