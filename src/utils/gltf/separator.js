import { WebIO } from '@gltf-transform/core';

/**
 * Creates a default grey PBR material
 * @param {Document} document - The gltf-transform document
 * @returns {Material} The created grey material
 */
function createGreyMaterial(document) {
  const material = document.createMaterial('IsolatedGreyMaterial');

  // Set grey color with PBR properties
  material.setBaseColorFactor([0.25, 0.25, 0.25, 1.0]); // Mid grey, fully opaque
  material.setMetallicFactor(0.0);  // No metallic
  material.setRoughnessFactor(0.25); // Medium roughness

  return material;
}

/**
 * Finds a mesh in the document by its ID
 * @param {Document} document - The gltf-transform document
 * @param {string} meshId - The mesh ID (format: 'mesh-N')
 * @returns {Mesh|null} The found mesh or null
 */
function findMeshById(document, meshId) {
  // Extract the numeric index from the ID (e.g., 'mesh-3' -> 3)
  const meshIndex = parseInt(meshId.split('-')[1], 10);

  const meshes = document.getRoot().listMeshes();
  return meshes[meshIndex] || null;
}

/**
 * Creates an isolated GLTF document containing only the specified mesh
 * @param {Document} sourceDocument - The original gltf-transform document
 * @param {string} meshId - The mesh ID to isolate
 * @param {boolean} useGreyMaterial - Whether to apply grey material override
 * @returns {Document} A new document with only the isolated mesh
 */
function buildIsolatedDocument(sourceDocument, meshId, useGreyMaterial = true) {
  // Create a new document for the isolated mesh
  const isolatedDoc = new sourceDocument.constructor();

  // Copy the asset metadata
  const sourceAsset = sourceDocument.getRoot().getAsset();
  const targetAsset = isolatedDoc.getRoot().getAsset();

  // Copy asset metadata if present
  if (sourceAsset.generator) {
    targetAsset.generator = sourceAsset.generator;
  }
  if (sourceAsset.version) {
    targetAsset.version = sourceAsset.version;
  }
  if (sourceAsset.copyright) {
    targetAsset.copyright = sourceAsset.copyright;
  }

  // Find the source mesh
  const sourceMesh = findMeshById(sourceDocument, meshId);
  if (!sourceMesh) {
    throw new Error(`Mesh with ID ${meshId} not found`);
  }

  // Create a buffer for the geometry data
  const buffer = isolatedDoc.createBuffer('isolated-buffer');
  isolatedDoc.getRoot().listBuffers().push(buffer);

  // Create grey material first if needed
  let greyMaterial = null;
  if (useGreyMaterial) {
    greyMaterial = createGreyMaterial(isolatedDoc);
    isolatedDoc.getRoot().listMaterials().push(greyMaterial);
  }

  // Create a new mesh in the isolated document
  const clonedMesh = isolatedDoc.createMesh(sourceMesh.getName());

  // Clone each primitive individually
  const sourcePrimitives = sourceMesh.listPrimitives();
  
  sourcePrimitives.forEach((sourcePrim) => {
    // Create a new primitive in the isolated document
    const clonedPrim = isolatedDoc.createPrimitive();
    
    // Copy geometry attributes
    const attributes = ['POSITION', 'NORMAL', 'TEXCOORD_0', 'TEXCOORD_1', 'COLOR_0', 'TANGENT'];
    attributes.forEach((attr) => {
      const sourceAccessor = sourcePrim.getAttribute(attr);
      if (sourceAccessor) {
        // Get the source array data
        const sourceArray = sourceAccessor.getArray();
        if (sourceArray) {
          // Create a new accessor in the isolated document with the same data
          const clonedAccessor = isolatedDoc.createAccessor()
            .setType(sourceAccessor.getType())
            .setArray(sourceArray)
            .setNormalized(sourceAccessor.getNormalized());
          
          isolatedDoc.getRoot().listAccessors().push(clonedAccessor);
          clonedPrim.setAttribute(attr, clonedAccessor);
        }
      }
    });

    // Copy indices if present
    const sourceIndices = sourcePrim.getIndices();
    if (sourceIndices) {
      const indicesArray = sourceIndices.getArray();
      if (indicesArray) {
        // Create a new indices accessor in the isolated document
        const clonedIndices = isolatedDoc.createAccessor()
          .setType(sourceIndices.getType())
          .setArray(indicesArray);
        
        isolatedDoc.getRoot().listAccessors().push(clonedIndices);
        clonedPrim.setIndices(clonedIndices);
      }
    }

    // Copy mode
    clonedPrim.setMode(sourcePrim.getMode());

    // Handle material
    if (useGreyMaterial) {
      clonedPrim.setMaterial(greyMaterial);
    } else {
      // Clone the original material
      const sourceMaterial = sourcePrim.getMaterial();
      if (sourceMaterial) {
        const clonedMaterial = sourceMaterial.clone();
        isolatedDoc.getRoot().listMaterials().push(clonedMaterial);
        clonedPrim.setMaterial(clonedMaterial);
      }
    }

    // Add the primitive to the mesh
    clonedMesh.addPrimitive(clonedPrim);
  });

  // Add the mesh to the document root
  isolatedDoc.getRoot().listMeshes().push(clonedMesh);

  // Create a scene with a single node containing the mesh
  const scene = isolatedDoc.createScene('IsolatedScene');
  const node = isolatedDoc.createNode(`IsolatedNode_${meshId}`);
  node.setMesh(clonedMesh);
  scene.addChild(node);

  // Set as default scene
  isolatedDoc.getRoot().setDefaultScene(scene);

  return isolatedDoc;
}
/**
 * Exports an isolated mesh as a GLB blob URL
 * @param {Document} sourceDocument - The original gltf-transform document
 * @param {string} meshId - The mesh ID to isolate
 * @param {boolean} useGreyMaterial - Whether to apply grey material override
 * @returns {Promise<string>} A blob URL for the isolated GLB file
 */
export async function exportIsolatedGLB(sourceDocument, meshId, useGreyMaterial = true) {
  try {
    // Build the isolated document
    const isolatedDoc = buildIsolatedDocument(sourceDocument, meshId, useGreyMaterial);

    // Export to GLB binary
    const io = new WebIO();
    const glbBuffer = await io.writeBinary(isolatedDoc);

    // Create a blob and blob URL
    const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  } catch (error) {
    console.error('Error exporting isolated mesh:', error);
    throw error;
  }
}

/**
 * Cleans up a blob URL to free memory
 * @param {string} blobUrl - The blob URL to revoke
 */
export function cleanupBlobUrl(blobUrl) {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}
