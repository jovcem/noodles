import { useEffect, useRef } from 'react';
import '@google/model-viewer';

function ModelViewerWrapper({ modelUrl, style }) {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    // The model-viewer web component is registered globally
    // No additional setup needed here
  }, []);

  if (!modelUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '18px',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Drop a GLB file to view it in 3D</p>
        </div>
      </div>
    );
  }

  return (
    <model-viewer
      ref={modelViewerRef}
      src={modelUrl}
      alt="3D Model"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
        ...style,
      }}
    >
      <div className="progress-bar hide" slot="progress-bar">
        <div className="update-bar"></div>
      </div>
      <style>{`
        .progress-bar {
          display: block;
          width: 33%;
          height: 10%;
          max-height: 2%;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
          border-radius: 25px;
          box-shadow: 0px 3px 10px 3px rgba(0, 0, 0, 0.5), 0px 0px 5px 1px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(0, 0, 0, 0.5);
        }
        .progress-bar.hide {
          visibility: hidden;
          transition: visibility 0.3s;
        }
        .update-bar {
          background-color: rgba(100, 108, 255, 0.9);
          width: 0%;
          height: 100%;
          border-radius: 25px;
          float: left;
          transition: width 0.3s;
        }
      `}</style>
    </model-viewer>
  );
}

export default ModelViewerWrapper;
