import { propertyPaneStyles } from '../../constants/propertyPaneStyles';

function PropertyRow({ label, value }) {
  return (
    <div style={propertyPaneStyles.rowStyle}>
      <span style={propertyPaneStyles.labelStyle}>{label}:</span>
      <span style={propertyPaneStyles.valueStyle}>{value}</span>
    </div>
  );
}

export default PropertyRow;
