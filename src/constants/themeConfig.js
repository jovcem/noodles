/**
 * Theme Configuration
 *
 * This file contains all theme definitions for the application.
 * You can easily customize colors by editing the values in DARK_THEME and LIGHT_THEME.
 */

// Node type colors (shared across themes)
export const NODE_COLORS = {
  node: '#646cff',
  mesh: '#4ade80',
  material: '#f59e0b',
  skin: '#a855f7',
  animation: '#FF6B9D',
};

// Node subtype accent colors (for left border)
export const NODE_SUBTYPE_COLORS = {
  'transform': '#888888',     // Gray - Transform-only/group nodes
  'empty': '#666666',         // Dark gray - Empty nodes
  'mesh': '#4ade80',          // Green - Mesh nodes (matches mesh color)
  'camera': '#3b82f6',        // Blue - Camera nodes
  'skinned-mesh': '#fb923c',  // Orange - Skinned mesh nodes
  'joint': '#a855f7',         // Purple - Joint/bone nodes (part of skeleton)
  'light': '#fbbf24',         // Yellow - Light nodes (for future use)
};

// Node subtype icons
export const NODE_SUBTYPE_ICONS = {
  'transform': '📦',
  'empty': '⭘',
  'mesh': '🎭',
  'camera': '📷',
  'skinned-mesh': '🦴',
  'joint': '🦴',
  'light': '💡',
};

/**
 * Dark Theme Configuration
 * Customize these values to change the dark theme appearance
 */
export const DARK_THEME = {
  // Primary brand color
  primary: '#646cff',

  // Background colors
  background: '#1a1a1a',
  surface: '#2a2a2a',
  surfaceElevated: '#323232',

  // Border colors
  border: '#444',
  borderLight: '#333',
  borderDark: '#222',

  // Text colors
  text: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#aaaaaa',

  // Error/warning colors
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.5)',

  // Interactive states
  hover: 'rgba(255, 255, 255, 0.1)',
  active: 'rgba(255, 255, 255, 0.15)',
  disabled: 'rgba(255, 255, 255, 0.3)',
};

/**
 * Light Theme Configuration
 * Customize these values to change the light theme appearance
 */
export const LIGHT_THEME = {
  // Primary brand color
  primary: '#4f46e5',

  // Background colors
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceElevated: '#e5e5e5',

  // Border colors
  border: '#d4d4d4',
  borderLight: '#e5e5e5',
  borderDark: '#a3a3a3',

  // Text colors
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#525252',

  // Error/warning colors
  error: '#dc2626',
  errorBg: 'rgba(220, 38, 38, 0.1)',
  errorBorder: 'rgba(220, 38, 38, 0.3)',

  // Interactive states
  hover: 'rgba(0, 0, 0, 0.05)',
  active: 'rgba(0, 0, 0, 0.1)',
  disabled: 'rgba(0, 0, 0, 0.3)',
};

/**
 * Theme definitions
 */
export const THEMES = {
  dark: DARK_THEME,
  light: LIGHT_THEME,
};

/**
 * Gets the color for a specific node type
 * @param {string} nodeType - Type of node ('node', 'mesh', 'material', 'skin')
 * @returns {string} Hex color code
 */
export function getNodeColor(nodeType) {
  return NODE_COLORS[nodeType] || NODE_COLORS.node;
}

/**
 * Gets the accent color for a specific node subtype
 * @param {string} subType - Subtype of node ('transform', 'mesh', 'camera', 'skinned-mesh', 'joint', 'light', 'empty')
 * @returns {string} Hex color code
 */
export function getNodeSubtypeColor(subType) {
  return NODE_SUBTYPE_COLORS[subType] || NODE_SUBTYPE_COLORS.transform;
}

/**
 * Gets the icon for a specific node subtype
 * @param {string} subType - Subtype of node ('transform', 'mesh', 'camera', 'skinned-mesh', 'joint', 'light', 'empty')
 * @returns {string} Icon/emoji string
 */
export function getNodeSubtypeIcon(subType) {
  return NODE_SUBTYPE_ICONS[subType] || NODE_SUBTYPE_ICONS.transform;
}
