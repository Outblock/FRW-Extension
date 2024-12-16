import { defineManifest } from '@crxjs/vite-plugin';

import packageJson from './package.json';
const { version } = packageJson;

const OAUTH2_SCOPES = process.env.OAUTH2_SCOPES || '';

const DEVTOOLS_URL = 'http://localhost:8097';

async function fetchDevTools() {
  return fetch(DEVTOOLS_URL).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    return response.text().then((text) => {
      const modifiedScript = `
          // React DevTools for Chrome Extension
          (function() {
            ${text}
          })();
        `;
      return modifiedScript;
    });
  });
}

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === 'staging' ? '[INTERNAL] CRXJS Power Tools' : 'CRXJS Power Tools',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
}));
