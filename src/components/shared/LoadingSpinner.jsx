import { useTheme } from '../../contexts/ThemeContext';

function LoadingSpinner({ size = 40, color = 'primary', text = null }) {
  const { currentTheme } = useTheme();

  // Determine spinner color
  const spinnerColor = color === 'primary' ? currentTheme.primary :
                      color === 'secondary' ? currentTheme.textSecondary :
                      color;

  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${Math.max(2, size / 10)}px solid ${currentTheme.border}`,
    borderTop: `${Math.max(2, size / 10)}px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  };

  const textStyle = {
    color: currentTheme.text,
    fontSize: '14px',
    fontWeight: '500',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} role="status" aria-label="Loading" />
      {text && <div style={textStyle}>{text}</div>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
