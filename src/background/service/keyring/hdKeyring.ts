import { ethers, Wallet, HDNodeWallet } from 'ethers';

import { normalizeAddress } from 'background/utils';

export class HDKeyring {
  static type = 'HD Key Tree';
  type = 'HD Key Tree';

  private hdWallet: HDNodeWallet | null = null;
  private mnemonic: string | null = null;
  private activeIndexes: number[] = [];
  private basePath = "m/44'/539'/0'/0";

  constructor(opts?: { mnemonic?: string; activeIndexes?: number[] }) {
    if (opts?.mnemonic) {
      this.deserialize({
        mnemonic: opts.mnemonic,
        activeIndexes: opts.activeIndexes || [0],
      });
    }
  }

  async serialize() {
    return {
      mnemonic: this.hdWallet?.mnemonic?.phrase || this.mnemonic,
      activeIndexes: this.activeIndexes,
      publicKey: this.hdWallet?.publicKey || null,
    };
  }

  async deserialize(opts: { mnemonic: string; activeIndexes: number[] }) {
    this.mnemonic = opts.mnemonic;
    // Create base wallet from mnemonic only
    this.hdWallet = HDNodeWallet.fromPhrase(opts.mnemonic);
    // Store active indexes
    this.activeIndexes = opts.activeIndexes?.length ? opts.activeIndexes : [0];
  }

  async addAccounts(numberOfAccounts = 1) {
    // No need to add accounts
    throw new Error('Operation not supported');
  }

  async getAccounts() {
    if (!this.mnemonic) {
      throw new Error('Mnemonic is required');
    }
    return [this.mnemonic];
  }

  async removeAccount(address: string) {
    // No need to handle multiple accounts if we only care about mnemonic
    throw new Error('Operation not supported');
  }

  async exportAccount(address: string): Promise<string> {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');
    return wallet.privateKey;
  }

  async signTransaction(address: string, tx: any) {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');
    return wallet.signTransaction(tx);
  }

  async signMessage(address: string, data: string) {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');
    return wallet.signMessage(data);
  }

  async signPersonalMessage(address: string, data: string) {
    return this.signMessage(address, data);
  }

  async signTypedData(address: string, data: any, opts: { version: string } = { version: 'V1' }) {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');

    switch (opts.version) {
      case 'V1':
        return wallet.signTypedData(data.domain || {}, data.types || {}, data.message || {});
      case 'V3':
        return wallet.signTypedData(data.domain || {}, data.types || {}, data.message || {});
      case 'V4':
        return wallet.signTypedData(data.domain || {}, data.types || {}, data.message || {});
      default:
        throw new Error(`Unsupported typed data version: ${opts.version}`);
    }
  }

  async getEncryptionPublicKey(address: string) {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');
    return wallet.signingKey.publicKey;
  }

  async decryptMessage(address: string, data: string) {
    const wallet = this.hdWallet?.derivePath(`m/44'/539'/0'/0/${address}`);
    if (!wallet) throw new Error('Address not found');
    // Todo: This is a placeholder. Implement actual message decryption logic
    throw new Error('Message decryption not implemented');
  }

  async _getPrivateKey(index: number): Promise<any> {
    try {
      if (!this.mnemonic) {
        throw new Error('Mnemonic is required');
      }
      const mnemonic = ethers.Mnemonic.fromPhrase(this.mnemonic);
      // Create base HD node first, then derive the Flow path
      const baseNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);
      const flowPath = `m/44'/539'/0'/0/${index}`;
      const hdNode = baseNode.derivePath(flowPath);
      return hdNode.privateKey;
    } catch (err) {
      throw new Error(`Failed to derive private key: ${err.message}`);
    }
  }
}
