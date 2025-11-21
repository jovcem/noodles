import { useSceneStore } from '../../store/sceneStore';
import ModelViewerWrapper from './ModelViewerWrapper';

function ModelViewer() {
  const currentModel = useSceneStore((state) => state.currentModel);

  return (
    <div style={containerStyle}>
      <ModelViewerWrapper modelUrl={currentModel} />
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

export default ModelViewer;
