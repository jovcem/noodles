import { useState, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { glbToNodes } from '../utils/gltf/glbToNodes';
import { validateGLTFFile } from '../utils/fileValidation';
import { useTheme } from '../contexts/ThemeContext';
import { trackFileUpload } from '../utils/analytics';

function DropZone({ overlay = false }) {
  const { currentTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState('');
  const currentUrlRef = useRef(null);

  const loadModel = useSceneStore((state) => state.loadModel);
  const currentModel = useSceneStore((state) => state.currentModel);
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

  // Global drag detection for overlay mode
  useEffect(() => {
    if (!overlay) return;

    const handleGlobalDragEnter = (e) => {
      // Check if dragging files
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleGlobalDragLeave = (e) => {
      // Only hide if leaving the window
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleGlobalDrop = () => {
      setIsDragging(false);
    };

    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragend', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragend', handleGlobalDrop);
    };
  }, [overlay]);

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

        // Track successful file upload
        trackFileUpload(file.name.endsWith('.glb') ? 'glb' : 'gltf');
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
    const inputId = overlay ? 'file-input-overlay' : 'file-input';
    document.getElementById(inputId).click();
  };

  // Overlay mode (for 3D viewer)
  if (overlay) {
    const hasModel = currentModel !== null;
    const showDropZone = !hasModel || isDragging;

    return (
      <>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: showDropZone ? 'auto' : 'none',
            zIndex: showDropZone ? 10 : 1,
            opacity: showDropZone ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            onClick={showDropZone ? handleClick : undefined}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDragging
                ? currentTheme.active
                : hasModel
                  ? 'rgba(0, 0, 0, 0.7)'
                  : currentTheme.background,
              border: isDragging ? `3px dashed ${currentTheme.primary}` : 'none',
              cursor: showDropZone ? 'pointer' : 'default',
              gap: '20px',
              pointerEvents: showDropZone ? 'auto' : 'none',
            }}
          >
            <div style={{ fontSize: '48px', opacity: 0.5 }}>📦</div>
            <div style={{ fontSize: '18px', color: currentTheme.text, fontWeight: 'bold' }}>
              {hasModel && isDragging ? 'Drop to load new model' : 'Drop GLB file here'}
            </div>
            <div style={{ fontSize: '14px', color: currentTheme.textSecondary }}>
              or click to browse
            </div>
          </div>
        </div>

        <input
          id="file-input-overlay"
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {error && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 15px',
              backgroundColor: currentTheme.errorBg,
              border: `1px solid ${currentTheme.errorBorder}`,
              borderRadius: '6px',
              color: currentTheme.error,
              fontSize: '13px',
              zIndex: 1000,
              maxWidth: '80%',
            }}
          >
            {error}
          </div>
        )}
      </>
    );
  }

  // Original horizontal strip mode (for top of app)
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
