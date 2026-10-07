import { useEffect, useRef, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import { ModeProvider, useMode } from './ModeContext';
import { WIDGETS, WIDGETS_BY_ID, type WidgetDefinition } from './widgets';
import {
  activeWidgetsItem,
  layoutsItem,
  type Breakpoint,
  type ResponsiveLayouts,
} from '@/utils/storage';

const BREAKPOINTS: Breakpoint[] = ['lg', 'md', 'sm', 'xs', 'xxs'];

function addToLayouts(
  layouts: ResponsiveLayouts,
  id: string,
  size: { w: number; h: number },
): ResponsiveLayouts {
  const next: ResponsiveLayouts = {};
  for (const bp of BREAKPOINTS) {
    const existing = layouts[bp] ?? [];
    // y: Infinity puts the new tile at the bottom; the grid compacts it upward
    next[bp] = [...existing, { i: id, x: 0, y: Infinity, w: size.w, h: size.h }];
  }
  return next;
}

function removeFromLayouts(layouts: ResponsiveLayouts, id: string): ResponsiveLayouts {
  const next: ResponsiveLayouts = {};
  for (const bp of BREAKPOINTS) {
    const existing = layouts[bp];
    if (existing) next[bp] = existing.filter((item) => item.i !== id);
  }
  return next;
}

function WidgetPicker({
  available,
  onAdd,
}: {
  available: WidgetDefinition[];
  onAdd: (widget: WidgetDefinition) => void;
}) {
  return (
    <div className="widget-picker">
      <span className="widget-picker__title">Add widget</span>
      {available.length === 0 ? (
        <span className="widget-picker__empty">All widgets added</span>
      ) : (
        available.map((widget) => (
          <button
            key={widget.id}
            type="button"
            className="widget-picker__item"
            onClick={() => onAdd(widget)}
          >
            + {widget.label}
          </button>
        ))
      )}
    </div>
  );
}

function ResponsiveGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const { mode } = useMode();
  const [layouts, setLayouts] = useState<ResponsiveLayouts>({});
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const prevMode = useRef(mode);
  const isEditMode = mode === 'edit';

  // Load saved layouts + widget list once
  useEffect(() => {
    Promise.all([layoutsItem.getValue(), activeWidgetsItem.getValue()]).then(
      ([savedLayouts, savedIds]) => {
        setLayouts(savedLayouts);
        setActiveWidgets(savedIds.filter((id) => WIDGETS_BY_ID.has(id)));
        setLoaded(true);
      },
    );
  }, []);

  // Save when leaving edit mode ("Done editing")
  useEffect(() => {
    if (prevMode.current === 'edit' && mode === 'view') {
      layoutsItem.setValue(layouts);
      activeWidgetsItem.setValue(activeWidgets);
    }
    prevMode.current = mode;
  }, [mode, layouts, activeWidgets]);

  const addWidget = (widget: WidgetDefinition) => {
    setActiveWidgets((prev) => (prev.includes(widget.id) ? prev : [...prev, widget.id]));
    setLayouts((prev) => addToLayouts(prev, widget.id, widget.defaultSize));
  };

  const removeWidget = (id: string) => {
    setActiveWidgets((prev) => prev.filter((w) => w !== id));
    setLayouts((prev) => removeFromLayouts(prev, id));
  };

  const available = WIDGETS.filter((w) => !activeWidgets.includes(w.id));

  return (
    <>
      <div ref={containerRef}>
        {mounted && loaded && (
          <Responsive
            layouts={layouts}
            onLayoutChange={(_layout, allLayouts) => setLayouts(allLayouts)}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            width={width}
            dragConfig={{ enabled: isEditMode, cancel: 'button, a, input, form, textarea' }}
            resizeConfig={{ enabled: isEditMode }}
          >
            {activeWidgets.map((id) => {
              const widget = WIDGETS_BY_ID.get(id);
              if (!widget) return null;
              const Component = widget.component;
              return (
                <div key={id}>
                  {isEditMode && (
                    <button
                      type="button"
                      className="widget-remove"
                      onClick={() => removeWidget(id)}
                      aria-label={`Remove ${widget.label}`}
                    >
                      ×
                    </button>
                  )}
                  <Component />
                </div>
              );
            })}
          </Responsive>
        )}
      </div>

      {loaded && activeWidgets.length === 0 && !isEditMode && (
        <div className="empty-hint">
          Nothing here yet. Click “Edit layout” to add widgets.
        </div>
      )}

      {isEditMode && <WidgetPicker available={available} onAdd={addWidget} />}
    </>
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