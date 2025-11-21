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
      baseColor: material.getBaseColorFactor(),
      metallic: material.getMetallicFactor(),
      roughness: material.getRoughnessFactor(),
    };

    sceneData.materials.push(materialData);
  });

  return sceneData;
}
