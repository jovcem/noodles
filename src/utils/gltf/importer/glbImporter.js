import { validateGLTFFile } from '../../fileValidation';
import { glbToNodes } from '../glbToNodes';
import { createImportResult } from './importerCommon';

/**
 * Import a GLB file and return parsed data
 * @param {File} file - GLB file to import
 * @returns {Promise<ImportResult>} Import result with model URL, nodes, edges, and scene data
 */
export async function importGLBFromFile(file) {
  try {
    // Validate file
    const validation = validateGLTFFile(file);
    if (!validation.isValid) {
      return createImportResult(false, {}, validation.error);
    }

    // Create object URL for the model viewer
    const modelUrl = URL.createObjectURL(file);

    // Parse GLB and generate graph
    const { nodes, edges, sceneData } = await glbToNodes(file);

    // Return success result
    return createImportResult(true, {
      modelUrl,
      nodes,
      edges,
      sceneData,
      filename: file.name,
      fileType: 'glb',
      fileSize: file.size
    });
  } catch (error) {
    console.error('GLB import failed:', error);
    return createImportResult(
      false,
      {},
      `Failed to parse GLB file: ${error.message}`
    );
  }
}
