import * as ethUtil from 'ethereumjs-util';

import packageJson from '@/../package.json';
import { storage } from '@/background/webapi';

const { version } = packageJson;
import { EMULATOR_HOST_TESTNET, EMULATOR_HOST_MAINNET } from '../fclConfig';
import { userWalletService } from '../service';
import { mixpanelTrack } from '../service/mixpanel';
import { type FlowNetwork } from '../service/networkModel';
import pageStateCache from '../service/pageStateCache';

export { default as createPersistStore } from './persisitStore';
export { default as createSessionStore } from './sessionStore';

// {a:{b: string}} => {1: 'a.b'}
// later same [source] value will override [result] key generated before
const retrieveValuePath = (obj) => {
  const arr = [...Object.entries(obj)];
  const result = {};
  const parentKey: string[] = [];
  let lastParent;

  while (arr.length) {
    const curNode = arr.shift();
    const [key, value] = curNode!;
    if (lastParent && lastParent[key] !== value) {
      parentKey.pop();
    }

    if (typeof value === 'object') {
      arr.unshift(...Object.entries(value!));
      parentKey.push(key);
      lastParent = value;
    } else if (typeof value === 'string') {
      result[value] = `${[...parentKey, key].join('.')}`;
    }
  }

  return result;
};

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

export { retrieveValuePath };
export { default as PromiseFlow } from './promiseFlow';

export function normalizeAddress(input: number | string): string {
  if (!input) {
    return '';
  }

  if (typeof input === 'number') {
    const buffer = ethUtil.toBuffer(input);
    input = ethUtil.bufferToHex(buffer);
  }

  if (typeof input !== 'string') {
    let msg = 'eth-sig-util.normalize() requires hex string or integer input.';
    msg += ` received ${typeof input}: ${input}`;
    throw new Error(msg);
  }

  return ethUtil.addHexPrefix(input);
}

export const wait = (fn: () => void, ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};

export const setPageStateCacheWhenPopupClose = (data) => {
  const cache = pageStateCache.get();
  if (cache && cache.path === '/import/wallet-connect') {
    pageStateCache.set({
      ...cache,
      states: {
        ...cache.states,
        data,
      },
    });
  }
};

export const hasWalletConnectPageStateCache = () => {
  const cache = pageStateCache.get();
  if (cache && cache.path === '/import/wallet-connect') {
    return true;
  }
  return false;
};

export const isSameAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase();
};
export const getEmulatorBaseURL = (network: FlowNetwork) => {
  return network === 'testnet' ? EMULATOR_HOST_TESTNET : EMULATOR_HOST_MAINNET;
};

export const checkEmulatorStatus = async (network: FlowNetwork): Promise<boolean> => {
  try {
    const baseURL = getEmulatorBaseURL(network);
    const response = await fetch(`${baseURL}/v1/blocks?height=sealed`);
    console.log('checkEmulatorStatus - response ', response);
    const data = await response.json();
    console.log('checkEmulatorStatus - data ', data);
    return !!data[0].block_status;
  } catch (error) {
    console.error('checkEmulatorAccount - error ', error);

    return false;
  }
};

export const checkEmulatorAccount = async (
  network: FlowNetwork,
  address: string
): Promise<boolean> => {
  try {
    const baseURL = getEmulatorBaseURL(network);
    const response = await fetch(`${baseURL}/v1/accounts/${address}`);
    const data = await response.json();
    return !!data.address;
  } catch (error) {
    console.error('checkEmulatorAccount - error ', error);
    return false;
  }
};

export const createEmulatorAccount = async (
  network: FlowNetwork,
  publicKey: string
): Promise<string> => {
  try {
    const baseURL = getEmulatorBaseURL(network);
    const response = await fetch(`${baseURL}/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signer: '0xf8d6e0586b0a20c7', // Service account
        keys: [
          {
            publicKey: publicKey,
            signAlgo: 2, // ECDSA_P256
            hashAlgo: 3, // SHA3_256
            weight: 1000,
          },
        ],
        contracts: {},
      }),
    });

    const data = await response.json();
    if (!data.address) {
      throw new Error('Failed to create emulator account');
    }
    return data.address;
  } catch (error) {
    console.error('Error creating emulator account:', error);
    throw error;
  }
};

export const getScripts = async (folder: string, scriptName: string) => {
  try {
    const { data } = await storage.get('cadenceScripts');
    const files = data[folder];
    const script = files[scriptName];
    const scriptString = Buffer.from(script, 'base64').toString('utf-8');
    const modifiedScriptString = scriptString.replaceAll('<platform_info>', `Extension-${version}`);
    return modifiedScriptString;
  } catch (error) {
    if (error instanceof Error) {
      mixpanelTrack.track('script_error', {
        script_id: scriptName,
        error: error.message,
      });
    }
    throw error;
  }
};

const getDefaultEmulatorScript = (type: string, name: string) => {
  const defaultScripts = {
    basic: {
      revokeKey: `
        transaction(keyIndex: Int) {
          prepare(signer: AuthAccount) {
            signer.keys.revoke(keyIndex: keyIndex)
          }
        }
      `,
    },
    storage: {
      getStorageInfo: `
        pub fun main(address: Address): {String: UFix64} {
          let account = getAccount(address)
          let used = account.storageUsed
          let capacity = account.storageCapacity
          return {
            "used": used,
            "capacity": capacity,
            "available": capacity - used
          }
        }
      `,
    },
  };

  return defaultScripts[type]?.[name] || '';
};

export const findKeyAndInfo = (keys, publicKey) => {
  const index = findPublicKeyIndex(keys, publicKey);
  if (index >= 0) {
    const key = keys.keys[index];
    return {
      index: index,
      signAlgo: key.signAlgoString,
      hashAlgo: key.hashAlgoString,
      publicKey: key.publicKey,
    };
  }
  return null;
};

export const findPublicKeyIndex = (data, publicKey) => {
  return data.keys.findIndex((key) => key.publicKey === publicKey);
};
