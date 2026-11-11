import { defineConfig } from 'wxt';

const OPTIONAL_HOSTS = ['https://*/*', 'http://*/*'];

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  zip: {
    downloadPackages: ['@daglesia/daglesias-library-of-components'],
    excludeSources: ['bun.lock', '.npmrc'],
  },
  manifest: ({ manifestVersion }) => ({
    name: 'BeNT (Better New Tabs)',
    description: 'A personalized customizable tabs extension for everything and nothing at the same time.',
    permissions: ['storage', 'bookmarks'],
    browser_specific_settings: {
      gecko: {
        id: 'better-new-tabs@daglesia.com',
        data_collection_permissions: {
          required: ['authenticationInfo'],
        },
      },
    },
    ...(manifestVersion === 2
      ? { optional_permissions: OPTIONAL_HOSTS }
      : { optional_host_permissions: OPTIONAL_HOSTS }),
  }),
});