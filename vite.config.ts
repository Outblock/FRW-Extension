import fs from 'fs';
import path from 'path';

import react from '@vitejs/plugin-react';
import { mergeConfig, defineConfig, type ConfigEnv, type UserConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

import packageJson from './package.json';

const { version } = packageJson;

const __dirname = process.cwd();

// Base configuration that's shared between all modes
const baseConfig = (env: ConfigEnv): UserConfig => {
  const isDevelopment = env.mode === 'development';
  const devToolsExists =
    isDevelopment && fs.existsSync(path.resolve(process.cwd(), '_raw/react-devtools.js'));

  const templateData = {
    devMode: isDevelopment,
    hasDevTools: devToolsExists,
  };

  return {
    plugins: [
      react(),
      svgr(),
      createHtmlPlugin({
        minify: !isDevelopment,
        pages: [
          {
            filename: 'popup.html',
            template: 'src/ui/popup.html',
            entry: '/src/ui/index.tsx',
            injectOptions: {
              data: templateData,
            },
          },
          {
            filename: 'notification.html',
            template: 'src/ui/notification.html',
            entry: '/src/ui/index.tsx',
            injectOptions: {
              data: templateData,
            },
          },
          {
            filename: 'index.html',
            template: 'src/ui/index.html',
            entry: '/src/ui/index.tsx',
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
          {
            src: '_raw/manifest.json',
            dest: '.',
          },
          {
            src: 'src/ui/assets',
            dest: '.',
          },
        ],
      }),
    ],
    build: {
      emptyOutDir: true,
      target: 'modules',
      modulePreload: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: {
          background: path.resolve(__dirname, 'src/background/index.ts'),
          'content-script': path.resolve(__dirname, 'src/content-script/index.ts'),
          ui: path.resolve(__dirname, 'src/ui/index.tsx'),
          script: path.resolve(__dirname, 'src/content-script/script.js'),
        },
        output: {
          dir: 'dist',
          entryFileNames: (chunk) => {
            return chunk.name === 'background' ? 'background.js' : '[name].js';
          },
          chunkFileNames: '[name].js',
          assetFileNames: 'assets/[name].[ext]',
          inlineDynamicImports: false,
          generatedCode: {
            constBindings: true,
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: !isDevelopment,
          passes: 2,
        },
        mangle: {
          keep_fnames: true,
          keep_classnames: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        utils: path.resolve(__dirname, './src/utils'),
        ui: path.resolve(__dirname, './src/ui'),
        background: path.resolve(__dirname, './src/background'),
        consts: path.resolve(__dirname, './src/constant'),
        assets: path.resolve(__dirname, './src/ui/assets'),
        moment: 'dayjs',
        'cross-fetch': 'cross-fetch',
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    define: {
      'process.env.version': JSON.stringify(`version: ${version}`),
      'process.env.release': JSON.stringify(version),
      'process.env': {},
    },
  };
};

// Development-specific configuration
const devConfig: UserConfig = {
  mode: 'development',
  envDir: '.',
  envPrefix: 'VITE_',
  build: {
    sourcemap: 'inline',
    watch: {
      include: ['src/**'],
      exclude: ['**/public/**', '**/node_modules/**'],
    },
  },
  define: {
    'process.env.BUILD_ENV': JSON.stringify('DEV'),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '_raw/react-devtools.js',
          dest: '.',
        },
      ],
    }),
  ],
};

// Production-specific configuration
const prodConfig: UserConfig = {
  mode: 'production',
  envDir: '.',
  envPrefix: 'VITE_',
  build: {
    sourcemap: false,

    chunkSizeWarningLimit: 2500,
  },
  define: {
    'process.env.BUILD_ENV': JSON.stringify('PRO'),
    'process.browser': true,
    Buffer: ['buffer', 'Buffer'],
  },
};

// Export the final configuration based on mode
export default defineConfig((env: ConfigEnv) => {
  const base = baseConfig(env);
  if (env.mode === 'development') {
    return mergeConfig(base, devConfig);
  }
  return mergeConfig(base, prodConfig);
});
