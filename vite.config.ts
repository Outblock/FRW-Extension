import path from 'path';

import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// import manifest from './_raw/manifest.json';
const manifest = {
  manifest_version: 3,
  name: 'FlowWallet-dev',
  short_name: '__MSG_appName__',
  version: '2.6.3',
  default_locale: 'en',
  description: '__MSG_appDescription__',
  icons: {
    '16': 'images/icon-16.png',
    '19': 'images/icon-19.png',
    '32': 'images/icon-32.png',
    '38': 'images/icon-38.png',
    '48': 'images/icon-48.png',
    '64': 'images/icon-64.png',
    '128': 'images/icon-128.png',
    '512': 'images/icon-512.png',
  },
  action: {
    default_icon: {
      '16': 'images/icon-16.png',
      '19': 'images/icon-19.png',
      '32': 'images/icon-32.png',
      '48': 'images/icon-48.png',
      '128': 'images/icon-128.png',
    },
    default_popup: 'src/ui/index.html',
    default_title: 'Flow Wallet',
  },
  author: 'https://core.flow.com/',
  background: {
    service_worker: 'src/background',
  },
  content_scripts: [
    {
      js: ['src/content-script/index.ts', 'src/content-script/script.js'],
      matches: ['file://*/*', 'http://*/*', 'https://*/*'],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self' 'wasm-unsafe-eval';",
  },
  permissions: ['storage', 'activeTab', 'tabs', 'notifications', 'identity', 'camera'],
  web_accessible_resources: [
    {
      resources: ['node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'],
      matches: ['<all_urls>'],
    },
    {
      resources: ['src/content-script/script.js'],
      matches: ['<all_urls>'],
    },
    {
      resources: ['src/ui/index.html'],
      matches: ['<all_urls>'],
    },
  ],
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2jsG1AXKEZGJuZecVwBsajHj6MqNGvcM+X/zQCuvec85xmgTJun+MGLHNAOaulMx5tMDR7+t3wkV3FiNMYQUBeGMHNpIoWHt5hBwX1FSL5uTPQFjqueuagICOKK6CCPIe0hr9eCXKmbMPQvJbawdn/q7qsPMJiBwqnyTO0jOtSpQfKVRYs5Bf1xpleHeWLWCdxuBNBwthmLw2kcx7GibsqPXA233ZXcfyivHT7PvT9KrNEq7m55pu3ZZ1kihNxDXJQzoKkXgmiAUJivxNf9cGQ3242vZ52AQvVzeCIWBrBv974FTgrQMZ+gDscsXgWuV10nPAcuuYmPKWjuB0IBsGwIDAQAB',
  oauth2: {
    client_id: '246247206636-7gr0kikuns0bgo6kpkrievloqom1sfp1.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  },
};
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    target: 'esnext',
    modulePreload: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      utils: path.resolve(__dirname, './src/utils'),
      ui: path.resolve(__dirname, './src/ui'),
      background: path.resolve(__dirname, './src/background'),
      consts: path.resolve(__dirname, './src/constant'),
      assets: path.resolve(__dirname, './src/ui/assets'),
    },
  },
});
