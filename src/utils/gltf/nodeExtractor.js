/**
 * Extracts texture data from a texture and its texture info
 * @param {Texture} texture - The gltf-transform texture
 * @param {TextureInfo} textureInfo - The texture info with sampling parameters
 * @returns {Object|null} Texture data or null if texture doesn't exist
 */
function extractTextureData(texture, textureInfo) {
  if (!texture) return null;

  // Get the image data and convert to data URL for display
  let imageDataUrl = null;
  const image = texture.getImage();
  const mimeType = texture.getMimeType() || 'image/png';

  if (image && image.length > 0) {
    // Convert Uint8Array to base64 data URL
    const blob = new Blob([image], { type: mimeType });
    imageDataUrl = URL.createObjectURL(blob);
  }

  return {
    name: texture.getName() || 'Unnamed Texture',
    uri: texture.getURI() || null,
    mimeType: mimeType,
    size: texture.getSize() || null,
    imageDataUrl: imageDataUrl,
    // TextureInfo settings
    texCoord: textureInfo?.getTexCoord?.() || 0,
    wrapS: textureInfo?.getWrapS?.() || null,
    wrapT: textureInfo?.getWrapT?.() || null,
    magFilter: textureInfo?.getMagFilter?.() || null,
    minFilter: textureInfo?.getMinFilter?.() || null,
  };
}

export function extractSceneData(document) {
  const sceneData = {
    nodes: [],
    meshes: [],
    materials: [],
  };

  const root = document.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];

  if (!scene) {
    return sceneData;
  }

  // Precompute all arrays once for O(1) lookups
  const allNodes = root.listNodes();
  const allMeshes = root.listMeshes();
  const allMaterials = root.listMaterials();

  // Create index maps for O(1) lookups instead of O(n) indexOf
  const nodeIndexMap = new Map();
  const meshIndexMap = new Map();
  const materialIndexMap = new Map();

  allNodes.forEach((node, index) => nodeIndexMap.set(node, index));
  allMeshes.forEach((mesh, index) => meshIndexMap.set(mesh, index));
  allMaterials.forEach((material, index) => materialIndexMap.set(material, index));

  // Process nodes with O(1) lookups
  allNodes.forEach((node, index) => {
    const nodeData = {
      id: `node-${index}`,
      name: node.getName() || `Node ${index}`,
      type: 'node',
      meshId: null,
      children: [],
    };

    const mesh = node.getMesh();
    if (mesh) {
      const meshIndex = meshIndexMap.get(mesh);
      nodeData.meshId = `mesh-${meshIndex}`;
    }

    const nodeChildren = node.listChildren();
    nodeChildren.forEach((child) => {
      const childIndex = nodeIndexMap.get(child);
      if (childIndex !== undefined) {
        nodeData.children.push(`node-${childIndex}`);
      }
    });

    sceneData.nodes.push(nodeData);
  });

  allMeshes.forEach((mesh, index) => {
    const meshData = {
      id: `mesh-${index}`,
      name: mesh.getName() || `Mesh ${index}`,
      type: 'mesh',
      primitiveCount: mesh.listPrimitives().length,
      materialIds: [],
    };

    const seenMaterials = new Set();
    mesh.listPrimitives().forEach((primitive) => {
      const material = primitive.getMaterial();
      if (material) {
        const materialIndex = materialIndexMap.get(material);
        const materialId = `material-${materialIndex}`;
        if (!seenMaterials.has(materialId)) {
          seenMaterials.add(materialId);
          meshData.materialIds.push(materialId);
        }
      }
    });

    sceneData.meshes.push(meshData);
  });

  allMaterials.forEach((material, index) => {
    const materialData = {
      id: `material-${index}`,
      name: material.getName() || `Material ${index}`,
      type: 'material',

      // Factor values
      baseColorFactor: material.getBaseColorFactor(),
      metallicFactor: material.getMetallicFactor(),
      roughnessFactor: material.getRoughnessFactor(),
      emissiveFactor: material.getEmissiveFactor(),

      // Texture data (only if they exist)
      textures: {
        baseColor: extractTextureData(material.getBaseColorTexture(), material.getBaseColorTextureInfo()),
        metallicRoughness: extractTextureData(material.getMetallicRoughnessTexture(), material.getMetallicRoughnessTextureInfo()),
        normal: extractTextureData(material.getNormalTexture(), material.getNormalTextureInfo()),
        occlusion: extractTextureData(material.getOcclusionTexture(), material.getOcclusionTextureInfo()),
        emissive: extractTextureData(material.getEmissiveTexture(), material.getEmissiveTextureInfo()),
      },

      // Additional properties (only if non-default)
      normalScale: material.getNormalScale && material.getNormalScale() !== 1 ? material.getNormalScale() : null,
      occlusionStrength: material.getOcclusionStrength && material.getOcclusionStrength() !== 1 ? material.getOcclusionStrength() : null,
      alphaMode: material.getAlphaMode(),
      alphaCutoff: material.getAlphaMode() === 'MASK' ? material.getAlphaCutoff() : null,
      doubleSided: material.getDoubleSided(),
    };

    sceneData.materials.push(materialData);
  });

  return sceneData;
}
