import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function FloatValueNode({ data }) {
  const { currentTheme } = useTheme();

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid #3498db`,
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

  const valueStyle = {
    color: currentTheme.text,
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '12px',
    background: currentTheme.hover,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
  };

  const handleStyle = {
    background: '#3498db',
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

      <div style={valueStyle}>
        {typeof data.value === 'number' ? data.value.toFixed(3) : '0.000'}
      </div>
    </div>
  );
}

export default FloatValueNode;
