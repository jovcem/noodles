import { WebIO } from '@gltf-transform/core';

let cachedDocument = null;

/**
 * Caches the loaded GLB document for later export
 * @param {Document} document - The gltf-transform document
 */
export function cacheDocument(document) {
  cachedDocument = document;
}

/**
 * Exports the currently loaded GLB model to GLTF format (JSON + separate bin)
 * Downloads the .gltf file without embedded resources
 */
export async function exportToGLTF() {
  if (!cachedDocument) {
    throw new Error('No document loaded. Please load a GLB file first.');
  }

  const io = new WebIO();

  // Export to GLTF format (JSON)
  // This creates a .gltf file without embedding the binary data
  const jsonDoc = await io.writeJSON(cachedDocument, { format: 'gltf' });

  // Create a blob from the JSON
  const gltfJson = JSON.stringify(jsonDoc.json, null, 2);
  const blob = new Blob([gltfJson], { type: 'model/gltf+json' });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'model.gltf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
