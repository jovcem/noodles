import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function RGBValueNode({ data }) {
  const { currentTheme } = useTheme();

  const rgb = data.value || [0, 0, 0];
  const colorPreview = `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid #e67e22`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '140px',
  };

  const headerStyle = {
    color: currentTheme.text,
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '8px',
  };

  const colorBoxStyle = {
    width: '100%',
    height: '40px',
    background: colorPreview,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
    marginBottom: '8px',
  };

  const valuesStyle = {
    color: currentTheme.textSecondary,
    fontSize: '11px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '4px',
  };

  const handleStyle = {
    background: '#e67e22',
    width: '10px',
    height: '10px',
  };

  return (
    <div style={nodeStyle}>
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
      />

      <div style={headerStyle}>{data.label}</div>

      <div style={colorBoxStyle} />

      <div style={valuesStyle}>
        <div>R: {rgb[0].toFixed(3)}</div>
        <div>G: {rgb[1].toFixed(3)}</div>
        <div>B: {rgb[2].toFixed(3)}</div>
      </div>
    </div>
  );
}

export default RGBValueNode;
