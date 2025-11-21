import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function SplitRGBNode({ data }) {
  const { currentTheme } = useTheme();

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid ${currentTheme.primary}`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '180px',
  };

  const headerStyle = {
    color: currentTheme.text,
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '8px',
  };

  const thumbnailContainerStyle = {
    width: '128px',
    height: '128px',
    background: currentTheme.hover,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    color: currentTheme.textSecondary,
    fontSize: '11px',
    overflow: 'hidden',
  };

  const thumbnailImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  const channelsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const channelRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: currentTheme.hover,
    borderRadius: '4px',
    fontSize: '11px',
    color: currentTheme.text,
    position: 'relative',
  };

  const handleStyle = {
    background: currentTheme.primary,
    width: '10px',
    height: '10px',
  };

  const channelIndicatorStyle = (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    background: color,
    marginRight: '6px',
  });

  const texture = data.sourceTexture;

  return (
    <div style={nodeStyle}>
      <div style={headerStyle}>{data.label}</div>

      <div style={thumbnailContainerStyle}>
        {texture?.imageDataUrl ? (
          <img
            src={texture.imageDataUrl}
            alt={texture.name}
            style={thumbnailImageStyle}
          />
        ) : (
          <span>No Texture</span>
        )}
      </div>

      <div style={channelsContainerStyle}>
        <div style={channelRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={channelIndicatorStyle('#ff4444')} />
            <span>Occlusion</span>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="red"
            style={{ ...handleStyle, top: 'auto' }}
          />
        </div>

        <div style={channelRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={channelIndicatorStyle('#44ff44')} />
            <span>Roughness</span>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="green"
            style={{ ...handleStyle, top: 'auto' }}
          />
        </div>

        <div style={channelRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={channelIndicatorStyle('#4444ff')} />
            <span>Metalness</span>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="blue"
            style={{ ...handleStyle, top: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}

export default SplitRGBNode;
