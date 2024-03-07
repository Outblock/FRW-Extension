import { pk2PubKey, seed2PubKey } from './passkey';
import { findAddressWithKey } from './findAddressWithPubKey';

const findAddress = async (pubKTuple, address) => {
  const { P256, SECP256K1 } = pubKTuple;
  const p256Accounts = await findAddressWithKey(P256.pubK, address) || [];
  const sepc256k1Accounts = await findAddressWithKey(SECP256K1.pubK, address) || [];
  const pA = p256Accounts.map((s) => ({...s, pk: P256.pk}))
  const pS = sepc256k1Accounts.map((s) => ({...s, pk: SECP256K1.pk}))
  const accounts = pA.concat(pS)

  console.log('accounts 222 ==>', accounts);
  if (!accounts || accounts.length === 0) {
    return null
  }
  return accounts
}

export const findAddressWithPK = async (pk, address) => {
  const pubKTuple = await pk2PubKey(pk);
  console.log('pubKTuple ==>', pk, pubKTuple)
  return await findAddress(pubKTuple, address);
}

export const findAddressWithSeed = async (seed, address) => {
  const pubKTuple = await seed2PubKey(seed);
  return await findAddress(pubKTuple, address);
}