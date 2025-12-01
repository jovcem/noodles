import { useEffect } from 'react'
import DropZone from './components/DropZone'
import ActionButtons from './components/ActionButtons'
import ViewerPanel from './components/ViewerPanel'
import NodeEditor from './components/node-editor/NodeEditor'
import MaterialDetailView from './components/node-editor/MaterialDetailView'
import SkinDetailView from './components/node-editor/SkinDetailView'
import PropertyPanel from './components/propertyPane/PropertyPanel'
import ThemeToggle from './components/ThemeToggle'
import { useTheme } from './contexts/ThemeContext'
import { useSceneStore } from './store/sceneStore'
import { loadDemoFile } from './utils/loadDemoFile'
import { glbToNodes } from './utils/gltf/glbToNodes'
import { trackPageView } from './utils/analytics'

function App() {
  const { currentTheme } = useTheme();
  const materialDetailMode = useSceneStore((state) => state.materialDetailMode);
  const skinDetailMode = useSceneStore((state) => state.skinDetailMode);
  const loadModel = useSceneStore((state) => state.loadModel);
  const setNodes = useSceneStore((state) => state.setNodes);
  const setEdges = useSceneStore((state) => state.setEdges);
  const setSceneData = useSceneStore((state) => state.setSceneData);

  // Track page view on mount
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  // Load demo file if ?demo parameter is present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldLoadDemo = searchParams.has('demo');

    if (shouldLoadDemo) {
      loadDemoFile()
        .then(async (file) => {
          if (file) {
            // Create object URL for the model viewer
            const modelUrl = URL.createObjectURL(file);
            loadModel(modelUrl);

            // Parse GLB and generate graph
            const result = await glbToNodes(file);
            setNodes(result.nodes);
            setEdges(result.edges);
            setSceneData(result.sceneData);
          }
        })
        .catch((error) => {
          console.error('Error loading demo file:', error);
        });
    }
  }, [loadModel, setNodes, setEdges, setSceneData]);

  return (
    <div className="app-container" style={{ backgroundColor: currentTheme.background }}>
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '20px',
        fontSize: '12px',
        opacity: 0.4,
        fontWeight: 'normal',
        color: currentTheme.textSecondary,
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        noodles v.0.1
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch',
      }}>
        <div style={{ flex: 1 }}>
          <DropZone />
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <ActionButtons />
          <ThemeToggle />
        </div>
      </div>

      <div className="split-container">
        <div className="viewer-panel" style={{
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRight: 'none'
        }}>
          <ViewerPanel />
        </div>

        <div className="editor-panel" style={{
          position: 'relative',
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`
        }}>
          {materialDetailMode ? (
            <MaterialDetailView />
          ) : skinDetailMode ? (
            <SkinDetailView />
          ) : (
            <>
              <NodeEditor />
              <PropertyPanel />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
