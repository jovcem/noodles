import { useState } from 'react';
import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { useSceneStore } from '../../store/sceneStore';
import { getDocument } from '../../utils/gltf/gltfExporter';
import { exportIsolatedGLB } from '../../utils/gltf/separator';
import { useTheme } from '../../contexts/ThemeContext';

function MeshProperties({ data }) {
  const { currentTheme } = useTheme();
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles(currentTheme);

  const [isLoading, setIsLoading] = useState(false);
  const isolationMode = useSceneStore((state) => state.isolationMode);
  const isolatedMeshId = useSceneStore((state) => state.isolatedMeshId);
  const setIsolationMode = useSceneStore((state) => state.setIsolationMode);
  const exitIsolationMode = useSceneStore((state) => state.exitIsolationMode);

  const handleIsolationToggle = async () => {
    if (isolationMode && isolatedMeshId === data.id) {
      // Exit isolation mode
      exitIsolationMode();
    } else {
      // Enter isolation mode
      setIsLoading(true);
      try {
        const document = getDocument();
        if (!document) {
          console.error('No document loaded');
          alert('No GLTF document loaded. Please load a model first.');
          return;
        }

        // Export isolated mesh with grey material
        const isolatedBlobUrl = await exportIsolatedGLB(document, data.id, true);

        // Update store
        setIsolationMode(data.id, isolatedBlobUrl);
      } catch (error) {
        console.error('Error isolating mesh:', error);
        alert(`Failed to isolate mesh: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isCurrentlyIsolated = isolationMode && isolatedMeshId === data.id;

  const buttonStyle = {
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: isCurrentlyIsolated ? '#ff6b6b' : NODE_COLORS.mesh,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    transition: 'background-color 0.2s',
    opacity: isLoading ? 0.6 : 1,
  };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.mesh}` }}>Mesh</div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
        {data.primitiveCount !== undefined && (
          <PropertyRow label="Primitives" value={data.primitiveCount} />
        )}
        {data.materialIds && data.materialIds.length > 0 && (
          <PropertyRow label="Materials" value={data.materialIds.length} />
        )}
      </div>

      {data.materialIds && data.materialIds.length > 0 && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>Materials</div>
          {data.materialIds.map((materialId, index) => (
            <div key={index} style={listItemStyle}>
              {materialId}
            </div>
          ))}
        </div>
      )}

      <div style={propertyGroupStyle}>
        <button
          onClick={handleIsolationToggle}
          disabled={isLoading}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          {isLoading
            ? 'Processing...'
            : isCurrentlyIsolated
            ? 'Exit Isolation'
            : 'View Isolated'}
        </button>
      </div>
    </div>
  );
}

export default MeshProperties;
