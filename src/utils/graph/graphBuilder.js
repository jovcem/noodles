import { NODE_COLORS, getNodeSubtypeColor, getNodeSubtypeIcon } from '../../constants/colorConstants';
import { DARK_THEME } from '../../constants/themeConfig';

const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 200;

export function buildReactFlowGraph(sceneData, theme = DARK_THEME) {
  const nodes = [];
  const edges = [];

  // Filter out joint nodes - they should only appear in skin detail view
  const nonJointNodes = sceneData.nodes.filter(node => node.subType !== 'joint');
  const jointNodeIds = new Set(sceneData.nodes.filter(node => node.subType === 'joint').map(n => n.id));

  // Build a map for quick node lookup
  const nodeMap = new Map();
  nonJointNodes.forEach(node => {
    nodeMap.set(node.id, node);
  });

  // Rebuild parent-child relationships skipping joint nodes
  // For each non-joint node, find its non-joint children (may skip multiple levels)
  const effectiveChildren = new Map();

  function findNonJointChildren(nodeId) {
    const node = sceneData.nodes.find(n => n.id === nodeId);
    if (!node) return [];

    const children = [];
    for (const childId of node.children) {
      if (jointNodeIds.has(childId)) {
        // Skip this joint and get its children instead
        children.push(...findNonJointChildren(childId));
      } else {
        children.push(childId);
      }
    }
    return children;
  }

  nonJointNodes.forEach(node => {
    effectiveChildren.set(node.id, findNonJointChildren(node.id));
  });

  // Find root nodes (nodes with no parent in the non-joint graph)
  const allChildIds = new Set();
  effectiveChildren.forEach((children) => {
    children.forEach(childId => allChildIds.add(childId));
  });

  const rootNodes = nonJointNodes.filter(node => !allChildIds.has(node.id));

  // Calculate positions for nodes in a tree layout
  const nodePositions = new Map();

  function layoutNodeTree(nodeId, startX, level) {
    const nodeData = nodeMap.get(nodeId);
    if (!nodeData) return { width: 0, centerX: startX };

    const childIds = effectiveChildren.get(nodeId) || [];
    const children = childIds.map(childId => nodeMap.get(childId)).filter(Boolean);

    if (children.length === 0) {
      // Leaf node
      nodePositions.set(nodeId, { x: startX, y: level * VERTICAL_SPACING + 50 });
      return { width: HORIZONTAL_SPACING, centerX: startX };
    }

    // Layout children first
    let childX = startX;
    const childLayouts = [];

    children.forEach(child => {
      const layout = layoutNodeTree(child.id, childX, level + 1);
      childLayouts.push(layout);
      childX += layout.width;
    });

    // Calculate total width and center position for parent
    const totalWidth = childLayouts.reduce((sum, layout) => sum + layout.width, 0);
    const firstChildCenter = childLayouts[0].centerX;
    const lastChildCenter = childLayouts[childLayouts.length - 1].centerX;
    const parentCenterX = (firstChildCenter + lastChildCenter) / 2;

    nodePositions.set(nodeId, { x: parentCenterX, y: level * VERTICAL_SPACING + 50 });

    return { width: totalWidth, centerX: parentCenterX };
  }

  // Layout each root node tree
  let rootX = 0;
  rootNodes.forEach(rootNode => {
    const layout = layoutNodeTree(rootNode.id, rootX, 0);
    rootX += layout.width + HORIZONTAL_SPACING;
  });

  // Create nodes with calculated positions (excluding joint nodes)
  nonJointNodes.forEach((nodeData) => {
    const position = nodePositions.get(nodeData.id) || { x: 0, y: 0 };

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
      position: position,
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

    // Add edges to effective children (skipping joint nodes)
    const childIds = effectiveChildren.get(nodeData.id) || [];
    childIds.forEach((childId) => {
      const childNode = nodeMap.get(childId);
      if (childNode) {
        edges.push({
          id: `${nodeData.id}-${childId}`,
          source: nodeData.id,
          target: childId,
          type: 'default',
          animated: false,
          style: { stroke: theme.textSecondary, strokeWidth: 2 },
        });
      }
    });
  });

  // Helper function to find the effective non-joint parent
  function findEffectiveParent(nodeId) {
    const node = sceneData.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // If this is a non-joint node with a position, return it
    if (!jointNodeIds.has(nodeId) && nodePositions.has(nodeId)) {
      return nodeId;
    }

    // Otherwise, find the parent and recursively search up
    const parentNode = sceneData.nodes.find(n => n.children.includes(nodeId));
    if (!parentNode) return null;

    return findEffectiveParent(parentNode.id);
  }

  // Position meshes below their parent nodes
  sceneData.meshes.forEach((meshData) => {
    // Find the parent node that references this mesh
    const parentNode = sceneData.nodes.find(node => node.meshId === meshData.id);

    let xPosition = 0;
    let yPosition = 50 + VERTICAL_SPACING;

    if (parentNode) {
      // Find the effective non-joint parent
      const effectiveParentId = findEffectiveParent(parentNode.id);

      if (effectiveParentId) {
        const parentPosition = nodePositions.get(effectiveParentId);
        if (parentPosition) {
          xPosition = parentPosition.x;
          yPosition = parentPosition.y + VERTICAL_SPACING;
        }
      }
    }

    nodePositions.set(meshData.id, { x: xPosition, y: yPosition });

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

  // Position materials below their parent meshes
  sceneData.materials.forEach((materialData) => {
    // Find the parent mesh that references this material
    const parentMesh = sceneData.meshes.find(mesh =>
      mesh.materialIds.includes(materialData.id)
    );

    let xPosition = 0;
    let yPosition = 50 + VERTICAL_SPACING * 2;

    if (parentMesh) {
      const parentPosition = nodePositions.get(parentMesh.id);
      if (parentPosition) {
        xPosition = parentPosition.x;
        yPosition = parentPosition.y + VERTICAL_SPACING;
      }
    }

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

  // Position animations to the left of the scene hierarchy
  if (sceneData.animations && sceneData.animations.length > 0) {
    sceneData.animations.forEach((animationData, index) => {
      // Stack animations vertically on the left side
      const xPosition = -HORIZONTAL_SPACING * 2;
      const yPosition = 50 + index * VERTICAL_SPACING;

      nodePositions.set(animationData.id, { x: xPosition, y: yPosition });

      nodes.push({
        id: animationData.id,
        type: 'default',
        data: {
          label: `🎬 ${animationData.name}\n(${animationData.duration.toFixed(2)}s, ${animationData.channelCount} channels)`,
          nodeType: 'animation',
        },
        position: { x: xPosition, y: yPosition },
        style: {
          background: theme.surface,
          color: theme.text,
          border: `1px solid ${NODE_COLORS.animation || '#FF6B9D'}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '180px',
        },
      });

      // Add edges from animation to animated nodes (one edge per unique node)
      const edgeTargets = new Set();
      animationData.animatedNodes.forEach((animatedNode) => {
        // Find the effective non-joint parent for this animated node
        const effectiveParentId = findEffectiveParent(animatedNode.nodeId);
        const targetNodeId = effectiveParentId || animatedNode.nodeId;

        // Only create edge if the target node exists in the graph and we haven't already created one
        if (nodePositions.has(targetNodeId) && !edgeTargets.has(targetNodeId)) {
          edgeTargets.add(targetNodeId);
          edges.push({
            id: `${animationData.id}-${targetNodeId}`,
            source: animationData.id,
            target: targetNodeId,
            type: 'default',
            animated: true,
            style: { stroke: NODE_COLORS.animation || '#FF6B9D', strokeWidth: 2 },
          });
        }
      });
    });
  }

  // Position skins next to their parent meshes
  if (sceneData.skins) {
    sceneData.skins.forEach((skinData) => {
      // Find the skinned mesh node that references this skin
      const skinnedNode = sceneData.nodes.find(node => node.skinId === skinData.id);

      let xPosition = 0;
      let yPosition = 50 + VERTICAL_SPACING;

      if (skinnedNode) {
        // Find the effective non-joint parent
        const effectiveParentId = findEffectiveParent(skinnedNode.id);

        if (effectiveParentId) {
          const nodePosition = nodePositions.get(effectiveParentId);
          if (nodePosition) {
            // Position to the right of the node
            xPosition = nodePosition.x + HORIZONTAL_SPACING;
            yPosition = nodePosition.y;
          }
        }
      }

      nodePositions.set(skinData.id, { x: xPosition, y: yPosition });

      nodes.push({
        id: skinData.id,
        type: 'default',
        data: {
          label: `${skinData.name}\n(${skinData.joints.length} joints)`,
          nodeType: 'skin',
        },
        position: { x: xPosition, y: yPosition },
        style: {
          background: theme.surface,
          color: theme.text,
          border: `1px solid ${NODE_COLORS.skin}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '150px',
        },
      });

      // Add edge from skinned node to skin
      if (skinnedNode) {
        edges.push({
          id: `${skinnedNode.id}-${skinData.id}`,
          source: skinnedNode.id,
          target: skinData.id,
          type: 'default',
          animated: false,
          style: { stroke: NODE_COLORS.skin, strokeWidth: 2 },
        });
      }
    });
  }

  return { nodes, edges };
}
