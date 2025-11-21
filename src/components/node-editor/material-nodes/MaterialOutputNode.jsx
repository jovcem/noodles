import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';
import { NODE_COLORS } from '../../../constants/colorConstants';

function MaterialOutputNode({ data }) {
  const { currentTheme } = useTheme();

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid ${NODE_COLORS.material}`,
    borderRadius: '8px',
    padding: '16px',
    minWidth: '180px',
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
  };

  const headerStyle = {
    color: currentTheme.text,
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  };

  const labelStyle = {
    color: currentTheme.textSecondary,
    fontSize: '12px',
    textAlign: 'center',
  };

  const handleStyle = {
    background: NODE_COLORS.material,
    width: '10px',
    height: '10px',
  };

  return (
    <div style={nodeStyle}>
      {/* Input handles for all possible connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="baseColorTexture"
        style={{ ...handleStyle, top: '15%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="metallicRoughnessTexture"
        style={{ ...handleStyle, top: '25%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="normalTexture"
        style={{ ...handleStyle, top: '35%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="occlusionTexture"
        style={{ ...handleStyle, top: '45%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="emissiveTexture"
        style={{ ...handleStyle, top: '55%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="baseColorFactor"
        style={{ ...handleStyle, top: '65%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="metallicFactor"
        style={{ ...handleStyle, top: '75%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="roughnessFactor"
        style={{ ...handleStyle, top: '85%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="emissiveFactor"
        style={{ ...handleStyle, top: '95%' }}
      />

      <div style={headerStyle}>{data.label}</div>
      <div style={labelStyle}>Material Output</div>
    </div>
  );
}

export default MaterialOutputNode;
