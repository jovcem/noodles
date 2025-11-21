import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';

function MeshProperties({ data }) {
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles;

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
    </div>
  );
}

export default MeshProperties;
