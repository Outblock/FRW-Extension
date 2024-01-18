
import { AccountKey } from 'background/service/networkModel';
import HDWallet from 'ethereum-hdwallet';

export function sansPrefix(address) {
  if (address == null) return null;
  return address.replace(/^0x/, '').replace(/^Fx/, '');
}

export function withPrefix(address): string | null {
  if (address == null) return null;
  return '0x' + sansPrefix(address);
}

export function display(address) {
  return withPrefix(address);
}

export const getAccountKey = (mnemonic) => {
  const hdwallet = HDWallet.fromMnemonic(mnemonic);
  const publicKey = hdwallet
    .derive("m/44'/539'/0'/0/0")
    .getPublicKey()
    .toString('hex');
  const key: AccountKey = {
    hash_algo: 1,
    sign_algo: 2,
    weight: 1000,
    public_key: publicKey,
  };
  return key;
}