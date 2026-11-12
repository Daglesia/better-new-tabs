import { defineConfig } from 'wxt';

const OPTIONAL_HOSTS = ['https://*/*', 'http://*/*'];

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  zip: {
    downloadPackages: ['@daglesia/daglesias-library-of-components'],
    excludeSources: ['bun.lock', '.npmrc', '.env', '.env.*', '.clinerules/**', '.clineignore'],
  },
  manifest: ({ manifestVersion }) => ({
    name: 'BeNT (Better New Tabs)',
    description: 'A personalized customizable tabs extension for everything and nothing at the same time.',
    permissions: ['storage', 'bookmarks'],
    browser_specific_settings: {
      gecko: {
        id: 'better-new-tabs@daglesia.com',
        strict_min_version: '140.0',
        data_collection_permissions: {
          required: ['none'],
          optional: ['authenticationInfo', 'locationInfo'],
        },
      },
    },
    ...(manifestVersion === 2
      ? { optional_permissions: OPTIONAL_HOSTS }
      : { optional_host_permissions: OPTIONAL_HOSTS }),
  }),
});