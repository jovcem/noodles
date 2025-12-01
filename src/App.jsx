import { useEffect } from 'react'
import DropZone from './components/DropZone'
import ActionButtons from './components/ActionButtons'
import ThemeToggle from './components/ThemeToggle'
import Layout1 from './components/layout/Layout1'
import Layout2 from './components/layout/Layout2'
import LayoutSelector from './components/layout/LayoutSelector'
import { useTheme } from './contexts/ThemeContext'
import { useSceneStore } from './store/sceneStore'
import { loadDemoFile } from './utils/loadDemoFile'
import { glbToNodes } from './utils/gltf/glbToNodes'
import { trackPageView } from './utils/analytics'

function App() {
  const { currentTheme } = useTheme();
  const currentLayout = useSceneStore((state) => state.currentLayout);
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

      <LayoutSelector />

      {currentLayout === 1 ? <Layout1 /> : <Layout2 />}
    </div>
  )
}

export default App
