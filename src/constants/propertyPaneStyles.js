/**
 * Property pane styles that adapt to the current theme
 * Use these functions by passing currentTheme from useTheme()
 */
export const propertyPaneStyles = (currentTheme) => ({
  sectionStyle: {
    marginBottom: '15px',
  },

  headerStyle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: currentTheme.text,
    paddingLeft: '10px',
    paddingBottom: '5px',
  },

  propertyGroupStyle: {
    marginBottom: '15px',
  },

  rowStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${currentTheme.borderLight}`,
  },

  labelStyle: {
    color: currentTheme.textSecondary,
    fontSize: '13px',
  },

  valueStyle: {
    color: currentTheme.text,
    fontSize: '13px',
    fontWeight: '500',
  },

  subHeaderStyle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: currentTheme.textTertiary,
    marginBottom: '8px',
  },

  listItemStyle: {
    fontSize: '12px',
    color: currentTheme.textSecondary,
    padding: '4px 0',
    paddingLeft: '10px',
  },

  // Material-specific styles
  colorRowStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${currentTheme.borderLight}`,
  },

  colorPreviewStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  colorSwatchStyle: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: `1px solid ${currentTheme.border}`,
  },
});
