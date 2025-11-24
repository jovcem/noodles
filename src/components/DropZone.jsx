import { useState, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { glbToNodes } from '../utils/gltf/glbToNodes';
import { validateGLTFFile } from '../utils/fileValidation';
import { useTheme } from '../contexts/ThemeContext';

function DropZone() {
  const { currentTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState('');
  const currentUrlRef = useRef(null);

  const loadModel = useSceneStore((state) => state.loadModel);
  const setNodes = useSceneStore((state) => state.setNodes);
  const setEdges = useSceneStore((state) => state.setEdges);
  const setSceneData = useSceneStore((state) => state.setSceneData);
  const setIsLoadingGraph = useSceneStore((state) => state.setIsLoadingGraph);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Clear previous error
      setError('');

      // Validate file using utility
      const validation = validateGLTFFile(file);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      // Revoke previous object URL to prevent memory leak
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }

      // Create new object URL for the file
      const modelUrl = URL.createObjectURL(file);
      currentUrlRef.current = modelUrl;

      // Update store with model URL
      loadModel(modelUrl);

      // Update UI with file name
      setUploadedFileName(file.name);

      // Parse GLB and update nodes/edges/sceneData
      try {
        setIsLoadingGraph(true);
        const { nodes, edges, sceneData } = await glbToNodes(file);
        setNodes(nodes);
        setEdges(edges);
        setSceneData(sceneData);
      } catch (error) {
        console.error('Failed to parse GLB file:', error);
        setError(`Failed to parse file: ${error.message}`);
        // Don't clear the filename on error so user knows what failed
      } finally {
        setIsLoadingGraph(false);
      }
    }
  };

  const handleClick = () => {
    document.getElementById('file-input').click();
  };

  return (
    <div style={{ margin: '10px 0 10px 20px' }}>
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          border: isDragging ? `2px dashed ${currentTheme.primary}` : `2px dashed ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '10px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? currentTheme.active : currentTheme.hover,
          transition: 'all 0.3s ease',
          maxHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
        }}
      >
        <input
          id="file-input"
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {uploadedFileName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: currentTheme.primary, fontWeight: 'bold', fontSize: '14px' }}>
              {uploadedFileName}
            </span>
            <span style={{ fontSize: '12px', color: currentTheme.textSecondary }}>
              (click or drop to change)
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: currentTheme.text }}>
            <span style={{ fontWeight: 'bold' }}>Drop GLB file here</span>
            <span style={{ color: currentTheme.textSecondary, marginLeft: '8px' }}>or click to browse</span>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 15px',
            backgroundColor: currentTheme.errorBg,
            border: `1px solid ${currentTheme.errorBorder}`,
            borderRadius: '6px',
            color: currentTheme.error,
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default DropZone;
