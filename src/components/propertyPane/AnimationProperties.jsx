import { useState, useEffect, useRef } from 'react';
import PropertyRow from './PropertyRow';
import { propertyPaneStyles } from '../../constants/propertyPaneStyles';
import { NODE_COLORS } from '../../constants/colorConstants';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';

function AnimationProperties({ data }) {
  const { currentTheme } = useTheme();
  const {
    sectionStyle,
    headerStyle,
    propertyGroupStyle,
    subHeaderStyle,
    listItemStyle,
  } = propertyPaneStyles(currentTheme);

  const sceneData = useSceneStore((state) => state.sceneData);
  const setSelectedNode = useSceneStore((state) => state.setSelectedNode);
  const playAnimation = useSceneStore((state) => state.playAnimation);
  const pauseAnimation = useSceneStore((state) => state.pauseAnimation);
  const currentPlayingAnimation = useSceneStore((state) => state.currentPlayingAnimation);
  const modelViewerRef = useSceneStore((state) => state.modelViewerRef);
  const seekAnimation = useSceneStore((state) => state.seekAnimation);

  const isPlaying = currentPlayingAnimation === data.name;

  // Timeline state
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  // Get interpolation type display name
  const getInterpolationDisplay = (interpolation) => {
    switch (interpolation) {
      case 'LINEAR': return 'Linear';
      case 'STEP': return 'Stepped';
      case 'CUBICSPLINE': return 'Smooth';
      default: return interpolation;
    }
  };

  // Handle play/pause button
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      playAnimation(data.name);
    }
  };

  // Handle clicking on a node ID to jump to it
  const handleNodeClick = (nodeId) => {
    const node = sceneData?.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode({
        id: node.id,
        name: node.name,
        nodeType: 'node',
        subType: node.subType,
        meshId: node.meshId,
        skinId: node.skinId,
        translation: node.translation,
        rotation: node.rotation,
        scale: node.scale,
        matrix: node.matrix,
        worldTranslation: node.worldTranslation,
        worldRotation: node.worldRotation,
        worldScale: node.worldScale,
        worldMatrix: node.worldMatrix,
      });
    }
  };

  // Timeline helper functions
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThumbPosition = (currentTime, duration) => {
    if (!duration) return 0;
    const percentage = (currentTime / duration) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const getTimeFromMouseEvent = (e, trackElement, duration) => {
    if (!trackElement) return 0;
    const rect = trackElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };

  // Timeline interaction handlers
  const handleTrackClick = (e) => {
    if (e.target === thumbRef.current) return;
    const time = getTimeFromMouseEvent(e, trackRef.current, data.duration);
    seekAnimation(time);
    setLocalCurrentTime(time);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const time = getTimeFromMouseEvent(e, trackRef.current, data.duration);
    seekAnimation(time);
    setLocalCurrentTime(time);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Track playback position with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !modelViewerRef) {
      return;
    }

    let frameId;
    let running = true;

    const updateTime = () => {
      if (!running) return;

      if (modelViewerRef) {
        const currentTime = modelViewerRef.currentTime;

        // Update scrubber position
        if (currentTime !== undefined && currentTime !== null) {
          setLocalCurrentTime(currentTime);
        }

        // Continue loop as long as effect is active
        frameId = requestAnimationFrame(updateTime);
      }
    };

    frameId = requestAnimationFrame(updateTime);

    return () => {
      running = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, modelViewerRef, data.name]);

  // Alternative: Listen for loop event to update at animation boundaries
  useEffect(() => {
    if (!modelViewerRef) return;

    const handleLoop = () => {
      if (isPlaying) {
        setLocalCurrentTime(0);
      }
    };

    modelViewerRef.addEventListener('loop', handleLoop);

    return () => {
      modelViewerRef.removeEventListener('loop', handleLoop);
    };
  }, [modelViewerRef, isPlaying]);

  // Reset time when animation changes
  useEffect(() => {
    setLocalCurrentTime(0);
  }, [data.name]);

  // Document-level drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, data.duration]);

  const buttonStyle = {
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: isPlaying ? currentTheme.error : NODE_COLORS.animation,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    transition: 'background-color 0.2s',
  };

  const nodeButtonStyle = {
    background: 'none',
    border: 'none',
    color: NODE_COLORS.node,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: '0',
    fontSize: 'inherit',
    textAlign: 'left',
  };

  // Timeline styles
  const timelineContainerStyle = {
    marginTop: '12px',
    marginBottom: '4px',
  };

  const timeLabelsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: currentTheme.textSecondary,
    marginBottom: '6px',
    paddingLeft: '4px',
    paddingRight: '4px',
  };

  const trackContainerStyle = {
    position: 'relative',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    cursor: isDragging ? 'grabbing' : 'pointer',
    padding: '0 4px',
  };

  const trackBackgroundStyle = {
    position: 'relative',
    width: '100%',
    height: '4px',
    backgroundColor: currentTheme.borderLight,
    borderRadius: '2px',
    overflow: 'visible',
  };

  // Calculate thumb position (recalculates on every render when localCurrentTime changes)
  const thumbPosition = getThumbPosition(localCurrentTime, data.duration);

  const progressFillStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: NODE_COLORS.animation,
    opacity: 0.4,
    borderRadius: '2px',
    width: `${thumbPosition}%`,
    pointerEvents: 'none',
    transition: isDragging ? 'none' : 'width 0.05s linear',
  };

  const thumbStyle = {
    position: 'absolute',
    left: `${thumbPosition}%`,
    top: '50%',
    transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
    width: '10px',
    height: '10px',
    backgroundColor: NODE_COLORS.animation,
    borderRadius: '50%',
    cursor: isDragging ? 'grabbing' : 'grab',
    pointerEvents: 'auto',
    transition: isDragging ? 'none' : 'transform 0.15s ease, left 0.05s linear',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, borderLeft: `3px solid ${NODE_COLORS.animation}` }}>
          Animation
        </div>
      </div>

      <div style={propertyGroupStyle}>
        <PropertyRow label="Name" value={data.name || 'Unnamed'} />
        <PropertyRow label="ID" value={data.id} />
        <PropertyRow label="Duration" value={`${data.duration.toFixed(2)}s`} />
        <PropertyRow label="Channels" value={data.channelCount} />
      </div>

      <div style={propertyGroupStyle}>
        <button
          onClick={handlePlayPause}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Timeline Scrubber */}
        <div style={timelineContainerStyle}>
          <div style={timeLabelsStyle}>
            <span>{formatTime(localCurrentTime)}</span>
            <span>{formatTime(data.duration)}</span>
          </div>
          <div
            ref={trackRef}
            style={trackContainerStyle}
            onClick={handleTrackClick}
          >
            <div style={trackBackgroundStyle}>
              <div
                key={`progress-${thumbPosition}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  backgroundColor: NODE_COLORS.animation,
                  opacity: 0.4,
                  borderRadius: '2px',
                  width: `${thumbPosition}%`,
                  pointerEvents: 'none',
                  transition: isDragging ? 'none' : 'width 0.05s linear',
                }}
              />
              <div
                ref={thumbRef}
                key={`thumb-${thumbPosition}`}
                style={{
                  position: 'absolute',
                  left: `${thumbPosition}%`,
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
                  width: '10px',
                  height: '10px',
                  backgroundColor: NODE_COLORS.animation,
                  borderRadius: '50%',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                  transition: isDragging ? 'none' : 'transform 0.15s ease, left 0.05s linear',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
                onMouseDown={handleMouseDown}
              />
            </div>
          </div>
          <div style={{
            fontSize: '10px',
            color: currentTheme.textTertiary,
            marginTop: '4px',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}>
            Position: {thumbPosition.toFixed(1)}% • Time: {localCurrentTime.toFixed(2)}s / {data.duration.toFixed(2)}s • Frame: {Math.floor(localCurrentTime * 30)} / {Math.floor(data.duration * 30)} @ 30fps
          </div>
        </div>
      </div>

      {data.animatedNodes && data.animatedNodes.length > 0 && (
        <div style={propertyGroupStyle}>
          <div style={subHeaderStyle}>
            Animated Nodes ({data.animatedNodes.length})
          </div>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '4px',
            padding: '8px',
          }}>
            {data.animatedNodes.map((animatedNode, index) => (
              <div key={index} style={{
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: index < data.animatedNodes.length - 1
                  ? `1px solid ${currentTheme.borderLight}`
                  : 'none',
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: currentTheme.text,
                  marginBottom: '6px',
                }}>
                  <button
                    onClick={() => handleNodeClick(animatedNode.nodeId)}
                    style={nodeButtonStyle}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                    }}
                  >
                    📦 {animatedNode.nodeName}
                  </button>
                </div>
                <div style={{ paddingLeft: '8px' }}>
                  {animatedNode.properties.map((property, propIndex) => (
                    <div
                      key={propIndex}
                      style={{
                        fontSize: '12px',
                        color: currentTheme.textSecondary,
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {property.path === 'translation' && '↔️ Translation'}
                        {property.path === 'rotation' && '🔄 Rotation'}
                        {property.path === 'scale' && '📏 Scale'}
                        {property.path === 'weights' && '⚖️ Weights'}
                      </span>
                      <span style={{ color: currentTheme.textTertiary }}>
                        {getInterpolationDisplay(property.interpolation)}, {property.keyframeCount} keys
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimationProperties;
