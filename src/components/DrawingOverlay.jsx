import { useEffect, useRef, useState, useCallback } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { useTheme } from '../contexts/ThemeContext';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '../utils/drawing/strokeUtils';

function DrawingOverlay() {
  const { currentTheme } = useTheme();
  const exitDrawingMode = useSceneStore((state) => state.exitDrawingMode);
  const modelViewerRef = useSceneStore((state) => state.modelViewerRef);

  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [wasAutoRotating, setWasAutoRotating] = useState(false);

  const svgRef = useRef(null);

  // Stroke configuration
  const strokeOptions = {
    size: 12,
    thinning: 0.7,
    smoothing: 0.5,
    streamline: 0.5,
  };

  // Extract point coordinates from mouse or touch event
  const getPointFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];

    const rect = svg.getBoundingClientRect();

    if (e.touches && e.touches[0]) {
      return [
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top,
      ];
    }

    return [
      e.clientX - rect.left,
      e.clientY - rect.top,
    ];
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    setIsDrawing(true);
    setCurrentStroke([point]);
  }, [getPointFromEvent]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getPointFromEvent(e);
    setCurrentStroke(prev => [...prev, point]);
  }, [isDrawing, getPointFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || currentStroke.length === 0) return;

    const strokePoints = getStroke(currentStroke, strokeOptions);

    const pathData = getSvgPathFromStroke(strokePoints);

    setStrokes(prev => [...prev, { pathData }]);
    setCurrentStroke([]);
    setIsDrawing(false);
  }, [isDrawing, currentStroke, strokeOptions]);

  const getCurrentStrokePath = useCallback(() => {
    if (currentStroke.length < 2) return '';
    const strokePoints = getStroke(currentStroke, strokeOptions);
    return getSvgPathFromStroke(strokePoints);
  }, [currentStroke, strokeOptions]);

  // Disable auto-rotate on mount, restore on unmount
  useEffect(() => {
    if (modelViewerRef) {
      // Save current auto-rotate state
      const currentAutoRotate = modelViewerRef.autoRotate;
      setWasAutoRotating(currentAutoRotate);

      // Disable auto-rotate
      modelViewerRef.autoRotate = false;
    }

    return () => {
      // Restore auto-rotate on cleanup
      if (modelViewerRef && wasAutoRotating) {
        modelViewerRef.autoRotate = true;
      }
    };
  }, [modelViewerRef, wasAutoRotating]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        exitDrawingMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitDrawingMode]);

  return (
    <div style={overlayContainerStyle}>
      <div style={hintStyle(currentTheme)}>
        Press ESC to exit drawing mode
      </div>

      <svg
        ref={svgRef}
        style={svgCanvasStyle}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      >
        {strokes.map((stroke, i) => (
          <path
            key={i}
            d={stroke.pathData}
            fill="#ef4444"
            stroke="#ef4444"
            strokeWidth="1"
          />
        ))}

        {currentStroke.length > 0 && (
          <path
            d={getCurrentStrokePath()}
            fill="#ef4444"
            stroke="#ef4444"
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  );
}

const overlayContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 2000,
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  cursor: 'crosshair',
  touchAction: 'none',
};

const svgCanvasStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const hintStyle = (currentTheme) => ({
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '12px 24px',
  backgroundColor: currentTheme.surface,
  border: `1px solid ${currentTheme.border}`,
  borderRadius: '8px',
  color: currentTheme.textSecondary,
  fontSize: '14px',
  fontWeight: '500',
  zIndex: 2001,
  pointerEvents: 'none',
  userSelect: 'none',
});

export default DrawingOverlay;
