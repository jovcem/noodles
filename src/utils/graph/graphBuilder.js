import { NODE_COLORS, getNodeSubtypeColor, getNodeSubtypeIcon } from '../../constants/colorConstants';
import { DARK_THEME } from '../../constants/themeConfig';

const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 200;

export function buildReactFlowGraph(sceneData, theme = DARK_THEME) {
  const nodes = [];
  const edges = [];

  let xOffset = 0;

  sceneData.nodes.forEach((nodeData) => {
    const xPosition = xOffset;
    const yPosition = 50;
    xOffset += HORIZONTAL_SPACING;

    const subType = nodeData.subType || 'transform';
    const subtypeColor = getNodeSubtypeColor(subType);
    const subtypeIcon = getNodeSubtypeIcon(subType);

    nodes.push({
      id: nodeData.id,
      type: 'default',
      data: {
        label: `${subtypeIcon} ${nodeData.name}`,
        nodeType: 'node',
        subType: subType,
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: theme.surface,
        color: theme.text,
        border: `1px solid ${NODE_COLORS.node}`,
        borderLeft: `4px solid ${subtypeColor}`,
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
        style: { stroke: theme.textSecondary, strokeWidth: 2 },
      });
    });
  });

  let meshXOffset = 0;
  sceneData.meshes.forEach((meshData) => {
    const xPosition = meshXOffset;
    const yPosition = 50 + VERTICAL_SPACING;
    meshXOffset += HORIZONTAL_SPACING;

    nodes.push({
      id: meshData.id,
      type: 'default',
      data: {
        label: `${meshData.name}\n(${meshData.primitiveCount} primitives)`,
        nodeType: 'mesh',
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: theme.surface,
        color: theme.text,
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

  let materialXOffset = 0;
  sceneData.materials.forEach((materialData) => {
    const xPosition = materialXOffset;
    const yPosition = 50 + VERTICAL_SPACING * 2;
    materialXOffset += HORIZONTAL_SPACING;

    nodes.push({
      id: materialData.id,
      type: 'default',
      data: {
        label: materialData.name,
        nodeType: 'material',
      },
      position: { x: xPosition, y: yPosition },
      style: {
        background: theme.surface,
        color: theme.text,
        border: `1px solid ${NODE_COLORS.material}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
      },
    });
  });

  return { nodes, edges };
}
