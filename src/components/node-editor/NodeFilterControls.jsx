import { useEffect, useRef } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';
import { getNodeSubtypeColor, getNodeSubtypeIcon } from '../../constants/colorConstants';

const NODE_SUBTYPES = [
  { key: 'mesh', label: 'Mesh Nodes' },
  { key: 'camera', label: 'Camera Nodes' },
  { key: 'skinned-mesh', label: 'Skinned Mesh' },
  { key: 'transform', label: 'Transform Nodes' },
  { key: 'empty', label: 'Empty Nodes' },
];

function NodeFilterControls({ isOpen, onClose, buttonRef }) {
  const { currentTheme } = useTheme();
  const nodeFilters = useSceneStore((state) => state.nodeFilters);
  const toggleNodeFilter = useSceneStore((state) => state.toggleNodeFilter);
  const showAllNodeTypes = useSceneStore((state) => state.showAllNodeTypes);
  const hideAllNodeTypes = useSceneStore((state) => state.hideAllNodeTypes);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    // Add a small delay to avoid closing immediately on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside, true); // Use capture phase
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  // Calculate position based on button position
  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const dropdownStyle = buttonRect
    ? {
        ...containerStyle(currentTheme),
        top: `${buttonRect.bottom}px`,
        left: `${buttonRect.left}px`,
      }
    : containerStyle(currentTheme);

  return (
    <div ref={dropdownRef} style={dropdownStyle}>
      <div style={headerStyle(currentTheme)}>
        <div style={buttonGroupStyle}>
          <button style={actionButtonStyle(currentTheme)} onClick={showAllNodeTypes}>
            Show All
          </button>
          <button style={actionButtonStyle(currentTheme)} onClick={hideAllNodeTypes}>
            Hide All
          </button>
        </div>
      </div>

      <div style={filtersContainerStyle}>
        {NODE_SUBTYPES.map(({ key, label }) => {
          const isActive = nodeFilters[key] !== false;
          const color = getNodeSubtypeColor(key);
          const icon = getNodeSubtypeIcon(key);

          return (
            <button
              key={key}
              onClick={() => toggleNodeFilter(key)}
              style={filterButtonStyle(currentTheme, isActive, color)}
            >
              <span style={iconStyle}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const containerStyle = (theme) => ({
  position: 'fixed',
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: '0px',
  padding: '12px',
  zIndex: 1000,
  minWidth: '200px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
});

const headerStyle = (theme) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  paddingBottom: '8px',
});

const titleStyle = {
  fontSize: '13px',
  fontWeight: 'bold',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '4px',
};

const actionButtonStyle = (theme) => ({
  background: 'transparent',
  color: theme.textSecondary,
  border: `1px solid ${theme.border}`,
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '11px',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const filtersContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const filterButtonStyle = (theme, isActive, accentColor) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: isActive ? theme.surfaceElevated : theme.background,
  color: isActive ? theme.text : theme.textSecondary,
  border: `1px solid ${theme.border}`,
  borderLeft: `4px solid ${isActive ? accentColor : theme.borderDark}`,
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  opacity: isActive ? 1 : 0.5,
  textAlign: 'left',
  width: '100%',
});

const iconStyle = {
  fontSize: '14px',
};

export default NodeFilterControls;
