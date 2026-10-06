import { storage } from '#imports';
import type { Layout } from 'react-grid-layout';

export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
export type ResponsiveLayouts = Partial<Record<Breakpoint, Layout>>;

export interface ServiceConfig {
  name: string;
  url: string;
  checkUrl?: string;
}

export const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: '1', x: 0, y: 0, w: 2, h: 2 },
    { i: '2', x: 2, y: 0, w: 2, h: 2 },
    { i: '3', x: 4, y: 0, w: 2, h: 2 },
  ],
  md: [
    { i: '1', x: 0, y: 0, w: 2, h: 2 },
    { i: '2', x: 2, y: 0, w: 2, h: 2 },
    { i: '3', x: 4, y: 0, w: 2, h: 2 },
  ],
};

export const layoutsItem = storage.defineItem<ResponsiveLayouts>('local:layouts', {
  fallback: DEFAULT_LAYOUTS,
});

export const customServicesItem = storage.defineItem<ServiceConfig[]>(
  'local:customServices',
  { fallback: [] },
);