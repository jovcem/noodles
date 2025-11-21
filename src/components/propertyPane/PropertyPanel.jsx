import { useSceneStore } from '../../store/sceneStore';
import NodeProperties from './NodeProperties';
import MeshProperties from './MeshProperties';
import MaterialProperties from './MaterialProperties';

function PropertyPanel() {
  const selectedNode = useSceneStore((state) => state.selectedNode);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);

  if (!selectedNode) {
    return null;
  }

  const handleClose = () => {
    setSelectedNode(null);
  };

  const renderProperties = () => {
    switch (selectedNode.nodeType) {
      case 'node':
        return <NodeProperties data={selectedNode} />;
      case 'mesh':
        return <MeshProperties data={selectedNode} />;
      case 'material':
        return <MaterialProperties data={selectedNode} />;
      default:
        return <div>Unknown node type</div>;
    }
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Properties</h3>
        <button onClick={handleClose} style={closeButtonStyle}>
          ×
        </button>
      </div>
      <div style={contentStyle}>{renderProperties()}</div>
    </div>
  );
}

const panelStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '300px',
  maxHeight: 'calc(100% - 20px)',
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '8px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  borderBottom: '1px solid #444',
};

const titleStyle = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#fff',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#888',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentStyle = {
  padding: '15px',
  overflowY: 'auto',
  flex: 1,
};

export default PropertyPanel;
