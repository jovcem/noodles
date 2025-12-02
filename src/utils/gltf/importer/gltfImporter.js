import { WebIO } from '@gltf-transform/core';
import { cacheDocument } from '../gltfExporter';
import { glbToNodes } from '../glbToNodes';
import { createImportResult, URLCleanupTracker } from './importerCommon';

/**
 * Import a GLTF file with external resources (textures, bins)
 * @param {FileList|File[]} files - Array of files including .gltf and resources
 * @returns {Promise<ImportResult>} Import result with model URL, nodes, edges, and scene data
 */
export async function importGLTFWithTextures(files) {
  const urlTracker = new URLCleanupTracker();

  try {
    // Convert FileList to array
    const fileArray = Array.from(files);

    // Find the .gltf file
    const gltfFile = fileArray.find(f => f.name.toLowerCase().endsWith('.gltf'));

    if (!gltfFile) {
      return createImportResult(
        false,
        {},
        'No .gltf file found. Please include a .gltf file in your selection.'
      );
    }

    // Read and parse GLTF JSON
    const gltfText = await gltfFile.text();
    let gltfJson;

    try {
      gltfJson = JSON.parse(gltfText);
    } catch (error) {
      return createImportResult(
        false,
        {},
        `Invalid GLTF file: ${error.message}`
      );
    }

    // Find all referenced resources
    const dependencies = findGLTFDependencies(gltfJson);

    // Build file map (filename → File object)
    const fileMap = buildFileMap(fileArray);

    // Check for missing dependencies (strict mode)
    const missingFiles = dependencies.filter(dep => !fileMap.has(dep));
    if (missingFiles.length > 0) {
      urlTracker.cleanup();
      return createImportResult(
        false,
        {},
        `Missing required files: ${missingFiles.join(', ')}. Please include all referenced textures and buffers.`
      );
    }

    // Create resource resolver for gltf-transform
    const io = new WebIO();
    const resourceResolver = createResourceResolver(fileMap, urlTracker);

    // Parse GLTF with resources
    const document = await io.readJSON({
      json: gltfJson,
      resources: await loadResources(dependencies, fileMap)
    });

    // Cache the document
    cacheDocument(document);

    // Convert document back to GLB for model-viewer
    const glbBuffer = await io.writeBinary(document);

    // Create a File object from the GLB buffer
    const glbFile = new File([glbBuffer], gltfFile.name.replace('.gltf', '.glb'), {
      type: 'model/gltf-binary'
    });

    // Create object URL
    const modelUrl = URL.createObjectURL(glbFile);
    urlTracker.track(modelUrl);

    // Parse and generate graph
    const { nodes, edges, sceneData } = await glbToNodes(glbFile);

    // Return success result
    return createImportResult(true, {
      modelUrl,
      nodes,
      edges,
      sceneData,
      filename: gltfFile.name,
      fileType: 'gltf',
      fileSize: fileArray.reduce((sum, f) => sum + f.size, 0),
      metadata: {
        resourceCount: dependencies.length,
        totalFiles: fileArray.length
      }
    });
  } catch (error) {
    console.error('GLTF import failed:', error);
    urlTracker.cleanup();
    return createImportResult(
      false,
      {},
      `Failed to import GLTF: ${error.message}`
    );
  }
}

/**
 * Find all dependencies referenced in GLTF JSON
 */
function findGLTFDependencies(gltfJson) {
  const deps = new Set();

  // Images
  if (gltfJson.images) {
    gltfJson.images.forEach(img => {
      if (img.uri && !img.uri.startsWith('data:')) {
        // Decode URI components (e.g., %20 -> space)
        deps.add(decodeURIComponent(img.uri));
      }
    });
  }

  // Buffers
  if (gltfJson.buffers) {
    gltfJson.buffers.forEach(buf => {
      if (buf.uri && !buf.uri.startsWith('data:')) {
        deps.add(decodeURIComponent(buf.uri));
      }
    });
  }

  return Array.from(deps);
}

/**
 * Build file map from filename to File object
 */
function buildFileMap(files) {
  const map = new Map();

  files.forEach(file => {
    map.set(file.name, file);
  });

  return map;
}

/**
 * Create resource resolver for gltf-transform
 */
function createResourceResolver(fileMap, urlTracker) {
  return async (uri) => {
    const decodedUri = decodeURIComponent(uri);
    const file = fileMap.get(decodedUri);

    if (!file) {
      throw new Error(`Missing resource file: ${decodedUri}`);
    }

    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  };
}

/**
 * Load all resources as buffers
 */
async function loadResources(dependencies, fileMap) {
  const resources = {};

  for (const dep of dependencies) {
    const file = fileMap.get(dep);
    if (file) {
      const buffer = await file.arrayBuffer();
      resources[dep] = new Uint8Array(buffer);
    }
  }

  return resources;
}
