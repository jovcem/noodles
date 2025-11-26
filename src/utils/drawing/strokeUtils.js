/**
 * Stroke utility functions for perfect-freehand integration
 */

/**
 * Converts an array of points from perfect-freehand's getStroke()
 * into an SVG path data string
 *
 * @param {number[][]} points - Array of [x, y] coordinate pairs
 * @returns {string} SVG path data string (e.g., "M 10,20 L 30,40 Z")
 */
export function getSvgPathFromStroke(points) {
  if (!points.length) return '';

  const d = points.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];

    if (i === 0) {
      return `M ${x0.toFixed(2)},${y0.toFixed(2)} L`;
    }

    return `${acc} ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }, '');

  return d + ' Z';
}
