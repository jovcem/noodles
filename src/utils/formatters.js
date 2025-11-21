/**
 * Formats a color array [r, g, b, a] to RGBA string
 * @param {Array<number>} colorArray - Array of color values [0-1]
 * @returns {string} RGBA color string or 'N/A'
 */
export function formatColor(colorArray) {
  if (!colorArray || !Array.isArray(colorArray)) return 'N/A';
  return `rgba(${Math.round(colorArray[0] * 255)}, ${Math.round(
    colorArray[1] * 255
  )}, ${Math.round(colorArray[2] * 255)}, ${colorArray[3] || 1})`;
}

/**
 * Formats a float value to 3 decimal places
 * @param {number} value - Float value to format
 * @returns {string} Formatted float string or 'N/A'
 */
export function formatFloat(value) {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(3);
}
