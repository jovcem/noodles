import { NODE_COLORS, THEME_COLORS } from '../../constants/colorConstants';

const VERTICAL_SPACING = 100;
const HORIZONTAL_SPACING = 250;

export function buildReactFlowGraph(sceneData) {
  const nodes = [];
  const edges = [];

  let yOffset = 0;

  sceneData.nodes.forEach((nodeData, index) => {
    const xPosition = 50;
    const yPosition = yOffset;
    yOffset += VERTICAL_SPACING;

    nodes.push({
      id: nodeData.id,
      type: 'default',
      data: {
        label: nodeData.name,
        nodeType: 'node',
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: THEME_COLORS.surface,
        color: THEME_COLORS.text,
        border: `1px solid ${NODE_COLORS.node}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
      },
    });

    if (nodeData.meshId) {
      edges.push({
        id: `${nodeData.id}-${nodeData.meshId}`,
        source: nodeData.id,
        target: nodeData.meshId,
        type: 'default',
        animated: false,
        style: { stroke: NODE_COLORS.node, strokeWidth: 2 },
      });
    }

    nodeData.children.forEach((childId) => {
      edges.push({
        id: `${nodeData.id}-${childId}`,
        source: nodeData.id,
        target: childId,
        type: 'default',
        animated: false,
        style: { stroke: THEME_COLORS.textSecondary, strokeWidth: 2 },
      });
    });
  });

  let meshYOffset = 0;
  sceneData.meshes.forEach((meshData) => {
    const xPosition = 50 + HORIZONTAL_SPACING;
    const yPosition = meshYOffset;
    meshYOffset += VERTICAL_SPACING;

    nodes.push({
      id: meshData.id,
      type: 'default',
      data: {
        label: `${meshData.name}\n(${meshData.primitiveCount} primitives)`,
        nodeType: 'mesh',
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: THEME_COLORS.surface,
        color: THEME_COLORS.text,
        border: `1px solid ${NODE_COLORS.mesh}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
      },
    });

    meshData.materialIds.forEach((materialId) => {
      edges.push({
        id: `${meshData.id}-${materialId}`,
        source: meshData.id,
        target: materialId,
        type: 'default',
        animated: false,
        style: { stroke: NODE_COLORS.mesh, strokeWidth: 2 },
      });
    });
  });

  let materialYOffset = 0;
  sceneData.materials.forEach((materialData) => {
    const xPosition = 50 + HORIZONTAL_SPACING * 2;
    const yPosition = materialYOffset;
    materialYOffset += VERTICAL_SPACING;

    nodes.push({
      id: materialData.id,
      type: 'default',
      data: {
        label: materialData.name,
        nodeType: 'material',
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: THEME_COLORS.surface,
        color: THEME_COLORS.text,
        border: `1px solid ${NODE_COLORS.material}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
      },
    });
  });

  return { nodes, edges };
}
