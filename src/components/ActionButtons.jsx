import { useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { THEME_COLORS } from '../constants/colorConstants';
import { exportToGLTF } from '../utils/gltfExporter';

function ActionButtons() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const sceneData = useSceneStore((state) => state.sceneData);

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
          ...buttonStyle,
          opacity: !sceneData || isExporting ? 0.5 : 1,
          cursor: !sceneData || isExporting ? 'not-allowed' : 'pointer',
        }}
      >
        {isExporting ? 'Exporting...' : 'Save to GLTF'}
      </button>

      {exportError && (
        <div style={errorStyle}>
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
  padding: '10px 20px',
};

const buttonStyle = {
  backgroundColor: THEME_COLORS.primary,
  color: THEME_COLORS.text,
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '42px',
};

const errorStyle = {
  padding: '8px 12px',
  backgroundColor: THEME_COLORS.errorBg,
  border: `1px solid ${THEME_COLORS.errorBorder}`,
  borderRadius: '6px',
  color: THEME_COLORS.error,
  fontSize: '12px',
};

export default ActionButtons;
