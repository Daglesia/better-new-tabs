import { storage } from '#imports';
import type { Layout } from 'react-grid-layout';

export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
export type ResponsiveLayouts = Partial<Record<Breakpoint, Layout>>;

export interface ServiceConfig {
  name: string;
  url: string;
  checkUrl?: string;
}

// Dashboard starts empty: no layouts, no widgets.
export const layoutsItem = storage.defineItem<ResponsiveLayouts>('local:layouts', {
  fallback: {},
});

// Ids of the widgets the user has added (see widgets.tsx)
export const activeWidgetsItem = storage.defineItem<string[]>('local:activeWidgets', {
  fallback: [],
});

export const customServicesItem = storage.defineItem<ServiceConfig[]>(
  'local:customServices',
  { fallback: [] },
);

export const notepadItem = storage.defineItem<string>('local:notepad', {
  fallback: '',
});