import { useState, useEffect, useRef } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { useTheme } from '../contexts/ThemeContext';
import { trackFileUpload } from '../utils/analytics';
import { importGLBFromFile } from '../utils/gltf/importer/glbImporter';
import { importGLTFWithTextures } from '../utils/gltf/importer/gltfImporter';
import { importFromURL, isValidURL } from '../utils/gltf/importer/urlImporter';

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

  // Cmd+V paste handler for URL import
  useEffect(() => {
    if (!overlay) return;

    const handlePaste = async (e) => {
      // Get clipboard text
      const clipboardText = e.clipboardData?.getData('text');

      if (!clipboardText) return;

      // Check if it's a valid URL
      if (!isValidURL(clipboardText)) return;

      // Prevent default paste behavior
      e.preventDefault();

      // Import from URL
      await handleURLImport(clipboardText);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
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
    if (!files || files.length === 0) return;

    // Clear previous error
    setError('');
    setIsLoadingGraph(true);

    try {
      let result;

      // Detect import type
      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.glb')) {
        // Single GLB file
        result = await importGLBFromFile(files[0]);
      } else {
        // GLTF with textures or multiple files
        result = await importGLTFWithTextures(files);
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Cleanup previous URL
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
      currentUrlRef.current = result.modelUrl;

      // Update store
      loadModel(result.modelUrl);
      setNodes(result.nodes);
      setEdges(result.edges);
      setSceneData(result.sceneData);
      setUploadedFileName(result.metadata.filename || files[0].name);

      // Track successful upload
      trackFileUpload(result.metadata.fileType);
    } catch (error) {
      console.error('Import failed:', error);
      setError(`Import failed: ${error.message}`);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const handleURLImport = async (url) => {
    setIsLoadingGraph(true);
    setError('');

    try {
      const result = await importFromURL(url);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Cleanup previous URL
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
      currentUrlRef.current = result.modelUrl;

      // Update store
      loadModel(result.modelUrl);
      setNodes(result.nodes);
      setEdges(result.edges);
      setSceneData(result.sceneData);
      setUploadedFileName(result.metadata.filename || 'model');

      // Track successful upload
      trackFileUpload(result.metadata.fileType);
    } catch (error) {
      console.error('URL import failed:', error);
      setError(`URL import failed: ${error.message}`);
    } finally {
      setIsLoadingGraph(false);
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
              {hasModel && isDragging ? 'Drop to load new model' : 'Drop GLB/GLTF file here'}
            </div>
            <div style={{ fontSize: '14px', color: currentTheme.textSecondary }}>
              or click to browse • Cmd+V to paste URL
            </div>
          </div>
        </div>

        <input
          id="file-input-overlay"
          type="file"
          accept=".glb,.gltf,.png,.jpg,.jpeg,.bin"
          multiple
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
          accept=".glb,.gltf,.png,.jpg,.jpeg,.bin"
          multiple
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
