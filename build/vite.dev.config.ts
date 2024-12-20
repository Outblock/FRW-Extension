import { mergeConfig, defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import commonConfig from './vite.common.config';

export default defineConfig((configEnv) => {
  const common = commonConfig(configEnv);

  return mergeConfig(common, {
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
  });
});
