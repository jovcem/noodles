import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';
import NodeProperties from './NodeProperties';
import MeshProperties from './MeshProperties';
import MaterialProperties from './MaterialProperties';
import SkinProperties from './SkinProperties';
import AnimationProperties from './AnimationProperties';

function PropertyPanel({ inline = false }) {
  const { currentTheme } = useTheme();
  const selectedNode = useSceneStore((state) => state.selectedNode);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);

  if (!selectedNode && !inline) {
    return null;
  }

  const handleClose = () => {
    setSelectedNode(null);
  };

  const renderProperties = () => {
    if (!selectedNode) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: currentTheme.textSecondary,
          fontSize: '13px'
        }}>
          Select a node to view properties
        </div>
      );
    }

    switch (selectedNode.nodeType) {
      case 'node':
        return <NodeProperties data={selectedNode} />;
      case 'mesh':
        return <MeshProperties data={selectedNode} />;
      case 'material':
        return <MaterialProperties data={selectedNode} />;
      case 'skin':
        return <SkinProperties data={selectedNode} />;
      case 'animation':
        return <AnimationProperties data={selectedNode} />;
      default:
        return <div>Unknown node type</div>;
    }
  };

  return (
    <div style={inline ? inlinePanelStyle(currentTheme) : panelStyle(currentTheme)}>
      <div style={headerStyle(currentTheme)}>
        <h3 style={titleStyle(currentTheme)}>Properties</h3>
        {!inline && (
          <button onClick={handleClose} style={closeButtonStyle(currentTheme)}>
            ×
          </button>
        )}
      </div>
      <div style={contentStyle}>{renderProperties()}</div>
    </div>
  );
}

const panelStyle = (currentTheme) => ({
  position: 'absolute',
  top: '22px',
  right: '0px',
  width: '300px',
  maxHeight: 'calc(100% - 22px)',
  backgroundColor: currentTheme.surface,
  borderLeft: `1px solid ${currentTheme.border}`,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const inlinePanelStyle = (currentTheme) => ({
  width: '100%',
  height: '100%',
  backgroundColor: currentTheme.surface,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const headerStyle = (currentTheme) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  borderBottom: `1px solid ${currentTheme.border}`,
});

const titleStyle = (currentTheme) => ({
  margin: 0,
  fontSize: '16px',
  fontWeight: 'bold',
  color: currentTheme.text,
});

const closeButtonStyle = (currentTheme) => ({
  background: 'none',
  border: 'none',
  color: currentTheme.textSecondary,
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const contentStyle = {
  padding: '15px',
  overflowY: 'auto',
  flex: 1,
};

export default PropertyPanel;
