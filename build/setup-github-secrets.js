import path from 'path';

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import sodium from 'libsodium-wrappers';

async function uploadSecrets(envFile: string, prefix: string, octokit: Octokit, owner: string, repo: string, publicKey: string, keyId: string) {
  const envPath = path.resolve(process.cwd(), envFile);
  const env = dotenv.config({ path: envPath });

  if (env.error) {
    throw new Error(`${envFile} file is required but was not found`);
  }

  // Only process variables from the env file
  const envVars = Object.entries(env.parsed || {}).filter(
    ([name]) => name !== 'GITHUB_TOKEN' && name !== 'GITHUB_REPOSITORY' && !name.startsWith('npm_')
  );

  console.log(`\n📝 Processing ${envFile}:`);
  console.log(`Found ${envVars.length} environment variables to process`);

  for (const [name, value] of envVars) {
    if (!value) {
      console.warn(`⚠️  Skipping ${name} as it has no value`);
      continue;
    }

    try {
      // Convert Secret & Base64 key to Uint8Array
      const binKey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
      const binSecret = sodium.from_string(value);

      // Encrypt the secret using LibSodium
      const encBytes = sodium.crypto_box_seal(binSecret, binKey);
      const encrypted_value = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

      // Create secret name with prefix
      const secret_name = `${prefix}_${name}`;

      // Create or update secret
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name,
        encrypted_value,
        key_id: keyId,
      });

      console.log(`✅ Secret ${secret_name} created/updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to process ${name}:`, error);
    }
  }
}

async function createSecrets() {
  try {
    // Load .env for GitHub configuration
    const baseEnvPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: baseEnvPath });

    // GitHub configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const [OWNER, REPO] = process.env.GITHUB_REPOSITORY?.split('/') || [];

    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is required in .env file');
    }

    if (!OWNER || !REPO) {
      throw new Error('GITHUB_REPOSITORY must be set in .env file in format "owner/repo"');
    }

    console.log(`🔑 Using repository: ${OWNER}/${REPO}`);

    const octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });

    // Get the public key for the repository
    const {
      data: { key, key_id },
    } = await octokit.actions.getRepoPublicKey({
      owner: OWNER,
      repo: REPO,
    });

    // Initialize sodium for encryption
    await sodium.ready;

    // Upload dev secrets with DEV_ prefix
    await uploadSecrets('.env.dev', 'DEV', octokit, OWNER, REPO, key, key_id);

    // Upload pro secrets with PRO_ prefix
    await uploadSecrets('.env.pro', 'PRO', octokit, OWNER, REPO, key, key_id);

    console.log('\n🎉 All secrets processed successfully!');
  } catch (error) {
    console.error('Failed to create secrets:', error);
    process.exit(1);
  }
}

createSecrets().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
