import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { useTheme } from '../../contexts/ThemeContext';

function formatVector3(vector) {
  if (!vector || vector.length !== 3) return 'N/A';
  const [x, y, z] = vector;
  const formatNum = (num) => num.toFixed(2);
  return `${formatNum(x)}, ${formatNum(y)}, ${formatNum(z)}`;
}

function formatQuaternion(quaternion) {
  if (!quaternion || quaternion.length !== 4) return 'N/A';
  const [x, y, z, w] = quaternion;
  const formatNum = (num) => num.toFixed(2);
  return `${formatNum(x)}, ${formatNum(y)}, ${formatNum(z)}, ${formatNum(w)}`;
}

function TransformProperties({ data }) {
  const { currentTheme } = useTheme();
  const { propertyGroupStyle, subHeaderStyle } = propertyPaneStyles(currentTheme);

  const hasTransforms = data.translation || data.rotation || data.scale;
  const hasWorldTransforms = data.worldTranslation || data.worldRotation || data.worldScale;

  if (!hasTransforms && !hasWorldTransforms) return null;

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    marginTop: '8px',
  };

  const tdStyle = {
    padding: '8px 6px',
    borderBottom: `1px solid ${currentTheme.border}`,
    color: currentTheme.text,
    fontSize: '12px',
  };

  const labelStyle = {
    ...tdStyle,
    color: currentTheme.textSecondary,
    fontWeight: '500',
    width: '30%',
  };

  const valueStyle = {
    ...tdStyle,
    fontFamily: 'monospace',
  };

  return (
    <>
      {hasTransforms && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>Local Transform</div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelStyle}>Translation</td>
                <td style={valueStyle}>{formatVector3(data.translation)}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Rotation</td>
                <td style={valueStyle}>{formatQuaternion(data.rotation)}</td>
              </tr>
              <tr>
                <td style={{ ...labelStyle, borderBottom: 'none' }}>Scale</td>
                <td style={{ ...valueStyle, borderBottom: 'none' }}>{formatVector3(data.scale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {hasWorldTransforms && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>World Transform</div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelStyle}>Translation</td>
                <td style={valueStyle}>{formatVector3(data.worldTranslation)}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Rotation</td>
                <td style={valueStyle}>{formatQuaternion(data.worldRotation)}</td>
              </tr>
              <tr>
                <td style={{ ...labelStyle, borderBottom: 'none' }}>Scale</td>
                <td style={{ ...valueStyle, borderBottom: 'none' }}>{formatVector3(data.worldScale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default TransformProperties;
