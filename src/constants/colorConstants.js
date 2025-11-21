// Node type colors used in graph visualization and UI
export const NODE_COLORS = {
  node: '#646cff',
  mesh: '#4ade80',
  material: '#f59e0b',
};

// Theme colors
export const THEME_COLORS = {
  primary: '#646cff',
  background: '#1a1a1a',
  surface: '#2a2a2a',
  border: '#444',
  borderLight: '#333',
  text: '#fff',
  textSecondary: '#888',
  textTertiary: '#aaa',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.5)',
};

/**
 * Gets the color for a specific node type
 * @param {string} nodeType - Type of node ('node', 'mesh', 'material')
 * @returns {string} Hex color code
 */
export function getNodeColor(nodeType) {
  return NODE_COLORS[nodeType] || NODE_COLORS.node;
}
