const path = require('path');
const fs = require('fs-extra');
const http = require('http');
// require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const mode = args[0];

require('dotenv').config({ path: `.env.${mode}` });

const OAUTH2_SCOPES = process.env.OAUTH2_SCOPES || '';

const DEVTOOLS_URL = 'http://localhost:8097';

async function fetchDevTools() {
  return new Promise((resolve, reject) => {
    const request = http.get(DEVTOOLS_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        const modifiedScript = `
          // React DevTools for Chrome Extension
          (function() {
            ${data}
          })();
        `;
        resolve(modifiedScript);
      });
    });

    request.on('error', reject);
  });
}

async function prepare() {
  console.log(process.env.NODE_ENV);
  console.log(process.env.OAUTH2_CLIENT_ID);

  const manifestPath = path.resolve(PROJECT_ROOT, '_raw', 'manifest.json');
  const manifest = fs.readJSONSync(manifestPath);

  manifest.oauth2 = {
    client_id: process.env.OAUTH2_CLIENT_ID,
    scopes: OAUTH2_SCOPES.split(','),
  };

  if (mode == 'dev') {
    manifest.key = process.env.MANIFEST_KEY;
    try {
      const devToolsScript = await fetchDevTools();
      fs.writeFileSync(path.resolve(__dirname, '../_raw/react-devtools.js'), devToolsScript);
      console.log('✅ React DevTools source fetched successfully');
    } catch (error) {
      console.warn('⚠️ Failed to fetch React DevTools. Run the devtools server first');
      // Write empty file if fetch fails
      fs.writeFileSync(
        path.resolve(__dirname, '../_raw/react-devtools.js'),
        '// React DevTools not available'
      );
    }
  }

  fs.writeJSONSync(manifestPath, manifest, { spaces: 2 });

  return '';
}

prepare();
