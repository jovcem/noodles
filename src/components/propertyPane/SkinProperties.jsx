import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';

function SkinProperties({ data }) {
  const { currentTheme } = useTheme();
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles(currentTheme);

  const sceneData = useSceneStore((state) => state.sceneData);
  const enterSkinDetail = useSceneStore((state) => state.enterSkinDetail);

  // Get joint node names
  const jointNodes = data.joints?.map((jointId) => {
    const node = sceneData?.nodes.find((n) => n.id === jointId);
    return node ? { id: jointId, name: node.name } : null;
  }).filter(Boolean) || [];

  // Get skeleton root node name
  const skeletonRootNode = data.skeleton
    ? sceneData?.nodes.find((n) => n.id === data.skeleton)
    : null;

  const handleViewHierarchy = () => {
    enterSkinDetail(data);
  };

  const buttonStyle = {
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: NODE_COLORS.skin,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    transition: 'background-color 0.2s',
  };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.skin}` }}>Skin</div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
        <PropertyRow label="Joints" value={data.joints?.length || 0} />
        {data.inverseBindMatricesCount !== null && (
          <PropertyRow label="Matrices" value={data.inverseBindMatricesCount} />
        )}
      </div>

      {skeletonRootNode && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>Skeleton Root</div>
          <div style={listItemStyle}>
            🎯 {skeletonRootNode.name}
          </div>
        </div>
      )}

      {jointNodes.length > 0 && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>Joints ({jointNodes.length})</div>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '4px',
            padding: '4px',
          }}>
            {jointNodes.map((joint, index) => (
              <div key={index} style={{
                ...listItemStyle,
                fontSize: '12px',
                padding: '4px 8px',
              }}>
                🦴 {joint.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={propertyGroupStyle}>
        <button
          onClick={handleViewHierarchy}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          View Skeleton Hierarchy
        </button>
      </div>
    </div>
  );
}

export default SkinProperties;
