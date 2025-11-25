import { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function Toolbar({ children }) {
  const { currentTheme } = useTheme();

  return (
    <div style={toolbarStyle(currentTheme)}>
      {children}
    </div>
  );
}

const ToolbarButton = forwardRef(({ children, isActive, onClick }, ref) => {
  const { currentTheme } = useTheme();

  return (
    <button
      ref={ref}
      style={toolbarButtonStyle(currentTheme, isActive)}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

const toolbarStyle = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0px',
  background: theme.backgroundSecondary,
  borderBottom: `1px solid ${theme.border}`,
});

const toolbarButtonStyle = (theme, isActive) => ({
  padding: '4px 10px',
  cursor: 'pointer',
  backgroundColor: isActive ? theme.background : 'transparent',
  color: isActive ? theme.text : theme.textSecondary,
  fontWeight: 600,
  fontSize: '11px',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  border: 'none',
  borderRight: `1px solid ${theme.border}`,
  opacity: isActive ? 1 : 0.7,
});

Toolbar.Button = ToolbarButton;

export default Toolbar;
