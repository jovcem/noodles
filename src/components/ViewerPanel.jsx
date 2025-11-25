import { useTheme } from '../contexts/ThemeContext';
import { useSceneStore } from '../store/sceneStore';
import ModelViewer from './3d-viewer/ModelViewer';
import ImageViewer from './2d-viewer/ImageViewer';
import Toolbar from './shared/Toolbar';

function ViewerPanel() {
  const viewerMode = useSceneStore((state) => state.viewerMode);
  const setViewerMode = useSceneStore((state) => state.setViewerMode);

  const contentStyle = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Toolbar>
        <Toolbar.Button
          isActive={viewerMode === '3d'}
          onClick={() => setViewerMode('3d')}
        >
          3D Viewer
        </Toolbar.Button>
        <Toolbar.Button
          isActive={viewerMode === '2d'}
          onClick={() => setViewerMode('2d')}
        >
          2D Viewer
        </Toolbar.Button>
      </Toolbar>
      <div style={contentStyle}>
        {viewerMode === '2d' ? <ImageViewer /> : <ModelViewer />}
      </div>
    </div>
  );
}

export default ViewerPanel;
