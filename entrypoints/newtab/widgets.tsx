import type { ComponentType } from 'react';
import IssuesList from './IssuesList';
import HealthCheck from './HealthCheck';
import WeatherWidget from './WeatherWidget';
import NotepadWidget from './NotepadWidget';

export interface WidgetDefinition {
  id: string;
  label: string;
  component: ComponentType;
  defaultSize: { w: number; h: number };
}

export const WIDGETS: WidgetDefinition[] = [
  { id: 'issues', label: 'To do list', component: IssuesList, defaultSize: { w: 2, h: 2 } },
  { id: 'health', label: 'Service Health', component: HealthCheck, defaultSize: { w: 2, h: 2 } },
  { id: 'weather', label: 'Weather', component: WeatherWidget, defaultSize: { w: 2, h: 2 } },
];

export const WIDGETS_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));