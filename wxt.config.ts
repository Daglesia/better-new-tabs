import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage', 'bookmarks'],
    host_permissions: ['https://git.daglesia.com/*'],
  },
});