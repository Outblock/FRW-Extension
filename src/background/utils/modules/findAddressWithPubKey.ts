import * as fcl from '@onflow/fcl';

import { userWalletService } from 'background/service';

export const findAddressWithKey = async (pubKeyHex: string, address: string | null = null) => {
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

export const findAddressOnlyKey = async (pubKeyHex: string, network: string) => {
  let data;
  if (network === 'testnet') {
    data = await getAddressTestnet(pubKeyHex);
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

export async function getAddressByIndexer(publicKey: string) {
  const url = `https://production.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json = await result.json();
  return json;
}

export async function getAddressTestnet(publicKey: string) {
  const url = `https://staging.key-indexer.flow.com/key/${publicKey}`;
  const result = await fetch(url);
  const json = await result.json();
  return json;
}

const findAddres = async (address, pubKeyHex) => {
  // I'm not sure this is needed. I'm updating what was here
  await userWalletService.setupFcl();

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
