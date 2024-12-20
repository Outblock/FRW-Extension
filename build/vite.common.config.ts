import fs from 'fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

import packageJson from '../package.json';

import paths from './paths';

const { version } = packageJson;

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const devToolsExists =
    isDevelopment && fs.existsSync(paths.rootResolve('_raw/react-devtools.js'));

  const templateData = {
    devMode: isDevelopment,
    hasDevTools: devToolsExists,
  };

  return {
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          background: paths.rootResolve('src/background/index.ts'),
          'content-script': paths.rootResolve('src/content-script/index.ts'),
          pageProvider: paths.rootResolve('src/content-script/pageProvider/eth/index.ts'),
          ui: paths.rootResolve('src/ui/index.tsx'),
          script: paths.rootResolve('src/content-script/script.js'),
        },
        output: {
          dir: paths.dist,
          entryFileNames: '[name].js',
          format: 'es',
        },
      },
    },
    plugins: [
      react(),
      svgr(),
      createHtmlPlugin({
        minify: !isDevelopment,
        pages: [
          {
            filename: 'popup.html',
            template: paths.popupHtml,
            entry: '/src/ui/index.tsx',
            injectOptions: {
              data: templateData,
            },
          },
          {
            filename: 'notification.html',
            template: paths.notificationHtml,
            entry: '/src/ui/index.tsx',
            injectOptions: {
              data: templateData,
            },
          },
          {
            filename: 'index.html',
            template: paths.indexHtml,
            entry: '/src/ui/index.tsx',
            injectOptions: {
              data: templateData,
            },
          },
          {
            filename: 'background.html',
            template: paths.notificationHtml,
            entry: '/src/background/index.ts',
            injectOptions: {
              data: templateData,
            },
          },
        ],
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm',
            dest: '.',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': paths.rootResolve('src'),
        ui: paths.rootResolve('src/ui'),
        background: paths.rootResolve('src/background'),
        consts: paths.rootResolve('src/constant/index'),
        moment: 'dayjs',
        'cross-fetch': 'cross-fetch',
      },
    },
    define: {
      'process.env.version': JSON.stringify(`version: ${version}`),
      'process.env.release': JSON.stringify(version),
      'process.env': {},
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        supported: {
          bigint: true,
        },
      },
    },
  };
});
