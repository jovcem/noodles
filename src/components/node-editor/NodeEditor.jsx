import { useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSceneStore } from '../../store/sceneStore';
import { getNodeColor } from '../../constants/colorConstants';
import { useTheme } from '../../contexts/ThemeContext';

function NodeEditor() {
  const { currentTheme } = useTheme();
  const nodes = useSceneStore((state) => state.nodes);
  const edges = useSceneStore((state) => state.edges);
  const sceneData = useSceneStore((state) => state.sceneData);
  const selectedNode = useSceneStore((state) => state.selectedNode);
  const setNodes = useSceneStore((state) => state.setNodes);
  const setEdges = useSceneStore((state) => state.setEdges);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);

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

  // Update node styles when selection changes
  useEffect(() => {
    if (!selectedNode) return;

    const updatedNodes = nodes.map((node) => {
      const isSelected = node.id === selectedNode.id;
      const nodeColor = getNodeColor(node.data.nodeType);

      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: isSelected ? `0 0 0 3px ${nodeColor}` : 'none',
          borderWidth: isSelected ? '2px' : '1px',
          borderColor: nodeColor,
        },
      };
    });

    setNodes(updatedNodes);
  }, [selectedNode?.id]);

  if (nodes.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p style={placeholderStyle(currentTheme)}>Load a GLB file to see the scene graph</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        style={{ background: currentTheme.background }}
      >
        <Background color={currentTheme.borderLight} gap={16} />
        <Controls style={{ button: { backgroundColor: currentTheme.surface, color: currentTheme.text } }} />
        <MiniMap
          style={{ background: currentTheme.surface }}
          nodeColor={(node) => getNodeColor(node.data.nodeType)}
        />
      </ReactFlow>
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%',
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
