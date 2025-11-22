import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSceneStore } from '../../store/sceneStore';

function ImageViewer() {
  const { currentTheme } = useTheme();
  const current2DImage = useSceneStore((state) => state.current2DImage);
  const materialDetailData = useSceneStore((state) => state.materialDetailData);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageInfo, setImageInfo] = useState(null);
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom((prevZoom) => Math.max(0.1, Math.min(10, prevZoom * delta)));
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    if (!current2DImage || !imageInfo) return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = current2DImage;
    link.download = imageInfo.name || 'texture.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load image metadata when image changes
  useEffect(() => {
    if (current2DImage) {
      const img = new Image();
      img.onload = () => {
        // Find the texture that matches this image URL
        let textureName = 'Unknown';
        let fileSize = null;

        if (materialDetailData) {
          // Search through material properties for matching texture
          const findTexture = (obj) => {
            if (!obj) return null;
            if (obj.imageDataUrl === current2DImage) return obj;
            for (let key in obj) {
              if (typeof obj[key] === 'object') {
                const result = findTexture(obj[key]);
                if (result) return result;
              }
            }
            return null;
          };

          const texture = findTexture(materialDetailData);
          if (texture) {
            textureName = texture.name || 'Unknown';
            fileSize = texture.fileSizeBytes;
          }
        }

        setImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: textureName,
          fileSize: fileSize,
        });
      };
      img.src = current2DImage;
    } else {
      setImageInfo(null);
    }
  }, [current2DImage, materialDetailData]);

  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: currentTheme.background,
    position: 'relative',
    overflow: 'hidden',
  };

  const viewerStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  };

  const imageStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    pointerEvents: 'none',
  };

  const controlsStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
    backgroundColor: currentTheme.backgroundSecondary,
    padding: '10px',
    borderRadius: '8px',
    border: `1px solid ${currentTheme.border}`,
    zIndex: 10,
  };

  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: currentTheme.background,
    color: currentTheme.text,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  };

  const placeholderStyle = {
    color: currentTheme.textSecondary,
    fontSize: '16px',
    textAlign: 'center',
  };

  const infoOverlayStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '0 12px',
    fontSize: '11px',
    color: '#fff',
    zIndex: 10,
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    minHeight: '28px',
  };

  const downloadButtonStyle = {
    marginLeft: 'auto',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Check if the current image is valid (either file path, data URL, or blob URL)
  const isImage = current2DImage && (
    /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(current2DImage) ||
    current2DImage.startsWith('data:image/') ||
    current2DImage.startsWith('blob:')
  );

  return (
    <div style={containerStyle}>
      {isImage && imageInfo && (
        <div style={infoOverlayStyle}>
          <div style={{ fontWeight: 600 }}>{imageInfo.name}</div>
          <div>{imageInfo.width}px × {imageInfo.height}px</div>
          {imageInfo.fileSize && <div>{formatFileSize(imageInfo.fileSize)}</div>}
          <div>Zoom: {Math.round(zoom * 100)}%</div>
          <button style={downloadButtonStyle} onClick={handleDownload}>
            Download
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        style={viewerStyle}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isImage ? (
          <img src={current2DImage} alt="2D View" style={imageStyle} />
        ) : (
          <div style={placeholderStyle}>
            No image loaded. Double-click a texture node to view it here.
          </div>
        )}
      </div>

      {isImage && (
        <div style={controlsStyle}>
          <button
            style={buttonStyle}
            onClick={() => setZoom((z) => Math.min(10, z * 1.2))}
          >
            Zoom +
          </button>
          <button
            style={buttonStyle}
            onClick={() => setZoom((z) => Math.max(0.1, z * 0.8))}
          >
            Zoom -
          </button>
          <button style={buttonStyle} onClick={handleReset}>
            Reset
          </button>
          <div style={{ ...buttonStyle, cursor: 'default', backgroundColor: currentTheme.backgroundSecondary }}>
            {Math.round(zoom * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageViewer;
