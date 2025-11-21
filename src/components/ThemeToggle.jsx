import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, currentTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '6px 10px',
        backgroundColor: currentTheme.surface,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '6px',
        color: currentTheme.text,
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = currentTheme.hover;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = currentTheme.surface;
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default ThemeToggle;
