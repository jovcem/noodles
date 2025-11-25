import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSceneStore } from '../../store/sceneStore';
import { getNodeColor, getNodeSubtypeColor } from '../../constants/colorConstants';
import { useTheme } from '../../contexts/ThemeContext';
import NodeFilterControls from './NodeFilterControls';
import Toolbar from '../shared/Toolbar';

function NodeEditor() {
  const { currentTheme } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef(null);
  const nodes = useSceneStore((state) => state.nodes);
  const edges = useSceneStore((state) => state.edges);
  const sceneData = useSceneStore((state) => state.sceneData);
  const selectedNode = useSceneStore((state) => state.selectedNode);
  const nodeFilters = useSceneStore((state) => state.nodeFilters);
  const isLoadingGraph = useSceneStore((state) => state.isLoadingGraph);
  const setNodes = useSceneStore((state) => state.setNodes);
  const setEdges = useSceneStore((state) => state.setEdges);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);

  // Filter nodes based on nodeFilters
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Always show mesh and material nodes (they have their own types)
      if (node.data.nodeType === 'mesh' || node.data.nodeType === 'material') {
        return true;
      }

      // For 'node' type, check the subType filter
      if (node.data.nodeType === 'node') {
        const subType = node.data.subType || 'transform';
        return nodeFilters[subType] !== false;
      }

      return true;
    });
  }, [nodes, nodeFilters]);

  // Filter edges - only show edges where both source and target nodes are visible
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((edge) => {
      return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
    });
  }, [edges, filteredNodes]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (!sceneData) return;

      let nodeData = null;

      if (node.data.nodeType === 'node') {
        nodeData = sceneData.nodes.find((n) => n.id === node.id);
      } else if (node.data.nodeType === 'mesh') {
        nodeData = sceneData.meshes.find((m) => m.id === node.id);
      } else if (node.data.nodeType === 'material') {
        nodeData = sceneData.materials.find((m) => m.id === node.id);
      }

      if (nodeData) {
        setSelectedNode({ ...nodeData, nodeType: node.data.nodeType });
      }
    },
    [sceneData, setSelectedNode]
  );

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      if (!sceneData) return;

      // Handle material node double-click to open material detail view
      if (node.data.nodeType === 'material') {
        const materialData = sceneData.materials.find((m) => m.id === node.id);
        if (materialData) {
          const enterMaterialDetail = useSceneStore.getState().enterMaterialDetail;
          enterMaterialDetail(materialData);
        }
      }
    },
    [sceneData]
  );

  // Update node styles when selection changes
  useEffect(() => {
    const updatedNodes = nodes.map((node) => {
      const isSelected = selectedNode && node.id === selectedNode.id;
      const nodeColor = getNodeColor(node.data.nodeType);
      const borderWidth = isSelected ? '2px' : '1px';

      // For nodes with subtypes, preserve the left border accent color
      let borderLeftStyle;
      if (node.data.nodeType === 'node' && node.data.subType) {
        const subtypeColor = getNodeSubtypeColor(node.data.subType);
        borderLeftStyle = `4px solid ${subtypeColor}`;
      } else {
        borderLeftStyle = `${borderWidth} solid ${nodeColor}`;
      }

      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: isSelected ? `0 0 0 3px ${nodeColor}` : 'none',
          borderTop: `${borderWidth} solid ${nodeColor}`,
          borderRight: `${borderWidth} solid ${nodeColor}`,
          borderBottom: `${borderWidth} solid ${nodeColor}`,
          borderLeft: borderLeftStyle,
        },
      };
    });

    setNodes(updatedNodes);
  }, [selectedNode?.id]);

  if (filteredNodes.length === 0 && nodes.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p style={placeholderStyle(currentTheme)}>
          {isLoadingGraph ? 'Loading scene graph...' : 'Load a GLB file to see the scene graph'}
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <Toolbar>
        <Toolbar.Button
          ref={filterButtonRef}
          isActive={isFilterOpen}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          Filter Nodes
        </Toolbar.Button>
      </Toolbar>

      {/* Filter Dropdown */}
      <NodeFilterControls
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        buttonRef={filterButtonRef}
      />

      {/* ReactFlow Graph */}
      <div style={graphContainerStyle}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
          style={{ background: currentTheme.background }}
        >
          <Background color={currentTheme.borderLight} gap={16} />
          <Controls style={{ button: { backgroundColor: currentTheme.surface, color: currentTheme.text } }} />
          <MiniMap
            style={{ background: currentTheme.surface }}
            nodeColor={(node) => getNodeColor(node.data.nodeType)}
            pannable
            zoomable
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

export default NodeEditor;
