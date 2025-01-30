import { type PubKeyTuple } from '@/shared/types/pubkey-types';
import { getHashAlgo, getSignAlgo } from '@/shared/utils/algo';

import { findAddressWithPK } from './findAddressWithPK';
import { signWithKey } from './publicPrivateKey';

export const pubKey2AccountKey = async (
  pubKey: PubKeyTuple,
  storageAccount: { signAlgo: string; hashAlgo: string; weight: number },
  idToken: string
) => {
  const keys1 = pubKey.P256;
  const kesy2 = pubKey.SECP256K1;

  const account = storageAccount;
  const ktype =
    typeof account.signAlgo === 'string' ? getSignAlgo(account.signAlgo) : account.signAlgo;
  const keys = ktype === 1 ? keys1 : kesy2;
  let result = [
    {
      hashAlgo: account.hashAlgo,
      signAlgo: account.signAlgo,
      pubK: keys.pubK,
      weight: account.weight,
    },
  ];

  if (!result[0].pubK) {
    // Create a new result object with extension default setting
    const foundResult = await findAddressWithPK(keys.pk, '');
    if (!foundResult) {
      throw new Error('Unable to find a address with the provided PK. Aborting login.');
    }

    result = foundResult;
  }

  const rightPaddedHexBuffer = (value, pad) =>
    Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
  const USER_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from('FLOW-V0.0-user').toString('hex'), 32);
  const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

  // const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
  const hashAlgo = result[0].hashAlgo;
  const signAlgo = result[0].signAlgo;
  const publicKey = result[0].pubK;
  const accountKey = {
    public_key: publicKey,
    hash_algo: typeof hashAlgo === 'string' ? getHashAlgo(hashAlgo) : hashAlgo,
    sign_algo: typeof signAlgo === 'string' ? getSignAlgo(signAlgo) : signAlgo,
    weight: result[0].weight,
  };
  const realSignature = await signWithKey(Buffer.from(message, 'hex'), signAlgo, hashAlgo, keys.pk);
  return { accountKey, realSignature };
};
