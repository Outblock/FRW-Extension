import { initWasm } from '@trustwallet/wallet-core';

import { getStringFromHashAlgo, getStringFromSignAlgo } from '@/shared/utils/algo';

import { FLOW_BIP44_PATH, HASH_ALGO, SIGN_ALGO } from '../../../shared/utils/algo-constants';
import storage from '../../webapi/storage';

const jsonToKey = async (json: string, password: string) => {
  try {
    const { StoredKey, PrivateKey } = await initWasm();
    // It appears StoredKey.importJSON expects a Buffer, not a string
    const jsonBuffer = Buffer.from(json);
    const keystore = StoredKey.importJSON(jsonBuffer);
    const privateKeyData = keystore.decryptPrivateKey(Buffer.from(password));
    const privateKey = PrivateKey.createWithData(privateKeyData);
    return privateKey;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const pk2PubKey = async (pk: string) => {
  const { PrivateKey } = await initWasm();
  const privateKey = PrivateKey.createWithData(Buffer.from(pk, 'hex'));

  const p256PubK = Buffer.from(privateKey.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const secp256PubK = Buffer.from(privateKey.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
      pk,
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk,
    },
  };
};

const formPubKey = async (pubKey) => {
  return {
    P256: {
      pubK: pubKey,
    },
    SECP256K1: {
      pubK: pubKey,
    },
  };
};

const seed2PubKey = async (seed: string) => {
  const { HDWallet, Curve } = await initWasm();

  const currentId = (await storage.get('currentId')) ?? 0;
  const accountIndex = (await storage.get('currentAccountIndex')) ?? 0;
  const pathKeyIndex = `user${accountIndex}_path`;
  const phraseKeyIndex = `user${accountIndex}_phrase`;

  const pathKeyId = `user${currentId}_path`;
  const phraseKeyId = `user${currentId}_phrase`;

  const path =
    (await storage.get(pathKeyId)) ?? (await storage.get(pathKeyIndex)) ?? FLOW_BIP44_PATH;

  const passphrase = (await storage.get(phraseKeyId)) ?? (await storage.get(phraseKeyIndex)) ?? '';

  const wallet = HDWallet.createWithMnemonic(seed, passphrase);
  const p256PK = wallet.getKeyByCurve(Curve.nist256p1, path);
  const p256PubK = Buffer.from(p256PK.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, path);
  const secp256PubK = Buffer.from(SECP256PK.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
      pk: Buffer.from(p256PK.data()).toString('hex'),
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk: Buffer.from(SECP256PK.data()).toString('hex'),
    },
  };
};

const seed2PubKeyTemp = async (seed: string) => {
  const { HDWallet, Curve } = await initWasm();

  const path = (await storage.get('temp_path')) || FLOW_BIP44_PATH;
  const passphrase = (await storage.get('temp_phrase')) || '';
  const wallet = HDWallet.createWithMnemonic(seed, passphrase);
  const p256PK = wallet.getKeyByCurve(Curve.nist256p1, path);
  const p256PubK = Buffer.from(p256PK.getPublicKeyNist256p1().uncompressed().data())
    .toString('hex')
    .replace(/^04/, '');
  const SECP256PK = wallet.getKeyByCurve(Curve.secp256k1, path);
  const secp256PubK = Buffer.from(SECP256PK.getPublicKeySecp256k1(false).data())
    .toString('hex')
    .replace(/^04/, '');
  return {
    P256: {
      pubK: p256PubK,
      pk: Buffer.from(p256PK.data()).toString('hex'),
    },
    SECP256K1: {
      pubK: secp256PubK,
      pk: Buffer.from(SECP256PK.data()).toString('hex'),
    },
  };
};

const signMessageHash = async (hashAlgo, messageData) => {
  // Other key
  const { Hash } = await initWasm();
  const messageHash =
    hashAlgo === HASH_ALGO.SHA3_256 ? Hash.sha3_256(messageData) : Hash.sha256(messageData);
  return messageHash;
};

const signWithKey = async (message, signAlgo, hashAlgo, pk) => {
  // Other key
  if (typeof signAlgo === 'number') {
    signAlgo = getStringFromSignAlgo(signAlgo);
  }
  if (typeof hashAlgo === 'number') {
    hashAlgo = getStringFromHashAlgo(hashAlgo);
  }
  const { Curve, Hash, PrivateKey } = await initWasm();
  const messageData = Buffer.from(message, 'hex');
  const privateKey = PrivateKey.createWithData(Buffer.from(pk, 'hex'));
  const curve = signAlgo === SIGN_ALGO.P256 ? Curve.nist256p1 : Curve.secp256k1;
  const messageHash =
    hashAlgo === HASH_ALGO.SHA3_256 ? Hash.sha3_256(messageData) : Hash.sha256(messageData);
  const signature = privateKey.sign(messageHash, curve);
  return Buffer.from(signature.subarray(0, signature.length - 1)).toString('hex');
};

export {
  jsonToKey,
  pk2PubKey,
  seed2PubKey,
  signMessageHash,
  signWithKey,
  seed2PubKeyTemp,
  formPubKey,
};
