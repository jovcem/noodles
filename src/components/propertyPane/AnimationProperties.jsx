import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';

function AnimationProperties({ data }) {
  const { currentTheme } = useTheme();
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles(currentTheme);

  const sceneData = useSceneStore((state) => state.sceneData);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);
  const playAnimation = useSceneStore((state) => state.playAnimation);
  const pauseAnimation = useSceneStore((state) => state.pauseAnimation);
  const currentPlayingAnimation = useSceneStore((state) => state.currentPlayingAnimation);

  const isPlaying = currentPlayingAnimation === data.name;

  // Get interpolation type display name
  const getInterpolationDisplay = (interpolation) => {
    switch (interpolation) {
      case 'LINEAR': return 'Linear';
      case 'STEP': return 'Stepped';
      case 'CUBICSPLINE': return 'Smooth';
      default: return interpolation;
    }
  };

  // Handle play/pause button
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      playAnimation(data.name);
    }
  };

  // Handle clicking on a node ID to jump to it
  const handleNodeClick = (nodeId) => {
    const node = sceneData?.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode({
        id: node.id,
        name: node.name,
        nodeType: 'node',
        subType: node.subType,
        meshId: node.meshId,
        skinId: node.skinId,
        translation: node.translation,
        rotation: node.rotation,
        scale: node.scale,
        matrix: node.matrix,
        worldTranslation: node.worldTranslation,
        worldRotation: node.worldRotation,
        worldScale: node.worldScale,
        worldMatrix: node.worldMatrix,
      });
    }
  };

  const buttonStyle = {
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: isPlaying ? currentTheme.error : NODE_COLORS.animation,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    transition: 'background-color 0.2s',
  };

  const nodeButtonStyle = {
    background: 'none',
    border: 'none',
    color: NODE_COLORS.node,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: '0',
    fontSize: 'inherit',
    textAlign: 'left',
  };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.animation}` }}>
          Animation
        </div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
        <PropertyRow label="Duration" value={`${data.duration.toFixed(2)}s`} />
        <PropertyRow label="Channels" value={data.channelCount} />
      </div>

      <div style={propertyGroupStyle}>
        <button
          onClick={handlePlayPause}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {data.animatedNodes && data.animatedNodes.length > 0 && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>
            Animated Nodes ({data.animatedNodes.length})
          </div>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '4px',
            padding: '8px',
          }}>
            {data.animatedNodes.map((animatedNode, index) => (
              <div key={index} style={{
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: index < data.animatedNodes.length - 1
                  ? `1px solid ${currentTheme.borderLight}`
                  : 'none',
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: currentTheme.text,
                  marginBottom: '6px',
                }}>
                  <button
                    onClick={() => handleNodeClick(animatedNode.nodeId)}
                    style={nodeButtonStyle}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                    }}
                  >
                    📦 {animatedNode.nodeName}
                  </button>
                </div>
                <div style={{ paddingLeft: '8px' }}>
                  {animatedNode.properties.map((property, propIndex) => (
                    <div
                      key={propIndex}
                      style={{
                        fontSize: '12px',
                        color: currentTheme.textSecondary,
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {property.path === 'translation' && '↔️ Translation'}
                        {property.path === 'rotation' && '🔄 Rotation'}
                        {property.path === 'scale' && '📏 Scale'}
                        {property.path === 'weights' && '⚖️ Weights'}
                      </span>
                      <span style={{ color: currentTheme.textTertiary }}>
                        {getInterpolationDisplay(property.interpolation)}, {property.keyframeCount} keys
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimationProperties;
