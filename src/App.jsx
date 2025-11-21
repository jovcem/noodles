import DropZone from './components/DropZone'
import ActionButtons from './components/ActionButtons'
import ModelViewer from './components/ModelViewer'
import NodeEditor from './components/NodeEditor'
import PropertyPanel from './components/propertyPane/PropertyPanel'

function App() {
  return (
    <div className="app-container">
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '20px',
        fontSize: '12px',
        opacity: 0.4,
        fontWeight: 'normal',
        color: '#888',
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        noodles
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
        }}>
          <ActionButtons />
        </div>
      </div>

      <div className="split-container">
        <div className="viewer-panel">
          <ModelViewer />
        </div>

        <div className="editor-panel" style={{ position: 'relative' }}>
          <NodeEditor />
          <PropertyPanel />
        </div>
      </div>
    </div>
  )
}

export default App
