import { splitRGBChannels } from '../image/channelSplitter.js';

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
  let fileSizeBytes = 0;
  const image = texture.getImage();
  const mimeType = texture.getMimeType() || 'image/png';

  if (image && image.length > 0) {
    // Store the actual file size in bytes
    fileSizeBytes = image.length;

    // Convert Uint8Array to base64 data URL
    const blob = new Blob([image], { type: mimeType });
    imageDataUrl = URL.createObjectURL(blob);
  }

  return {
    name: texture.getName() || 'Unnamed Texture',
    uri: texture.getURI() || null,
    mimeType: mimeType,
    size: texture.getSize() || null,
    fileSizeBytes: fileSizeBytes,
    imageDataUrl: imageDataUrl,
    // TextureInfo settings
    texCoord: textureInfo?.getTexCoord?.() || 0,
    wrapS: textureInfo?.getWrapS?.() || null,
    wrapT: textureInfo?.getWrapT?.() || null,
    magFilter: textureInfo?.getMagFilter?.() || null,
    minFilter: textureInfo?.getMinFilter?.() || null,
  };
}

export async function extractSceneData(document) {
  const sceneData = {
    nodes: [],
    meshes: [],
    materials: [],
    skins: [],
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
  const allSkins = root.listSkins();

  // Create index maps for O(1) lookups instead of O(n) indexOf
  const nodeIndexMap = new Map();
  const meshIndexMap = new Map();
  const materialIndexMap = new Map();
  const skinIndexMap = new Map();

  allNodes.forEach((node, index) => nodeIndexMap.set(node, index));
  allMeshes.forEach((mesh, index) => meshIndexMap.set(mesh, index));
  allMaterials.forEach((material, index) => materialIndexMap.set(material, index));
  allSkins.forEach((skin, index) => skinIndexMap.set(skin, index));

  // Process nodes with O(1) lookups
  allNodes.forEach((node, index) => {
    const nodeData = {
      id: `node-${index}`,
      name: node.getName() || `Node ${index}`,
      type: 'node',
      meshId: null,
      cameraId: null,
      skinId: null,
      children: [],
      subType: 'transform', // Default to transform-only
      // Local space transforms
      translation: node.getTranslation(),
      rotation: node.getRotation(),
      scale: node.getScale(),
      matrix: node.getMatrix(),
      // World space transforms
      worldTranslation: node.getWorldTranslation(),
      worldRotation: node.getWorldRotation(),
      worldScale: node.getWorldScale(),
      worldMatrix: node.getWorldMatrix(),
    };

    const mesh = node.getMesh();
    if (mesh) {
      const meshIndex = meshIndexMap.get(mesh);
      nodeData.meshId = `mesh-${meshIndex}`;
    }

    const camera = node.getCamera();
    if (camera) {
      const cameraIndex = root.listCameras().indexOf(camera);
      nodeData.cameraId = `camera-${cameraIndex}`;
    }

    const skin = node.getSkin();
    if (skin) {
      const skinIndex = skinIndexMap.get(skin);
      nodeData.skinId = `skin-${skinIndex}`;
    }

    // Classify node subtype based on what it references
    if (mesh && skin) {
      nodeData.subType = 'skinned-mesh';
    } else if (mesh) {
      nodeData.subType = 'mesh';
    } else if (camera) {
      nodeData.subType = 'camera';
    } else if (nodeData.children.length > 0 || node.listChildren().length > 0) {
      nodeData.subType = 'transform';
    } else {
      nodeData.subType = 'empty';
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

  for (let index = 0; index < allMaterials.length; index++) {
    const material = allMaterials[index];
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

    // Split metallicRoughness texture into separate channels if it exists
    if (materialData.textures.metallicRoughness?.imageDataUrl) {
      try {
        const channels = await splitRGBChannels(
          materialData.textures.metallicRoughness.imageDataUrl,
          materialData.textures.metallicRoughness.size
        );

        materialData.textures.metallicRoughnessChannels = {
          occlusion: {
            ...materialData.textures.metallicRoughness,
            name: 'Occlusion (R)',
            imageDataUrl: channels.red,
            channel: 'red',
          },
          roughness: {
            ...materialData.textures.metallicRoughness,
            name: 'Roughness (G)',
            imageDataUrl: channels.green,
            channel: 'green',
          },
          metalness: {
            ...materialData.textures.metallicRoughness,
            name: 'Metalness (B)',
            imageDataUrl: channels.blue,
            channel: 'blue',
          },
        };
      } catch (error) {
        console.error('Error splitting metallicRoughness texture:', error);
      }
    }

    sceneData.materials.push(materialData);
  }

  // Extract skins and mark joint nodes
  const jointNodeIds = new Set();

  allSkins.forEach((skin, index) => {
    const skinData = {
      id: `skin-${index}`,
      name: skin.getName() || `Skin ${index}`,
      type: 'skin',
      joints: [],
      skeleton: null,
      inverseBindMatricesCount: null,
    };

    // Extract joint node references
    const joints = skin.listJoints();
    joints.forEach((jointNode) => {
      const jointIndex = nodeIndexMap.get(jointNode);
      if (jointIndex !== undefined) {
        const jointId = `node-${jointIndex}`;
        skinData.joints.push(jointId);
        jointNodeIds.add(jointId);
      }
    });

    // Extract skeleton root (optional)
    const skeleton = skin.getSkeleton();
    if (skeleton) {
      const skeletonIndex = nodeIndexMap.get(skeleton);
      if (skeletonIndex !== undefined) {
        const skeletonId = `node-${skeletonIndex}`;
        skinData.skeleton = skeletonId;
        // Ensure skeleton root is also marked as a joint
        jointNodeIds.add(skeletonId);
      }
    }

    // Get inverse bind matrices count (metadata only)
    const inverseBindMatrices = skin.getInverseBindMatrices();
    if (inverseBindMatrices) {
      skinData.inverseBindMatricesCount = inverseBindMatrices.getCount();
    }

    sceneData.skins.push(skinData);
  });

  // Mark nodes that are joints with a special subtype
  // Also mark all descendants of joints as part of the skeleton
  const skeletonNodeIds = new Set(jointNodeIds);

  // Recursively find all descendants of joint nodes
  function markDescendants(nodeId) {
    const node = sceneData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    node.children.forEach(childId => {
      if (!skeletonNodeIds.has(childId)) {
        skeletonNodeIds.add(childId);
        markDescendants(childId);
      }
    });
  }

  // Mark all joint descendants
  jointNodeIds.forEach(jointId => markDescendants(jointId));

  // This overrides any previous subtype (empty, transform, etc.)
  sceneData.nodes.forEach((nodeData) => {
    if (skeletonNodeIds.has(nodeData.id)) {
      nodeData.subType = 'joint';
    }
  });

  return sceneData;
}
