/**
 * Builds a ReactFlow graph representation of a material's composition
 * @param {Object} materialData - Material data from extractSceneData
 * @returns {Object} { nodes, edges } for ReactFlow
 */
export function buildMaterialGraph(materialData) {
  const nodes = [];
  const edges = [];

  const COLUMN_SPACING = 250;
  const ROW_SPACING = 120;
  const START_X = 50;
  const START_Y = 50;

  let textureY = START_Y;
  let valueY = START_Y;

  // Material output node (right side)
  const materialNode = {
    id: 'material-output',
    type: 'materialOutput',
    position: { x: START_X + COLUMN_SPACING * 2, y: START_Y + 200 },
    data: {
      label: materialData.name,
      materialId: materialData.id,
    },
  };
  nodes.push(materialNode);

  // Texture nodes (left column)
  const textureTypes = [
    { key: 'baseColor', label: 'Base Color', inputHandle: 'baseColorTexture' },
    { key: 'metallicRoughness', label: 'Metallic/Roughness', inputHandle: 'metallicRoughnessTexture' },
    { key: 'normal', label: 'Normal Map', inputHandle: 'normalTexture' },
    { key: 'occlusion', label: 'Occlusion', inputHandle: 'occlusionTexture' },
    { key: 'emissive', label: 'Emissive', inputHandle: 'emissiveTexture' },
  ];

  textureTypes.forEach(({ key, label, inputHandle }) => {
    const textureData = materialData.textures?.[key];
    if (textureData) {
      const nodeId = `texture-${key}`;
      nodes.push({
        id: nodeId,
        type: 'textureInput',
        position: { x: START_X, y: textureY },
        data: {
          label,
          texture: textureData,
        },
      });

      edges.push({
        id: `edge-${nodeId}-to-material`,
        source: nodeId,
        target: 'material-output',
        targetHandle: inputHandle,
        style: { stroke: '#666' },
      });

      textureY += ROW_SPACING;
    }
  });

  // Value nodes (middle column)
  const valueX = START_X + COLUMN_SPACING;

  // Base Color Factor (RGBA)
  if (materialData.baseColorFactor) {
    const nodeId = 'value-baseColor';
    nodes.push({
      id: nodeId,
      type: 'rgbaValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Base Color Factor',
        value: materialData.baseColorFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'baseColorFactor',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Metallic Factor (Float)
  if (materialData.metallicFactor !== undefined && materialData.metallicFactor !== null) {
    const nodeId = 'value-metallic';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Metallic',
        value: materialData.metallicFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'metallicFactor',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Roughness Factor (Float)
  if (materialData.roughnessFactor !== undefined && materialData.roughnessFactor !== null) {
    const nodeId = 'value-roughness';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Roughness',
        value: materialData.roughnessFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'roughnessFactor',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Emissive Factor (RGB)
  if (materialData.emissiveFactor && materialData.emissiveFactor.some(v => v > 0)) {
    const nodeId = 'value-emissive';
    nodes.push({
      id: nodeId,
      type: 'rgbValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Emissive Factor',
        value: materialData.emissiveFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'emissiveFactor',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Normal Scale (Float)
  if (materialData.normalScale !== null && materialData.normalScale !== undefined) {
    const nodeId = 'value-normalScale';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Normal Scale',
        value: materialData.normalScale,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'normalScale',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Occlusion Strength (Float)
  if (materialData.occlusionStrength !== null && materialData.occlusionStrength !== undefined) {
    const nodeId = 'value-occlusionStrength';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Occlusion Strength',
        value: materialData.occlusionStrength,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'occlusionStrength',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Alpha Cutoff (Float) - only for MASK mode
  if (materialData.alphaCutoff !== null && materialData.alphaCutoff !== undefined) {
    const nodeId = 'value-alphaCutoff';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Alpha Cutoff',
        value: materialData.alphaCutoff,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'alphaCutoff',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  // Double Sided (Boolean)
  if (materialData.doubleSided !== undefined) {
    const nodeId = 'value-doubleSided';
    nodes.push({
      id: nodeId,
      type: 'booleanValue',
      position: { x: valueX, y: valueY },
      data: {
        label: 'Double Sided',
        value: materialData.doubleSided,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: 'material-output',
      targetHandle: 'doubleSided',
      style: { stroke: '#999' },
    });

    valueY += ROW_SPACING;
  }

  return { nodes, edges };
}
