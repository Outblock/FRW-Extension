import { createPersistStore } from 'background/utils';
import { WalletResponse, BlockchainResponse, ChildAccount, DeviceInfoRequest } from './networkModel';
import * as fcl from '@onflow/fcl';
import * as secp from '@noble/secp256k1';
import HDWallet from 'ethereum-hdwallet';
import { keyringService, openapiService } from 'background/service';
import wallet from 'background/controller/wallet';
import { getApp } from 'firebase/app';
import { signWithKey, pk2PubKey } from '@/ui/utils/modules/passkey.js';
import { findAddressWithSeed, findAddressWithPK } from '@/ui/utils/modules/findAddressWithPK';
import { withPrefix } from '@/ui/utils/address';
import { getAuth, signInAnonymously } from '@firebase/auth';
import { storage } from '../webapi';
import { getHashAlgo, getSignAlgo } from 'ui/utils';

interface UserWalletStore {
  wallets: Record<string, WalletResponse[]>;
  currentWallet: BlockchainResponse;
  childAccount: ChildAccount;
  network: string;
  monitor: string;
  activeChild: any;
}

class UserWallet {
  store!: UserWalletStore;

  init = async () => {
    this.store = await createPersistStore<UserWalletStore>({
      name: 'userWallets',
      template: {
        wallets: {
          mainnet: [],
          testnet: [],
          crescendo: [],
        },
        childAccount: {},
        currentWallet: {
          name: '',
          address: '',
          chain_id: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
          id: 1,
          coins: ['flow'],
        },
        activeChild: null,
        monitor: 'flowscan',
        network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
      },
    });
  };

  clear = async () => {
    this.store = {
      wallets: {
        mainnet: [],
        testnet: [],
        crescendo: [],
      },
      childAccount: {},
      currentWallet: {
        name: '',
        address: '',
        chain_id: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
        id: 1,
        coins: ['flow'],
      },
      activeChild: null,
      monitor: 'flowscan',
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
    };
  };

  setUserWallets = async (filteredData: Array<WalletResponse>, network: string) => {
    for (const x in filteredData) {
      const chainid = filteredData[x].chain_id;
      const singleWallet = filteredData[x];
      this.store.wallets[chainid] = [singleWallet];
    }

    console.log('this.store.wallets data:', this.store.wallets);
    const current = this.store.wallets[network][0].blockchain[0];
    this.store.currentWallet = current;
  };

  setChildWallet = (wallet: ChildAccount) => {
    this.store.childAccount = wallet;
  };

  setActiveWallet = (key: any) => {
    this.store.activeChild = key;
  };

  getActiveWallet = () => {
    return this.store.activeChild;
  };

  setCurrentWallet = (wallet: any, key: any, network: string) => {
    if (key) {
      this.store.currentWallet = wallet;
    } else {
      const current = this.store.wallets[network][0].blockchain[0];
      this.store.currentWallet = current;
    }
  };

  getUserWallets = (network: string) => {
    return this.store.wallets[network];
  };

  checkCrescendo = () => {
    return this.store.wallets['crescendo'];
  };

  setNetwork = async (network: string) => {
    if (!this.store) {
      await this.init();
    }
    if (this.store.network != network) {
      this.store.activeChild = null;
      this.store.currentWallet = this.store.wallets[network][0].blockchain[0];
    }
    this.store.network = network;
  };

  setMonitor = (monitor: string) => {
    this.store.monitor = monitor;
  };

  getNetwork = async (): Promise<string> => {
    if (!this.store) {
      await this.init();
    }
    return this.store.network;
  };

  getMonitor = (): string => {
    return this.store.monitor;
  };

  switchWallet = (walletId: number, blockId: string, sortKey: string, network: string) => {
    const wallets = this.store.wallets[network];
    let chain = {
      name: '',
      address: '',
      chain_id: 'testnet',
      id: 1,
      coins: ['flow'],
    } as BlockchainResponse;
    if (sortKey === 'id') {
      const chains = wallets.find((x) => x.wallet_id === walletId);
      chain = chains!.blockchain.find((y) => y.chain_id === blockId)!;
    } else {
      chain = wallets[walletId].blockchain[blockId];
    }
    this.store.currentWallet = chain;
  };

  getCurrentWallet = () => {
    return this.store.currentWallet;
  };

  getMainWallet = (network: string) => {
    const wallet = this.store.wallets[network][0].blockchain[0];
    return withPrefix(wallet.address) || '';
  };

  getCurrentAddress = (): string => {
    return withPrefix(this.store.currentWallet.address) || '';
  };

  sendTransaction = async (cadence: string, args: any[]): Promise<string> => {

    const allowed = await wallet.allowLilicoPay();
    const txID = await fcl.mutate({
      cadence: cadence,
      args: (arg, t) => args,
      proposer: this.authorizationFunction,
      authorizations: [this.authorizationFunction],
      payer: allowed ? this.payerAuthFunction : this.authorizationFunction,
      limit: 9999,
    });
    return txID;
  };

  sign = async (signableMessage: string): Promise<string> => {
    const hashAlgo = await storage.get('hashAlgo');
    const signAlgo = await storage.get('signAlgo');

    const password = keyringService.password;
    const privateKey = await wallet.getKey(password);

    const realSignature = await signWithKey(Buffer.from(signableMessage, 'hex'), signAlgo, hashAlgo, privateKey);
    return realSignature;
  };

  switchLogin = async (privateKey: string, replaceUser = true) => {

    const accountIndex = await storage.get('currentAccountIndex');
    const loggedInAccounts = await storage.get('loggedInAccounts') || [];
    const account = loggedInAccounts[accountIndex];

    console.log('account ', account);
    let result = [{
      hashAlgo: account.hashAlgo,
      signAlgo: account.signAlgo,
      pubK: account.pubKey,
      weight: account.weight
    }];


    if (!result[0].pubK) {
      console.log('No result found, creating a new result object');
      // Create a new result object with extension default setting
      result = await findAddressWithPK(privateKey, '');
    }
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(
      Buffer.from('FLOW-V0.0-user').toString('hex'),
      32
    );
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    // const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
    const hashAlgo = result[0].hashAlgo;
    const signAlgo = result[0].signAlgo;
    const publicKey = result[0].pubK;
    const accountKey = {
      public_key: publicKey,
      hash_algo: typeof hashAlgo === 'string' ? getHashAlgo(hashAlgo) : hashAlgo,
      sign_algo:  typeof signAlgo === 'string' ? getSignAlgo(signAlgo) : signAlgo,
      weight: result[0].weight,
    }
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(Buffer.from(message, 'hex'), signAlgo, hashAlgo, privateKey);
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  reSign = async () => {
    const password = keyringService.password;
    const privateKey = await wallet.getKey(password);
    return await this.sigInWithPk(privateKey);
  };

  authorizationFunction = async (account: any = {}) => {
    // authorization function need to return an account
    const address = fcl.withPrefix(await wallet.getCurrentAddress());
    const ADDRESS = fcl.withPrefix(address);
    // TODO: FIX THIS
    const KEY_ID = await storage.get('keyIndex');
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        return {
          addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: await this.sign(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        };
      },
    };
  };

  signPayer = async (signable: any): Promise<string> => {
    console.log('signable ->', signable);
    const tx = signable.voucher;
    const message = signable.message;
    const envelope = await openapiService.signPayer(tx, message);
    console.log('signPayer ->', envelope);
    const signature = envelope.envelopeSigs.sig;
    return signature;
  };

  payerAuthFunction = async (account: any = {}) => {
    console.log('payer ', account);
    // authorization function need to return an account
    const payer = await wallet.getPayerAddressAndKeyId();
    const address = fcl.withPrefix(payer.address);
    const ADDRESS = fcl.withPrefix(address);
    // TODO: FIX THIS
    const KEY_ID = payer.keyId;
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        const signature = await this.signPayer(signable);
        return {
          addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: signature, // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        };
      },
    };
  };

  signInWithMnemonic = async (mnemonic: string, replaceUser = true) => {
    const result = await findAddressWithSeed(mnemonic, '');
    if (!result) {
      throw new Error('No Address Found');
    }
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(
      Buffer.from('FLOW-V0.0-user').toString('hex'),
      32
    );
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    const privateKey = result[0].pk
    const hashAlgo = result[0].hashAlgo;
    const signAlgo = result[0].signAlgo;
    const publicKey = result[0].pubK;
    const accountKey = {
      public_key: publicKey,
      hash_algo: getHashAlgo(hashAlgo),
      sign_algo: getSignAlgo(signAlgo),
      weight: result[0].weight,
    }
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(Buffer.from(message, 'hex'), signAlgo, hashAlgo, privateKey);
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  sigInWithPk = async (privateKey: string, replaceUser = true) => {
    const result = await findAddressWithPK(privateKey, '');
    if (!result) {
      throw new Error('No Address Found');
    }
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(
      Buffer.from('FLOW-V0.0-user').toString('hex'),
      32
    );
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    // const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
    const hashAlgo = result[0].hashAlgo;
    const signAlgo = result[0].signAlgo;
    const publicKey = result[0].pubK;
    const accountKey = {
      public_key: publicKey,
      hash_algo: getHashAlgo(hashAlgo),
      sign_algo: getSignAlgo(signAlgo),
      weight: result[0].weight,
    }
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(Buffer.from(message, 'hex'), signAlgo, hashAlgo, privateKey);
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  signInv3 = async (mnemonic: string, accountKey: any, deviceInfo: any, replaceUser = true) => {
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(
      Buffer.from('FLOW-V0.0-user').toString('hex'),
      32
    );

    const hex = secp.utils.bytesToHex;
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
    const hdwallet = HDWallet.fromMnemonic(mnemonic);
    const privateKey = hdwallet.derive("m/44'/539'/0'/0/0").getPrivateKey().toString('hex');

    const publicKey = hex(secp.getPublicKey(privateKey).slice(1));
    if (accountKey.public_key === publicKey) {
      const signature = await secp.sign(messageHash, privateKey);
      const realSignature = secp.Signature.fromHex(signature).toCompactHex();
      return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);

    } else {
      return false
    }
  };

  getDeviceInfo = async (): Promise<DeviceInfoRequest> => {
    const result = await wallet.openapi.getLocation();
    const installationId = await wallet.openapi.getInstallationId();
    // console.log('location ', userlocation);
    const userlocation = result.data
    const deviceInfo: DeviceInfoRequest = {

      'city': userlocation.city,
      'continent': userlocation.country,
      'continentCode': userlocation.countryCode,
      'country': userlocation.country,
      'countryCode': userlocation.countryCode,
      'currency': userlocation.countryCode,
      device_id: installationId,
      'district': '',
      'ip': userlocation.query,
      'isp': userlocation.as,
      'lat': userlocation.lat,
      'lon': userlocation.lon,
      'name': 'FRW Chrome Extension',
      'org': userlocation.org,
      'regionName': userlocation.regionName,
      'type': '2',
      'user_agent': 'Chrome',
      'zip': userlocation.zip,

    };
    return deviceInfo;
  }
}

export default new UserWallet();
