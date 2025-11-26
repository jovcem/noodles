import { useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { useTheme } from '../contexts/ThemeContext';
import { exportToGLTF } from '../utils/gltf/gltfExporter';

function ActionButtons() {
  const { currentTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const sceneData = useSceneStore((state) => state.sceneData);
  const enterDrawingMode = useSceneStore((state) => state.enterDrawingMode);

  const handleExport = async () => {
    if (!sceneData) {
      setExportError('No model loaded');
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      await exportToGLTF();
      // Success - maybe show a brief success message
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={handleExport}
        disabled={!sceneData || isExporting}
        style={{
          ...buttonStyle(currentTheme),
          opacity: !sceneData || isExporting ? 0.5 : 1,
          cursor: !sceneData || isExporting ? 'not-allowed' : 'pointer',
        }}
      >
        {isExporting ? 'Exporting...' : 'Save to GLTF'}
      </button>

      <button
        onClick={enterDrawingMode}
        style={{
          ...buttonStyle(currentTheme),
          opacity: 1,
          cursor: 'pointer',
        }}
      >
        ✏️ Draw
      </button>

      {exportError && (
        <div style={errorStyle(currentTheme)}>
          {exportError}
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '10px 0',
};

const buttonStyle = (currentTheme) => ({
  backgroundColor: currentTheme.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const errorStyle = (currentTheme) => ({
  padding: '8px 12px',
  backgroundColor: currentTheme.errorBg,
  border: `1px solid ${currentTheme.errorBorder}`,
  borderRadius: '6px',
  color: currentTheme.error,
  fontSize: '12px',
});

export default ActionButtons;
