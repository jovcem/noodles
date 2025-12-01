import Toolbar from '../shared/Toolbar';
import { useSceneStore } from '../../store/sceneStore';
import { useTheme } from '../../contexts/ThemeContext';

function LayoutSelector() {
  const { currentTheme } = useTheme();
  const currentLayout = useSceneStore((state) => state.currentLayout);
  const setLayout = useSceneStore((state) => state.setLayout);

  return (
    <div style={{
      borderTop: `1px solid ${currentTheme.border}`,
    }}>
      <div style={{
        borderBottom: 'none',
        marginBottom: '-1px', // Hide the Toolbar's bottom border
      }}>
        <Toolbar>
          <Toolbar.Button
            isActive={currentLayout === 1}
            onClick={() => setLayout(1)}
          >
            1
          </Toolbar.Button>
          <Toolbar.Button
            isActive={currentLayout === 2}
            onClick={() => setLayout(2)}
          >
            2
          </Toolbar.Button>
        </Toolbar>
      </div>
    </div>
  );
}

export default LayoutSelector;
