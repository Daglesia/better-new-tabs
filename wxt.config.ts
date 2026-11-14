import { defineConfig } from 'wxt';

const OPTIONAL_HOSTS = ['https://*/*', 'http://*/*'];

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  zip: {
    downloadPackages: ['@daglesia/daglesias-library-of-components'],
    excludeSources: [
      'bun.lock',
      '.npmrc',
      '.env',
      '.env.*',
      '.clinerules/**',
      '.clineignore',
      'AGENTS.md',
      'opencode.jsonc',
      'AMO-notes.md',
    ],
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
      // Not an Android support claim: new tab overrides don't work on Firefox
      // for Android. This only raises the Android compatibility floor to the
      // version that understands gecko.data_collection_permissions (below it,
      // addons-linter warns with KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION).
      gecko_android: {
        strict_min_version: '142.0',
      },
    },
    ...(manifestVersion === 2
      ? { optional_permissions: OPTIONAL_HOSTS }
      : { optional_host_permissions: OPTIONAL_HOSTS }),
  }),
});