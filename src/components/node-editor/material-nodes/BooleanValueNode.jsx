import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../contexts/ThemeContext';

function BooleanValueNode({ data }) {
  const { currentTheme } = useTheme();

  const nodeStyle = {
    background: currentTheme.surface,
    border: `2px solid #2ecc71`,
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

  const valueContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: currentTheme.hover,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
  };

  const toggleStyle = {
    width: '40px',
    height: '20px',
    background: data.value ? '#2ecc71' : currentTheme.borderLight,
    borderRadius: '10px',
    position: 'relative',
    transition: 'background 0.3s',
  };

  const toggleKnobStyle = {
    width: '16px',
    height: '16px',
    background: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: data.value ? '22px' : '2px',
    transition: 'left 0.3s',
  };

  const labelStyle = {
    marginLeft: '12px',
    color: currentTheme.text,
    fontSize: '13px',
    fontWeight: 'bold',
  };

  const handleStyle = {
    background: '#2ecc71',
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

      <div style={valueContainerStyle}>
        <div style={toggleStyle}>
          <div style={toggleKnobStyle} />
        </div>
        <div style={labelStyle}>{data.value ? 'True' : 'False'}</div>
      </div>
    </div>
  );
}

export default BooleanValueNode;
