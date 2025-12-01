import ViewerPanel from '../ViewerPanel';
import NodeEditor from '../node-editor/NodeEditor';
import MaterialDetailView from '../node-editor/MaterialDetailView';
import SkinDetailView from '../node-editor/SkinDetailView';
import PropertyPanel from '../propertyPane/PropertyPanel';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneStore } from '../../store/sceneStore';

function Layout1() {
  const { currentTheme } = useTheme();
  const materialDetailMode = useSceneStore((state) => state.materialDetailMode);
  const skinDetailMode = useSceneStore((state) => state.skinDetailMode);

  return (
    <div className="split-container">
      <div className="viewer-panel" style={{
        backgroundColor: currentTheme.background,
        border: `1px solid ${currentTheme.border}`,
        borderRight: 'none'
      }}>
        <ViewerPanel key="viewer-panel" />
      </div>

      <div className="editor-panel" style={{
        position: 'relative',
        backgroundColor: currentTheme.background,
        border: `1px solid ${currentTheme.border}`
      }}>
        {materialDetailMode ? (
          <MaterialDetailView key="material-detail" />
        ) : skinDetailMode ? (
          <SkinDetailView key="skin-detail" />
        ) : (
          <>
            <NodeEditor key="node-editor" />
            <PropertyPanel />
          </>
        )}
      </div>
    </div>
  );
}

export default Layout1;
