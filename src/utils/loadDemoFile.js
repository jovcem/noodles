/**
 * Loads a demo GLB file from the public folder
 * @param {string} filename - The name of the demo file to load
 * @returns {Promise<File|null>} - A File object or null if loading fails
 */
export async function loadDemoFile(filename = 'hornet.glb') {
  try {
    // Use import.meta.env.BASE_URL to handle base path correctly
    const basePath = import.meta.env.BASE_URL || '/';
    const fullPath = `${basePath}/${filename}`;
    console.log('Loading demo file from:', fullPath);
    const response = await fetch(fullPath);

    if (!response.ok) {
      console.error(`Failed to load demo file: ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();

    // Convert Blob to File object for compatibility with existing pipeline
    const file = new File([blob], filename, {
      type: 'model/gltf-binary',
      lastModified: Date.now()
    });

    return file;
  } catch (error) {
    console.error('Error loading demo file:', error);
    return null;
  }
}
