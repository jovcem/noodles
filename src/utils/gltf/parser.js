import { WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { cacheDocument } from './gltfExporter';

export async function parseGLB(file) {
  try {
    const io = new WebIO().registerExtensions(ALL_EXTENSIONS);

    const arrayBuffer = await file.arrayBuffer();

    const document = await io.readBinary(new Uint8Array(arrayBuffer));

    // Cache the document for later export
    cacheDocument(document);

    return document;
  } catch (error) {
    console.error('Error parsing GLB file:', error);
    throw new Error('Failed to parse GLB file: ' + error.message);
  }
}
