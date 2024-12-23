import * as fcl from '@onflow/fcl';

import { fclEmulatorConfig, fclMainnetConfig, fclTestnetConfig } from 'background/fclConfig';
import { userWalletService } from 'background/service';

export const findAddressWithKey = async (pubKeyHex, address) => {
  if (!address) {
    const data = await getAddressByIndexer(pubKeyHex);
    if (data.accounts && data.accounts.length > 0) {
      const outputArray = data.accounts.map((account) => ({
        address: account.address,
        keyIndex: account.keyId,
        weight: account.weight,
        hashAlgo: account.hashing,
        signAlgo: account.signing,
        pubK: pubKeyHex,
      }));
      const filteredResults = outputArray.filter((result) => result !== null);
      return filteredResults.flat();
    }
    return null;
  }
  return await findAddres(address, pubKeyHex);
};

export const findAddressOnlyKey = async (pubKeyHex, network) => {
  let data;
  if (network === 'testnet') {
    data = await getAddressTestnet(pubKeyHex);
  } else if (network === 'emulator') {
    data = await getAddressEmulator(pubKeyHex);
  } else {
    data = await getAddressByIndexer(pubKeyHex);
  }
  if (data.accounts && data.accounts.length > 0) {
    const outputArray = data.accounts.map((account) => ({
      address: account.address,
      keyIndex: account.keyId,
      weight: account.weight,
      hashAlgo: account.hashing,
      signAlgo: account.signing,
      pubK: pubKeyHex,
    }));
    const filteredResults = outputArray.filter((result) => result !== null);
    return filteredResults.flat();
  }
  return null;
};

export async function getAddressByIndexer(publicKey) {
  const url = `https://production.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json = await result.json();
  return json;
}

export async function getAddressTestnet(publicKey) {
  const url = `https://staging.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json = await result.json();
  return json;
}

export async function getAddressEmulator(publicKey) {
  const url = `http://localhost:8080/key/${publicKey}`;
  const result = await fetch(url);
  const json = await result.json();
  return json;
}

const findAddres = async (address, pubKeyHex) => {
  const network = await userWalletService.getNetwork();
  if (network === 'testnet') {
    await fclTestnetConfig();
  } else if (network === 'emulator') {
    await fclEmulatorConfig();
  } else {
    await fclMainnetConfig();
  }
  const account = await fcl.account(address);
  const keys = account.keys
    .filter((key) => key.publicKey === pubKeyHex && !key.revoked)
    .filter((key) => key.weight >= 1000);

  if (keys.length === 0) {
    return null;
  }

  return keys.map((key) => {
    return {
      address: address,
      keyIndex: key.index,
      weight: key.weight,
      hashAlgo: key.hashAlgoString,
      signAlgo: key.signAlgoString,
      pubK: key.publicKey,
    };
  });
};
