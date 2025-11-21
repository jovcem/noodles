import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { useTheme } from '../../contexts/ThemeContext';

function PropertyRow({ label, value }) {
  const { currentTheme } = useTheme();
  const styles = propertyPaneStyles(currentTheme);

  return (
    <div style={styles.rowStyle}>
      <span style={styles.labelStyle}>{label}:</span>
      <span style={styles.valueStyle}>{value}</span>
    </div>
  );
}

export default PropertyRow;
