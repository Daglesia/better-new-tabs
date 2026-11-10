import { defineConfig } from 'wxt';

const OPTIONAL_HOSTS = ['https://*/*', 'http://*/*'];

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ manifestVersion }) => ({
    permissions: ['storage', 'bookmarks'],
    ...(manifestVersion === 2
      ? { optional_permissions: OPTIONAL_HOSTS }
      : { optional_host_permissions: OPTIONAL_HOSTS }),
  }),
});