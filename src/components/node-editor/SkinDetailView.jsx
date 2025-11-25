import { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';
import { NODE_COLORS } from '../../constants/themeConfig';

function SkinDetailView() {
  const { currentTheme } = useTheme();
  const skinDetailData = useSceneStore((state) => state.skinDetailData);
  const exitSkinDetail = useSceneStore((state) => state.exitSkinDetail);
  const sceneData = useSceneStore((state) => state.sceneData);

  // Build skeleton hierarchy graph from skin data
  const initialGraph = useMemo(() => {
    if (!skinDetailData || !sceneData) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    const nodePositions = new Map();

    // Get all skeleton nodes (joints + their descendants like _end nodes)
    // Start with explicit joints from the skin
    const allSkeletonNodeIds = new Set(skinDetailData.joints);

    // Add all descendants of joints (recursively)
    function addDescendants(nodeId) {
      const node = sceneData.nodes.find(n => n.id === nodeId);
      if (!node) return;

      node.children.forEach(childId => {
        if (!allSkeletonNodeIds.has(childId)) {
          allSkeletonNodeIds.add(childId);
          addDescendants(childId);
        }
      });
    }

    skinDetailData.joints.forEach(jointId => addDescendants(jointId));

    // Get all skeleton nodes
    const skeletonNodes = Array.from(allSkeletonNodeIds)
      .map(nodeId => sceneData.nodes.find(n => n.id === nodeId))
      .filter(Boolean);

    // Build parent-child relationships among skeleton nodes
    const jointChildren = new Map();
    const jointParents = new Map();

    skeletonNodes.forEach((node) => {
      const childrenInSkeleton = node.children.filter((childId) =>
        allSkeletonNodeIds.has(childId)
      );
      jointChildren.set(node.id, childrenInSkeleton);

      childrenInSkeleton.forEach((childId) => {
        jointParents.set(childId, node.id);
      });
    });

    // Find root joints (joints with no parent in the skeleton)
    const rootJoints = skeletonNodes.filter((joint) => !jointParents.has(joint.id));

    // Layout the skeleton hierarchy
    const VERTICAL_SPACING = 100;
    const HORIZONTAL_SPACING = 150;

    function layoutJointTree(jointId, startX, level) {
      const joint = sceneData.nodes.find((n) => n.id === jointId);
      if (!joint) return { width: 0, centerX: startX };

      const children = jointChildren.get(jointId) || [];

      if (children.length === 0) {
        // Leaf joint
        nodePositions.set(jointId, { x: startX, y: level * VERTICAL_SPACING + 50 });
        return { width: HORIZONTAL_SPACING, centerX: startX };
      }

      // Layout children first
      let childX = startX;
      const childLayouts = [];

      children.forEach((childId) => {
        const layout = layoutJointTree(childId, childX, level + 1);
        childLayouts.push(layout);
        childX += layout.width;
      });

      // Calculate center position for parent
      const firstChildCenter = childLayouts[0].centerX;
      const lastChildCenter = childLayouts[childLayouts.length - 1].centerX;
      const parentCenterX = (firstChildCenter + lastChildCenter) / 2;
      const totalWidth = childLayouts.reduce((sum, layout) => sum + layout.width, 0);

      nodePositions.set(jointId, { x: parentCenterX, y: level * VERTICAL_SPACING + 50 });

      return { width: totalWidth, centerX: parentCenterX };
    }

    // Layout each root joint tree
    let rootX = 0;
    rootJoints.forEach((rootJoint) => {
      const layout = layoutJointTree(rootJoint.id, rootX, 0);
      rootX += layout.width + HORIZONTAL_SPACING;
    });

    // Create nodes for all skeleton nodes
    skeletonNodes.forEach((joint) => {
      const position = nodePositions.get(joint.id) || { x: 0, y: 0 };
      const isSkeletonRoot = skinDetailData.skeleton === joint.id;
      const isActualJoint = skinDetailData.joints.includes(joint.id);

      // Determine node appearance based on type
      let icon, borderColor, borderLeft, opacity;
      if (isSkeletonRoot) {
        icon = '🎯';
        borderColor = NODE_COLORS.skin;
        borderLeft = `4px solid #10b981`; // Green for skeleton root
        opacity = 1;
      } else if (isActualJoint) {
        icon = '🦴';
        borderColor = NODE_COLORS.skin;
        borderLeft = `4px solid ${NODE_COLORS.skin}`; // Purple for joints
        opacity = 1;
      } else {
        icon = '⭘';
        borderColor = '#888888';
        borderLeft = `4px solid #888888`; // Gray for leaf nodes (_end nodes)
        opacity = 0.7;
      }

      nodes.push({
        id: joint.id,
        type: 'default',
        data: {
          label: `${icon} ${joint.name}`,
          nodeType: 'joint',
        },
        position: position,
        style: {
          background: currentTheme.surface,
          color: currentTheme.text,
          border: `2px solid ${borderColor}`,
          borderLeft: borderLeft,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '120px',
          fontSize: '12px',
          opacity: opacity,
        },
      });

      // Add edges to children
      const children = jointChildren.get(joint.id) || [];
      children.forEach((childId) => {
        edges.push({
          id: `${joint.id}-${childId}`,
          source: joint.id,
          target: childId,
          type: 'default',
          animated: false,
          style: { stroke: NODE_COLORS.skin, strokeWidth: 2 },
        });
      });
    });

    return { nodes, edges };
  }, [skinDetailData, sceneData, currentTheme]);

  // Manage nodes state locally for drag support
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges] = useState(initialGraph.edges);

  // Update nodes when skin data changes
  useMemo(() => {
    setNodes(initialGraph.nodes);
  }, [initialGraph.nodes]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const handleBackClick = useCallback(() => {
    exitSkinDetail();
  }, [exitSkinDetail]);

  if (!skinDetailData) {
    return (
      <div style={emptyStateStyle}>
        <p style={placeholderStyle(currentTheme)}>No skin selected</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header with back button */}
      <div style={headerStyle(currentTheme)}>
        <button style={backButtonStyle(currentTheme)} onClick={handleBackClick}>
          ← Back to Scene Graph
        </button>
        <div style={titleStyle(currentTheme)}>
          Skin: {skinDetailData.name}
        </div>
        <div style={subtitleStyle(currentTheme)}>
          {skinDetailData.joints.length} joints
          {skinDetailData.inverseBindMatricesCount && ` • ${skinDetailData.inverseBindMatricesCount} matrices`}
        </div>
      </div>

      {/* Skeleton Hierarchy Graph */}
      <div style={graphContainerStyle}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.3,
            maxZoom: 1.5,
          }}
          style={{ background: currentTheme.background }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color={currentTheme.borderLight} gap={16} />
          <Controls style={{ button: { backgroundColor: currentTheme.surface, color: currentTheme.text } }} />
          <MiniMap
            style={{ background: currentTheme.surface }}
            nodeColor={() => NODE_COLORS.skin}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = (currentTheme) => ({
  padding: '12px 16px',
  background: currentTheme.surface,
  borderBottom: `1px solid ${currentTheme.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const backButtonStyle = (currentTheme) => ({
  background: currentTheme.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
});

const titleStyle = (currentTheme) => ({
  color: currentTheme.text,
  fontSize: '16px',
  fontWeight: 'bold',
});

const subtitleStyle = (currentTheme) => ({
  color: currentTheme.textSecondary,
  fontSize: '13px',
  marginLeft: 'auto',
});

const graphContainerStyle = {
  flex: 1,
  position: 'relative',
};

const emptyStateStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const placeholderStyle = (currentTheme) => ({
  color: currentTheme.textSecondary,
  fontSize: '0.9rem',
});

export default SkinDetailView;
