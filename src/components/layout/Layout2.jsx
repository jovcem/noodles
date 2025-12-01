import ViewerPanel from '../ViewerPanel';
import NodeEditor from '../node-editor/NodeEditor';
import MaterialDetailView from '../node-editor/MaterialDetailView';
import SkinDetailView from '../node-editor/SkinDetailView';
import PropertyPanel from '../propertyPane/PropertyPanel';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneStore } from '../../store/sceneStore';

function Layout2() {
  const { currentTheme } = useTheme();
  const materialDetailMode = useSceneStore((state) => state.materialDetailMode);
  const skinDetailMode = useSceneStore((state) => state.skinDetailMode);

  return (
    <div className="split-container">
      {/* Left 80% - Vertical split */}
      <div style={{
        flex: 4, // 80% = 4/5
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Top: Viewer */}
        <div className="viewer-panel" style={{
          flex: 1,
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderBottom: 'none',
          overflow: 'hidden',
        }}>
          <ViewerPanel key="viewer-panel" />
        </div>

        {/* Bottom: Node Editor */}
        <div style={{
          flex: 1,
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          overflow: 'hidden',
        }}>
          {materialDetailMode ? (
            <MaterialDetailView key="material-detail" />
          ) : skinDetailMode ? (
            <SkinDetailView key="skin-detail" />
          ) : (
            <NodeEditor key="node-editor" />
          )}
        </div>
      </div>

      {/* Right 20% - Property Panel only */}
      <div className="editor-panel" style={{
        flex: 1, // 20% = 1/5
        backgroundColor: currentTheme.background,
        border: `1px solid ${currentTheme.border}`,
        borderLeft: 'none',
      }}>
        <PropertyPanel key="property-panel" inline={true} />
      </div>
    </div>
  );
}

export default Layout2;
