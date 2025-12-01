import { useState } from 'react';
import Toolbar from '../shared/Toolbar';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';
import { exportToGLTF } from '../../utils/gltf/gltfExporter';

function LayoutSelector() {
  const { theme, currentTheme, toggleTheme } = useTheme();
  const currentLayout = useSceneStore((state) => state.currentLayout);
  const setLayout = useSceneStore((state) => state.setLayout);
  const sceneData = useSceneStore((state) => state.sceneData);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!sceneData) return;
    setIsExporting(true);
    try {
      await exportToGLTF();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const actionButtonStyle = {
    padding: '4px 12px',
    cursor: sceneData && !isExporting ? 'pointer' : 'not-allowed',
    backgroundColor: 'transparent',
    color: sceneData && !isExporting ? currentTheme.text : currentTheme.textSecondary,
    fontWeight: 600,
    fontSize: '11px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    border: 'none',
    borderRight: `1px solid ${currentTheme.border}`,
    opacity: sceneData && !isExporting ? 1 : 0.5,
  };

  const themeButtonStyle = {
    padding: '4px 12px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: currentTheme.text,
    fontWeight: 600,
    fontSize: '11px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    border: 'none',
    borderRight: `1px solid ${currentTheme.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={{
      borderTop: `1px solid ${currentTheme.border}`,
    }}>
      <div style={{
        borderBottom: 'none',
        marginBottom: '-1px',
      }}>
        <Toolbar>
          <Toolbar.Button
            isActive={currentLayout === 1}
            onClick={() => setLayout(1)}
          >
            1
          </Toolbar.Button>
          <Toolbar.Button
            isActive={currentLayout === 2}
            onClick={() => setLayout(2)}
          >
            2
          </Toolbar.Button>

          <button
            onClick={handleExport}
            disabled={!sceneData || isExporting}
            style={actionButtonStyle}
          >
            {isExporting ? 'Exporting...' : 'Save to GLTF'}
          </button>

          <button
            onClick={toggleTheme}
            style={themeButtonStyle}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </Toolbar>
      </div>
    </div>
  );
}

export default LayoutSelector;
