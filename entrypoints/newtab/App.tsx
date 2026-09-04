import { useEffect, useRef, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import IssuesList from './IssuesList';
import { Responsive, useContainerWidth } from "react-grid-layout";

function ResponsiveGrid() {
  const { width, containerRef, mounted } = useContainerWidth();

  const layouts = {
    lg: [{ i: "1", x: 0, y: 0, w: 2, h: 2 }],
    md: [{ i: "1", x: 0, y: 0, w: 2, h: 2 }]
  };

  return (
    <div ref={containerRef}>
      {mounted && (
        <Responsive
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          width={width}
        > 
          <div key="1">
            <IssuesList key="1"/>
          </div>
          <div key="2">2</div>
          <div key="3">3</div>
        </Responsive>
      )}
    </div>
  );
}

function App() {
  return (
    <ResponsiveGrid />
  );
}

export default App;