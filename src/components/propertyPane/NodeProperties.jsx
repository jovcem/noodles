import PropertyRow from './PropertyRow';
import TransformProperties from './TransformProperties';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { useTheme } from '../../contexts/ThemeContext';

function NodeProperties({ data }) {
  const { currentTheme } = useTheme();
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles(currentTheme);

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.node}` }}>Node</div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
        {data.meshId && <PropertyRow label="Mesh" value={data.meshId} />}
        {data.children && data.children.length > 0 && (
          <PropertyRow label="Children" value={data.children.length} />
        )}
      </div>

      <TransformProperties data={data} />

      {data.children && data.children.length > 0 && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>Children</div>
          {data.children.map((childId, index) => (
            <div key={index} style={listItemStyle}>
              {childId}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NodeProperties;
