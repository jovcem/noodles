/**
 * Builds a ReactFlow graph representation of a material's composition
 * @param {Object} materialData - Material data from extractSceneData
 * @returns {Object} { nodes, edges } for ReactFlow
 */
export function buildMaterialGraph(materialData) {
  const nodes = [];
  const edges = [];

  const COLUMN_SPACING = 250;
  const ROW_SPACING = 150; // Increased from 120 for better spacing
  const START_X = 50;
  const START_Y = 50;

  // Track Y position for each column to prevent overlaps
  const columnY = {
    texture: START_Y,
    value: START_Y,
  };

  // Material output node will be positioned after we know total height
  const materialOutputId = 'material-output';

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
      // Special handling for metallicRoughness texture - insert Split RGB node
      if (key === 'metallicRoughness' && materialData.textures?.metallicRoughnessChannels) {
        // Create Split RGB node
        const splitNodeId = 'split-metallicRoughness';
        nodes.push({
          id: splitNodeId,
          type: 'splitRGB',
          position: { x: START_X, y: columnY.texture },
          data: {
            label: 'Split RGB (ORM)',
            sourceTexture: textureData,
          },
        });

        const channelStartY = columnY.texture;
        // Place channel nodes in column 1.5 (between texture and value columns)
        const channelX = START_X + COLUMN_SPACING;

        // Create texture nodes for each channel
        const channels = [
          { key: 'occlusion', label: 'Occlusion (R)', handle: 'red', inputHandle: 'occlusionTexture' },
          { key: 'roughness', label: 'Roughness (G)', handle: 'green', inputHandle: 'metallicRoughnessTexture' },
          { key: 'metalness', label: 'Metalness (B)', handle: 'blue', inputHandle: 'metallicFactor' },
        ];

        channels.forEach(({ key, label, handle, inputHandle }, index) => {
          const channelData = materialData.textures.metallicRoughnessChannels[key];
          const channelNodeId = `channel-${key}`;
          const channelY = channelStartY + (index * ROW_SPACING);

          // Channel texture node
          nodes.push({
            id: channelNodeId,
            type: 'textureInput',
            position: { x: channelX, y: channelY },
            data: {
              label,
              texture: channelData,
              hasInput: true, // Enable input handle for channel nodes
            },
          });

          // Edge from Split RGB to channel texture
          edges.push({
            id: `edge-split-to-${key}`,
            source: splitNodeId,
            sourceHandle: handle,
            target: channelNodeId,
            style: { stroke: '#888' },
          });

          // Edge from channel texture to material output
          edges.push({
            id: `edge-${channelNodeId}-to-material`,
            source: channelNodeId,
            target: materialOutputId,
            targetHandle: inputHandle,
            style: { stroke: '#666' },
          });
        });

        columnY.texture += ROW_SPACING * 3; // Account for 3 channel rows
      } else {
        // Standard texture node
        const nodeId = `texture-${key}`;
        nodes.push({
          id: nodeId,
          type: 'textureInput',
          position: { x: START_X, y: columnY.texture },
          data: {
            label,
            texture: textureData,
          },
        });

        edges.push({
          id: `edge-${nodeId}-to-material`,
          source: nodeId,
          target: materialOutputId,
          targetHandle: inputHandle,
          style: { stroke: '#666' },
        });

        columnY.texture += ROW_SPACING;
      }
    }
  });

  // Value nodes (column 2) - positioned to the right of channel nodes
  const valueX = START_X + COLUMN_SPACING * 2;

  // Base Color Factor (RGBA)
  if (materialData.baseColorFactor) {
    const nodeId = 'value-baseColor';
    nodes.push({
      id: nodeId,
      type: 'rgbaValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Base Color Factor',
        value: materialData.baseColorFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'baseColorFactor',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Metallic Factor (Float)
  if (materialData.metallicFactor !== undefined && materialData.metallicFactor !== null) {
    const nodeId = 'value-metallic';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Metallic',
        value: materialData.metallicFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'metallicFactor',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Roughness Factor (Float)
  if (materialData.roughnessFactor !== undefined && materialData.roughnessFactor !== null) {
    const nodeId = 'value-roughness';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Roughness',
        value: materialData.roughnessFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'roughnessFactor',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Emissive Factor (RGB)
  if (materialData.emissiveFactor && materialData.emissiveFactor.some(v => v > 0)) {
    const nodeId = 'value-emissive';
    nodes.push({
      id: nodeId,
      type: 'rgbValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Emissive Factor',
        value: materialData.emissiveFactor,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'emissiveFactor',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Normal Scale (Float)
  if (materialData.normalScale !== null && materialData.normalScale !== undefined) {
    const nodeId = 'value-normalScale';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Normal Scale',
        value: materialData.normalScale,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'normalScale',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Occlusion Strength (Float)
  if (materialData.occlusionStrength !== null && materialData.occlusionStrength !== undefined) {
    const nodeId = 'value-occlusionStrength';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Occlusion Strength',
        value: materialData.occlusionStrength,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'occlusionStrength',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Alpha Cutoff (Float) - only for MASK mode
  if (materialData.alphaCutoff !== null && materialData.alphaCutoff !== undefined) {
    const nodeId = 'value-alphaCutoff';
    nodes.push({
      id: nodeId,
      type: 'floatValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Alpha Cutoff',
        value: materialData.alphaCutoff,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'alphaCutoff',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Double Sided (Boolean)
  if (materialData.doubleSided !== undefined) {
    const nodeId = 'value-doubleSided';
    nodes.push({
      id: nodeId,
      type: 'booleanValue',
      position: { x: valueX, y: columnY.value },
      data: {
        label: 'Double Sided',
        value: materialData.doubleSided,
      },
    });

    edges.push({
      id: `edge-${nodeId}-to-material`,
      source: nodeId,
      target: materialOutputId,
      targetHandle: 'doubleSided',
      style: { stroke: '#999' },
    });

    columnY.value += ROW_SPACING;
  }

  // Calculate total height and center the material output node
  const maxY = Math.max(columnY.texture, columnY.value);
  const materialOutputY = (maxY + START_Y) / 2;

  // Add material output node (centered vertically) - positioned to the right of value nodes
  nodes.push({
    id: materialOutputId,
    type: 'materialOutput',
    position: { x: START_X + COLUMN_SPACING * 3, y: materialOutputY },
    data: {
      label: materialData.name,
      materialId: materialData.id,
    },
  });

  return { nodes, edges };
}
