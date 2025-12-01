import { useSceneStore } from '../../store/sceneStore';
import ModelViewerWrapper from './ModelViewerWrapper';
import DropZone from '../DropZone';

function ModelViewer() {
  const currentModel = useSceneStore((state) => state.currentModel);

  return (
    <div style={containerStyle}>
      <ModelViewerWrapper modelUrl={currentModel} />
      <DropZone overlay={true} />
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

export default ModelViewer;
