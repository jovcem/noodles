import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function RGBAValueNode({ data }) {
  const { currentTheme } = useTheme();

  const rgba = data.value || [1, 1, 1, 1];
  const colorPreview = `rgba(${Math.round(rgba[0] * 255)}, ${Math.round(rgba[1] * 255)}, ${Math.round(rgba[2] * 255)}, ${rgba[3]})`;

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid #9b59b6`,
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
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
  };

  const handleStyle = {
    background: '#9b59b6',
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
        <div>R: {rgba[0].toFixed(3)}</div>
        <div>G: {rgba[1].toFixed(3)}</div>
        <div>B: {rgba[2].toFixed(3)}</div>
        <div>A: {rgba[3].toFixed(3)}</div>
      </div>
    </div>
  );
}

export default RGBAValueNode;
