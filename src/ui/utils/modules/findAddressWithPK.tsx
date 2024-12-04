import { findAddressWithKey } from './findAddressWithPubKey';
import { pk2PubKey, seed2PubKey, seed2PubKeyTemp } from './passkey';

const findAddress = async (pubKTuple, address) => {
  const { P256, SECP256K1 } = pubKTuple;
  const p256Accounts = (await findAddressWithKey(P256.pubK, address)) || [];
  const sepc256k1Accounts = (await findAddressWithKey(SECP256K1.pubK, address)) || [];
  const pA = p256Accounts.map((s) => ({ ...s, pk: P256.pk }));
  const pS = sepc256k1Accounts.map((s) => ({ ...s, pk: SECP256K1.pk }));
  const accounts = pA.concat(pS);

  if (!accounts || accounts.length === 0) {
    return [
      {
        ...SECP256K1,
        weight: 1000,
        hashAlgo: 'SHA2_256',
        signAlgo: 'ECDSA_secp256k1',
        keyIndex: 0,
      },
    ];
  }

  const account = accounts.find((account) => account.weight >= 1000);
  return account ? [account] : null;
};

export const findAddressWithPK = async (pk, address) => {
  const pubKTuple = await pk2PubKey(pk);
  return await findAddress(pubKTuple, address);
};

export const findAddressWithSeed = async (seed, address, isTemp = false) => {
  let pubKTuple: {
    P256: {
      pubK: string;
      pk: string;
    };
    SECP256K1: {
      pubK: string;
      pk: string;
    };
  };
  if (isTemp) {
    pubKTuple = await seed2PubKeyTemp(seed);
  } else {
    pubKTuple = await seed2PubKey(seed);
  }
  return await findAddress(pubKTuple, address);
};
