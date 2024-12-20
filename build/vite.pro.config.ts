import { mergeConfig, defineConfig } from 'vite';

import commonConfig from './vite.common.config';

export default defineConfig((configEnv) => {
  const common = commonConfig(configEnv);

  return mergeConfig(common, {
    mode: 'production',
    envDir: '.',
    envPrefix: 'VITE_',
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          inlineDynamicImports: true,
        },
      },
      chunkSizeWarningLimit: 2500,
    },
    define: {
      'process.env.BUILD_ENV': JSON.stringify('PRO'),
      'process.browser': true,
      Buffer: ['buffer', 'Buffer'],
    },
  });
});
