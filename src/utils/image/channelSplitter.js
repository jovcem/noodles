/**
 * Utility for splitting RGB channels from an image
 * Commonly used for ORM (Occlusion, Roughness, Metalness) texture splitting
 */

/**
 * Loads an image from a data URL or blob URL
 * @param {string} imageUrl - The URL to load
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Creates a grayscale image from a single channel of the source image data
 * @param {ImageData} imageData - The source image data
 * @param {number} channelIndex - The channel to extract (0=R, 1=G, 2=B)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Promise<string>} Blob URL of the grayscale channel image
 */
async function createChannelImage(imageData, channelIndex, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Create new image data for the channel
  const newImageData = ctx.createImageData(width, height);
  const sourceData = imageData.data;
  const targetData = newImageData.data;

  // Extract channel and create grayscale image
  for (let i = 0; i < sourceData.length; i += 4) {
    const value = sourceData[i + channelIndex];
    targetData[i] = value;     // R
    targetData[i + 1] = value; // G
    targetData[i + 2] = value; // B
    targetData[i + 3] = 255;   // A (full opacity)
  }

  // Put the new image data on canvas
  ctx.putImageData(newImageData, 0, 0);

  // Convert canvas to blob URL
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png');
  });
}

/**
 * Splits an image into its RGB channels as separate grayscale images
 * @param {string} imageDataUrl - The source image URL (blob URL or data URL)
 * @param {Object} dimensions - Object with width and height properties
 * @returns {Promise<Object>} Object with red, green, blue properties containing blob URLs
 */
export async function splitRGBChannels(imageDataUrl, dimensions) {
  try {
    // Load the image
    const img = await loadImage(imageDataUrl);

    // Use provided dimensions or fall back to image natural dimensions
    const width = dimensions?.width || img.naturalWidth;
    const height = dimensions?.height || img.naturalHeight;

    // Create canvas and get pixel data
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Split into R, G, B channels
    const [red, green, blue] = await Promise.all([
      createChannelImage(imageData, 0, width, height),   // Red channel (Occlusion)
      createChannelImage(imageData, 1, width, height),   // Green channel (Roughness)
      createChannelImage(imageData, 2, width, height),   // Blue channel (Metalness)
    ]);

    return {
      red,
      green,
      blue,
    };
  } catch (error) {
    console.error('Error splitting RGB channels:', error);
    throw error;
  }
}
