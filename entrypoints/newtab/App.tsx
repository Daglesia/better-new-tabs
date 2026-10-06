import { useEffect, useRef, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import IssuesList from './IssuesList';
import HealthCheck from './HealthCheck';
import WeatherWidget from './WeatherWidget';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import { ModeProvider, useMode } from './ModeContext';
import {
  DEFAULT_LAYOUTS,
  layoutsItem,
  type ResponsiveLayouts,
} from '@/utils/storage';

function ResponsiveGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { mode } = useMode();
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);
  const [loaded, setLoaded] = useState(false);
  const prevMode = useRef(mode);
  const isEditMode = mode === 'edit';

  // Load saved layouts once
  useEffect(() => {
    layoutsItem.getValue().then((saved) => {
      setLayouts(saved);
      setLoaded(true);
    });
  }, []);

  // Save when leaving edit mode ("Done editing")
  useEffect(() => {
    if (prevMode.current === 'edit' && mode === 'view') {
      layoutsItem.setValue(layouts);
    }
    prevMode.current = mode;
  }, [mode, layouts]);

  return (
    <div ref={containerRef}>
      {mounted && loaded && (
        <Responsive
          layouts={layouts}
          onLayoutChange={(_layout, allLayouts) => setLayouts(allLayouts)}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          width={width}
          dragConfig={{ enabled: isEditMode, cancel: 'button, a, input, form' }}
          resizeConfig={{ enabled: isEditMode }}
        >
          <div key="1"><IssuesList /></div>
          <div key="2"><HealthCheck /></div>
          <div key="3"><WeatherWidget /></div>
        </Responsive>
      )}
    </div>
  );
}

function ModeToggleButton() {
  const { mode, toggleMode } = useMode();

  return (
    <button type="button" className="mode-toggle" onClick={toggleMode}>
      {mode === 'edit' ? '✓ Done editing' : '✎ Edit layout'}
    </button>
  );
}

function App() {
  return (
    <ModeProvider>
      <ResponsiveGrid />
      <ModeToggleButton />
    </ModeProvider>
  );
}

export default App;