import { useTheme } from '../contexts/ThemeContext';
import { useSceneStore } from '../store/sceneStore';
import ModelViewer from './3d-viewer/ModelViewer';
import ImageViewer from './2d-viewer/ImageViewer';

function ViewerPanel() {
  const { currentTheme } = useTheme();
  const viewerMode = useSceneStore((state) => state.viewerMode);
  const setViewerMode = useSceneStore((state) => state.setViewerMode);

  const tabStyle = (isActive) => ({
    padding: '4px 10px',
    cursor: 'pointer',
    backgroundColor: isActive ? currentTheme.background : 'transparent',
    color: isActive ? currentTheme.text : currentTheme.textSecondary,
    fontWeight: isActive ? 600 : 400,
    fontSize: '11px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    borderRight: `1px solid ${currentTheme.border}`,
  });

  const tabContainerStyle = {
    display: 'flex',
    gap: '0px',
    backgroundColor: currentTheme.backgroundSecondary,
    borderBottom: `1px solid ${currentTheme.border}`,
  };

  const contentStyle = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={tabContainerStyle}>
        <div
          style={tabStyle(viewerMode === '3d')}
          onClick={() => setViewerMode('3d')}
        >
          3D Viewer
        </div>
        <div
          style={tabStyle(viewerMode === '2d')}
          onClick={() => setViewerMode('2d')}
        >
          2D Viewer
        </div>
      </div>
      <div style={contentStyle}>
        {viewerMode === '2d' ? <ImageViewer /> : <ModelViewer />}
      </div>
    </div>
  );
}

export default ViewerPanel;
