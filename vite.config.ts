import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import stylexUnplugin from '@stylexjs/unplugin';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  server: {
    port: 5177,
  },
  optimizeDeps: {
    exclude: ['i18next-fs-backend'],
  },
  plugins: [
    // eslint-disable-next-line import/no-named-as-default-member
    stylexUnplugin.vite({
      useCSSLayers: false,
      aliases: {
        '~/*': [path.resolve(__dirname, 'app', '*')],
      },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
