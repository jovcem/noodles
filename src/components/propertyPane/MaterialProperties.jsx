import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { formatColor, formatFloat } from '../../utils/formatters';

function MaterialProperties({ data }) {
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    colorRowStyle,
    labelStyle,
    valueStyle,
    colorPreviewStyle,
    colorSwatchStyle,
  } = propertyPaneStyles;

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.material}` }}>Material</div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
      </div>

      <div style={propertyGroupStyle}>
        <div style={subHeaderStyle}>PBR Properties</div>
        {data.baseColor && (
          <div style={colorRowStyle}>
            <span style={labelStyle}>Base Color:</span>
            <div style={colorPreviewStyle}>
              <div
                style={{
                  ...colorSwatchStyle,
                  backgroundColor: formatColor(data.baseColor),
                }}
              />
              <span style={valueStyle}>{formatColor(data.baseColor)}</span>
            </div>
          </div>
        )}
        <PropertyRow label="Metallic" value={formatFloat(data.metallic)} />
        <PropertyRow label="Roughness" value={formatFloat(data.roughness)} />
      </div>
    </div>
  );
}

export default MaterialProperties;
