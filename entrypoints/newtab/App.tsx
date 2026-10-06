import { useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import IssuesList from './IssuesList';
import HealthCheck from './HealthCheck';
import WeatherWidget from './WeatherWidget';
import { Responsive, useContainerWidth } from "react-grid-layout";
import type { Layout } from 'react-grid-layout';
import { ModeProvider, useMode } from './ModeContext';

type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
type ResponsiveLayouts = Partial<Record<Breakpoint, Layout>>;

import CircleOfFifths from './CircleOfFifths';

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: "1", x: 0, y: 0, w: 2, h: 2 },
    { i: "2", x: 2, y: 0, w: 2, h: 2 },
    { i: "3", x: 4, y: 0, w: 2, h: 2 },
    { i: "4", x: 6, y: 0, w: 3, h: 4 },
  ],
  md: [
    { i: "1", x: 0, y: 0, w: 2, h: 2 },
    { i: "2", x: 2, y: 0, w: 2, h: 2 },
    { i: "3", x: 4, y: 0, w: 2, h: 2 },
    { i: "4", x: 6, y: 0, w: 3, h: 4 },
  ],
};

function ResponsiveGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { mode } = useMode();
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);
  const isEditMode = mode === 'edit';

  return (
    <div ref={containerRef}>
      {mounted && (
        <Responsive
          layouts={layouts}
          onLayoutChange={(_layout, allLayouts) => setLayouts(allLayouts)}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          width={width}
          dragConfig={{ enabled: isEditMode, cancel: 'button, a, input, form' }}
          resizeConfig={{ enabled: isEditMode }}
        >
          <div key="1">
            <IssuesList key="1" />
          </div>
          <div key="2">
            <HealthCheck key="2" />
          </div>
          <div key="3">
            <WeatherWidget key="3" />
          </div>
          <div key="4">
            <CircleOfFifths key="4" />
          </div>
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