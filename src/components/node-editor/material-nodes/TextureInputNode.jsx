import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function TextureInputNode({ data }) {
  const { currentTheme } = useTheme();

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid ${currentTheme.primary}`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '160px',
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
    marginBottom: '8px',
    color: currentTheme.textSecondary,
    fontSize: '11px',
    overflow: 'hidden',
    position: 'relative',
  };

  const thumbnailImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  const infoStyle = {
    color: currentTheme.textSecondary,
    fontSize: '11px',
    lineHeight: '1.4',
  };

  const handleStyle = {
    background: currentTheme.primary,
    width: '10px',
    height: '10px',
  };

  const texture = data.texture;

  // Calculate file size in KB or MB
  const getFileSizeText = () => {
    if (!texture.fileSizeBytes || texture.fileSizeBytes === 0) return null;

    const sizeInBytes = texture.fileSizeBytes;

    if (sizeInBytes < 1024 * 1024) {
      // Less than 1MB, show in KB
      return `${Math.round(sizeInBytes / 1024)} KB`;
    } else {
      // 1MB or more, show in MB
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div style={nodeStyle}>
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
      />

      <div style={headerStyle}>{data.label}</div>

      <div style={thumbnailContainerStyle}>
        {texture.imageDataUrl ? (
          <img
            src={texture.imageDataUrl}
            alt={texture.name}
            style={thumbnailImageStyle}
          />
        ) : (
          <span>No Preview</span>
        )}
      </div>

      <div style={infoStyle}>
        <div><strong>Name:</strong> {texture.name}</div>
        {texture.uri && <div><strong>URI:</strong> {texture.uri}</div>}
        {texture.mimeType && <div><strong>Type:</strong> {texture.mimeType.split('/')[1]}</div>}
        {texture.size && (
          <div><strong>Size:</strong> {texture.size[0]}x{texture.size[1]}</div>
        )}
        {getFileSizeText() && (
          <div><strong>File Size:</strong> {getFileSizeText()}</div>
        )}
        <div><strong>UV:</strong> {texture.texCoord}</div>
      </div>
    </div>
  );
}

export default TextureInputNode;
