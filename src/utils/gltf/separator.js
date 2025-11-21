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
 * Copies a texture from source document to target document
 * @param {Document} targetDoc - The target gltf-transform document
 * @param {Texture} sourceTexture - The source texture to copy
 * @returns {Texture} The copied texture in the target document
 */
function copyTexture(targetDoc, sourceTexture) {
  // Create a new texture
  const clonedTexture = targetDoc.createTexture(sourceTexture.getName());

  // Copy the image data
  const sourceImage = sourceTexture.getImage();
  if (sourceImage) {
    clonedTexture.setImage(sourceImage);
    const mimeType = sourceTexture.getMimeType();
    if (mimeType) {
      clonedTexture.setMimeType(mimeType);
    }
  }

  // Try to copy texture sampler settings if they exist
  // Note: Some texture objects might not have these methods
  try {
    if (typeof sourceTexture.getMagFilter === 'function') {
      const magFilter = sourceTexture.getMagFilter();
      if (magFilter !== null && magFilter !== undefined) {
        clonedTexture.setMagFilter(magFilter);
      }
    }

    if (typeof sourceTexture.getMinFilter === 'function') {
      const minFilter = sourceTexture.getMinFilter();
      if (minFilter !== null && minFilter !== undefined) {
        clonedTexture.setMinFilter(minFilter);
      }
    }

    if (typeof sourceTexture.getWrapS === 'function') {
      const wrapS = sourceTexture.getWrapS();
      if (wrapS !== null && wrapS !== undefined) {
        clonedTexture.setWrapS(wrapS);
      }
    }

    if (typeof sourceTexture.getWrapT === 'function') {
      const wrapT = sourceTexture.getWrapT();
      if (wrapT !== null && wrapT !== undefined) {
        clonedTexture.setWrapT(wrapT);
      }
    }
  } catch (error) {
    // Silently ignore sampler copy errors
    console.warn('Could not copy texture sampler settings:', error);
  }

  return clonedTexture;
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
      // Copy the original material manually (can't use clone across documents)
      const sourceMaterial = sourcePrim.getMaterial();
      if (sourceMaterial) {
        const clonedMaterial = isolatedDoc.createMaterial(sourceMaterial.getName());

        // Copy basic PBR properties
        clonedMaterial.setBaseColorFactor(sourceMaterial.getBaseColorFactor());
        clonedMaterial.setMetallicFactor(sourceMaterial.getMetallicFactor());
        clonedMaterial.setRoughnessFactor(sourceMaterial.getRoughnessFactor());
        clonedMaterial.setEmissiveFactor(sourceMaterial.getEmissiveFactor());
        clonedMaterial.setAlphaMode(sourceMaterial.getAlphaMode());
        clonedMaterial.setAlphaCutoff(sourceMaterial.getAlphaCutoff());
        clonedMaterial.setDoubleSided(sourceMaterial.getDoubleSided());

        // Copy textures if present
        const baseColorTexture = sourceMaterial.getBaseColorTexture();
        if (baseColorTexture) {
          const textureInfo = sourceMaterial.getBaseColorTextureInfo();
          const clonedTexture = copyTexture(isolatedDoc, baseColorTexture);
          clonedMaterial.setBaseColorTexture(clonedTexture);
          if (textureInfo && typeof textureInfo.getTexCoord === 'function') {
            clonedMaterial.getBaseColorTextureInfo()
              .setTexCoord(textureInfo.getTexCoord());
          }
        }

        const metallicRoughnessTexture = sourceMaterial.getMetallicRoughnessTexture();
        if (metallicRoughnessTexture) {
          const textureInfo = sourceMaterial.getMetallicRoughnessTextureInfo();
          const clonedTexture = copyTexture(isolatedDoc, metallicRoughnessTexture);
          clonedMaterial.setMetallicRoughnessTexture(clonedTexture);
          if (textureInfo && typeof textureInfo.getTexCoord === 'function') {
            clonedMaterial.getMetallicRoughnessTextureInfo()
              .setTexCoord(textureInfo.getTexCoord());
          }
        }

        const normalTexture = sourceMaterial.getNormalTexture();
        if (normalTexture) {
          const textureInfo = sourceMaterial.getNormalTextureInfo();
          const clonedTexture = copyTexture(isolatedDoc, normalTexture);
          clonedMaterial.setNormalTexture(clonedTexture);
          if (textureInfo) {
            const clonedInfo = clonedMaterial.getNormalTextureInfo();
            if (typeof textureInfo.getTexCoord === 'function') {
              clonedInfo.setTexCoord(textureInfo.getTexCoord());
            }
            if (typeof textureInfo.getScale === 'function') {
              clonedInfo.setScale(textureInfo.getScale());
            }
          }
        }

        const occlusionTexture = sourceMaterial.getOcclusionTexture();
        if (occlusionTexture) {
          const textureInfo = sourceMaterial.getOcclusionTextureInfo();
          const clonedTexture = copyTexture(isolatedDoc, occlusionTexture);
          clonedMaterial.setOcclusionTexture(clonedTexture);
          if (textureInfo) {
            const clonedInfo = clonedMaterial.getOcclusionTextureInfo();
            if (typeof textureInfo.getTexCoord === 'function') {
              clonedInfo.setTexCoord(textureInfo.getTexCoord());
            }
            if (typeof textureInfo.getStrength === 'function') {
              clonedInfo.setStrength(textureInfo.getStrength());
            }
          }
        }

        const emissiveTexture = sourceMaterial.getEmissiveTexture();
        if (emissiveTexture) {
          const textureInfo = sourceMaterial.getEmissiveTextureInfo();
          const clonedTexture = copyTexture(isolatedDoc, emissiveTexture);
          clonedMaterial.setEmissiveTexture(clonedTexture);
          if (textureInfo && typeof textureInfo.getTexCoord === 'function') {
            clonedMaterial.getEmissiveTextureInfo()
              .setTexCoord(textureInfo.getTexCoord());
          }
        }

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
