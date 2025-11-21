# Theme Configuration Guide

This project supports both **dark** and **light** themes with easily configurable colors.

## Quick Start

Users can toggle between dark and light themes using the theme toggle button in the top-right corner of the application. The theme preference is automatically saved to localStorage.

## Customizing Theme Colors

All theme colors are centrally configured in one file:

**[src/constants/themeConfig.js](src/constants/themeConfig.js)**

### Dark Theme Configuration

To customize the dark theme, edit the `DARK_THEME` object:

```javascript
export const DARK_THEME = {
  // Primary brand color (buttons, highlights)
  primary: '#646cff',

  // Background colors
  background: '#1a1a1a',      // Main app background
  surface: '#2a2a2a',         // Cards, panels
  surfaceElevated: '#323232', // Elevated surfaces

  // Border colors
  border: '#444',             // Standard borders
  borderLight: '#333',        // Lighter borders
  borderDark: '#222',         // Darker borders

  // Text colors
  text: '#ffffff',            // Primary text
  textSecondary: '#888888',   // Secondary text
  textTertiary: '#aaaaaa',    // Tertiary text

  // Error/warning colors
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.5)',

  // Interactive states
  hover: 'rgba(255, 255, 255, 0.1)',
  active: 'rgba(255, 255, 255, 0.15)',
  disabled: 'rgba(255, 255, 255, 0.3)',
};
```

### Light Theme Configuration

To customize the light theme, edit the `LIGHT_THEME` object:

```javascript
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
```

### Node Type Colors

Node type colors are shared across both themes and can be customized in the `NODE_COLORS` object:

```javascript
export const NODE_COLORS = {
  node: '#646cff',      // Scene nodes (blue)
  mesh: '#4ade80',      // Mesh nodes (green)
  material: '#f59e0b',  // Material nodes (orange)
};
```

## How Themes Work

1. **Theme Context**: The `ThemeProvider` in [src/contexts/ThemeContext.jsx](src/contexts/ThemeContext.jsx) manages the current theme state
2. **Theme Hook**: Components use `useTheme()` to access the current theme:
   ```javascript
   import { useTheme } from '../contexts/ThemeContext';

   function MyComponent() {
     const { currentTheme, toggleTheme } = useTheme();

     return (
       <div style={{ backgroundColor: currentTheme.background }}>
         {/* content */}
       </div>
     );
   }
   ```
3. **Persistence**: Theme preference is saved to localStorage and restored on page load

## Adding New Theme Colors

To add a new color to both themes:

1. Add the color to both `DARK_THEME` and `LIGHT_THEME` objects in [src/constants/themeConfig.js](src/constants/themeConfig.js)
2. Use it in components via `currentTheme.yourNewColor`

Example:
```javascript
// In themeConfig.js
export const DARK_THEME = {
  // ... existing colors
  success: '#10b981',
};

export const LIGHT_THEME = {
  // ... existing colors
  success: '#059669',
};

// In your component
const { currentTheme } = useTheme();
<button style={{ backgroundColor: currentTheme.success }}>
  Success!
</button>
```

## Tips for Choosing Colors

- **Contrast**: Ensure sufficient contrast between text and background colors (WCAG AA: 4.5:1 minimum)
- **Consistency**: Use the same color families across light and dark themes
- **Accessibility**: Test your theme with colorblind simulators
- **Semantic Meaning**: Use consistent colors for similar UI elements (e.g., error is always red)

## Testing Themes

1. Start the development server: `npm run dev`
2. Click the theme toggle button in the top-right corner
3. Verify all UI elements are visible and readable in both themes
4. Check that your changes persist after page refresh
