const path = require('path');
const fs = require('fs-extra');
// require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const mode = args[0];

require('dotenv').config({ path: `.env.${mode}` });

async function prepare() {
  console.log(process.env.NODE_ENV);
  console.log(process.env.OAUTH2_CLIENT_ID);

  const manifestPath = path.resolve(PROJECT_ROOT, '_raw', 'manifest.json');
  const manifest = fs.readJSONSync(manifestPath);

  manifest.oauth2 = {
    client_id: process.env.OAUTH2_CLIENT_ID,
    scopes: process.env.OAUTH2_SCOPES.split(','),
  };

  if (mode == 'dev') {
    manifest.key = process.env.MANIFEST_KEY;
  }
  fs.writeJSONSync(manifestPath, manifest, { spaces: 2 });

  return '';
}

prepare();
