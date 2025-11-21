import { useCallback, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';
import { buildMaterialGraph } from '../../utils/graph/materialGraphBuilder';

// Import custom node components
import MaterialOutputNode from './material-nodes/MaterialOutputNode';
import TextureInputNode from './material-nodes/TextureInputNode';
import RGBAValueNode from './material-nodes/RGBAValueNode';
import FloatValueNode from './material-nodes/FloatValueNode';
import RGBValueNode from './material-nodes/RGBValueNode';
import BooleanValueNode from './material-nodes/BooleanValueNode';
import SplitRGBNode from './material-nodes/SplitRGBNode';

// Register custom node types
const nodeTypes = {
  materialOutput: MaterialOutputNode,
  textureInput: TextureInputNode,
  rgbaValue: RGBAValueNode,
  floatValue: FloatValueNode,
  rgbValue: RGBValueNode,
  booleanValue: BooleanValueNode,
  splitRGB: SplitRGBNode,
};

function MaterialDetailView() {
  const { currentTheme } = useTheme();
  const materialDetailData = useSceneStore((state) => state.materialDetailData);
  const exitMaterialDetail = useSceneStore((state) => state.exitMaterialDetail);

  // Build material graph from material data
  const initialGraph = useMemo(() => {
    if (!materialDetailData) return { nodes: [], edges: [] };
    return buildMaterialGraph(materialDetailData);
  }, [materialDetailData]);

  // Manage nodes state locally for drag support
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges] = useState(initialGraph.edges);

  // Update nodes when material data changes
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
    exitMaterialDetail();
  }, [exitMaterialDetail]);

  if (!materialDetailData) {
    return (
      <div style={emptyStateStyle}>
        <p style={placeholderStyle(currentTheme)}>No material selected</p>
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
          Material: {materialDetailData.name}
        </div>
      </div>

      {/* Material Graph */}
      <div style={graphContainerStyle}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{
            padding: 0.15,
            minZoom: 0.3,
            maxZoom: 1.2,
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
            nodeColor={() => currentTheme.primary}
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
  gap: '16px',
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
  flex: 1,
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

export default MaterialDetailView;
