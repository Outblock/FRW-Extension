import * as ethUtil from 'ethereumjs-util';
import { ethErrors } from 'eth-rpc-errors';
import {
  keyringService,
  preferenceService,
  notificationService,
  permissionService,
  sessionService,
  openapiService,
  pageStateCacheService,
  userInfoService,
  coinListService,
  addressBookService,
  userWalletService,
  transactionService,
  nftService,
  googleDriveService,
  passwordService,
  flownsService,
  stakingService,
} from 'background/service';
import BN from 'bignumber.js';
import { openIndexPage } from 'background/webapi/tab';
import { CacheState } from 'background/service/pageStateCache';
import i18n from 'background/service/i18n';
import { KEYRING_CLASS, DisplayedKeryring } from 'background/service/keyring';
import providerController from './provider/controller';
import BaseController from './base';
import { INTERNAL_REQUEST_ORIGIN, EVENTS, KEYRING_TYPE } from 'consts';
import { Account } from '../service/preference';
import { ConnectedSite } from '../service/permission';
import user, { UserInfoStore } from '../service/user';
import { CoinItem } from '../service/coinList';
import DisplayKeyring from '../service/keyring/display';
import provider from './provider';
import eventBus from '@/eventBus';
import { setPageStateCacheWhenPopupClose } from 'background/utils';
import { withPrefix } from 'ui/utils/address';
import * as t from '@onflow/types';
import * as fcl from '@onflow/fcl';
import {
  fclTestnetConfig,
  fclMainnetConfig,
  fclSanboxnetConfig,
} from '../fclConfig';
import { notification, storage } from 'background/webapi';
import { NFTData, NFTModel } from '../service/networkModel';
import fetchConfig from 'background/utils/remoteConfig';
import defaultConfig from '../utils/defaultConfig.json';
import { getApp } from 'firebase/app';
import { getAuth } from '@firebase/auth';
import testnetCodes from '../service/swap/swap.deploy.config.testnet.json';
import mainnetCodes from '../service/swap/swap.deploy.config.mainnet.json';

const stashKeyrings: Record<string, any> = {};

export class WalletController extends BaseController {
  openapi = openapiService;

  /* wallet */
  boot = (password) => keyringService.boot(password);
  isBooted = () => keyringService.isBooted();
  verifyPassword = (password: string) =>
    keyringService.verifyPassword(password);

  // requestETHRpc = (data: { method: string; params: any }, chainId: string) => {
  //   return providerController.ethRpc(
  //     {
  //       data,
  //       session: {
  //         name: 'Flow Reference',
  //         origin: INTERNAL_REQUEST_ORIGIN,
  //         icon: './images/icon-128.png',
  //       },
  //     },
  //     chainId
  //   );
  // };

  sendRequest = (data) => {
    return provider({
      data,
      session: {
        name: 'Flow Reference',
        origin: INTERNAL_REQUEST_ORIGIN,
        icon: './images/icon-128.png',
      },
    });
  };

  getApproval = notificationService.getApproval;
  resolveApproval = notificationService.resolveApproval;
  rejectApproval = notificationService.rejectApproval;

  // initAlianNames = async () => {
  //   await preferenceService.changeInitAlianNameStatus();
  //   const keyrings = await keyringService.getAllTypedAccounts();
  //   const walletConnectKeyrings = keyrings.filter(
  //     (item) => item.type === 'WalletConnect'
  //   );
  //   const catergoryGroupAccount = keyrings.map((item) => ({
  //     type: item.type,
  //     accounts: item.accounts,
  //   }));
  //   let walletConnectList: DisplayedKeryring['accounts'] = [];
  //   for (let i = 0; i < walletConnectKeyrings.length; i++) {
  //     const keyring = walletConnectKeyrings[i];
  //     walletConnectList = [...walletConnectList, ...keyring.accounts];
  //   }
  //   const groupedWalletConnectList = groupBy(walletConnectList, 'brandName');
  //   if (keyrings.length > 0) {
  //     console.log(
  //       keyrings,
  //       'keyrings',
  //       groupedWalletConnectList,
  //       '==================='
  //     );
  //     // Object.keys(groupedWalletConnectList).forEach((key) => {
  //     //   groupedWalletConnectList[key].map((acc, index) => {
  //     //     this.updateAlianName(
  //     //       acc?.address,
  //     //       `${WALLET_BRAND_CONTENT[acc?.brandName]} ${index + 1}`
  //     //     );
  //     //   });
  //     // });
  //     const catergories = groupBy(
  //       catergoryGroupAccount.filter((group) => group.type !== 'WalletConnect'),
  //       'type'
  //     );
  //     const result = Object.keys(catergories)
  //       .map((key) =>
  //         catergories[key].map((item) =>
  //           item.accounts.map((acc) => ({
  //             address: acc.address,
  //             type: key,
  //           }))
  //         )
  //       )
  //       .map((item) => item.flat(1));
  //     result.forEach((group) =>
  //       group.forEach((acc, index) => {
  //         this.updateAlianName(
  //           acc?.address,
  //           `${BRAND_ALIAN_TYPE_TEXT[acc?.type]} ${index + 1}`
  //         );
  //       })
  //     );
  //   }
  // };

  unlock = async (password: string) => {
    // const alianNameInited = await preferenceService.getInitAlianNameStatus();
    // const alianNames = await preferenceService.getAllAlianName();
    await keyringService.submitPassword(password);

    // only password is correct then we store it
    await passwordService.setPassword(password);

    sessionService.broadcastEvent('unlock');
    // if (!alianNameInited && Object.values(alianNames).length === 0) {
    //   this.initAlianNames();
    // }
  };

  isUnlocked = async () => {
    const isUnlocked = keyringService.memStore.getState().isUnlocked;
    if (!isUnlocked) {
      let password = '';
      try {
        password = await passwordService.getPassword();
      } catch (err) {
        password = '';
      }
      if (password && password.length > 0) {
        try {
          await this.unlock(password);
          return keyringService.memStore.getState().isUnlocked;
        } catch (err) {
          await passwordService.clear();
          return false;
        }
      }
    }
    return isUnlocked;
  };

  lockWallet = async () => {
    await keyringService.setLocked();
    await passwordService.clear();
    sessionService.broadcastEvent('accountsChanged', []);
    sessionService.broadcastEvent('lock');
  };

  setPopupOpen = (isOpen) => {
    preferenceService.setPopupOpen(isOpen);
  };
  openIndexPage = openIndexPage;

  hasPageStateCache = () => pageStateCacheService.has();
  getPageStateCache = () => {
    if (!this.isUnlocked()) return null;
    return pageStateCacheService.get();
  };
  clearPageStateCache = () => pageStateCacheService.clear();
  setPageStateCache = (cache: CacheState) => pageStateCacheService.set(cache);

  getAddressBalance = async (address: string) => {
    const data = await openapiService.getCoinList(address);
    preferenceService.updateAddressBalance(address, data);
    return data;
  };
  getAddressCacheBalance = (address: string | undefined) => {
    if (!address) return null;
    return preferenceService.getAddressBalance(address);
  };

  setHasOtherProvider = (val: boolean) =>
    preferenceService.setHasOtherProvider(val);
  getHasOtherProvider = () => preferenceService.getHasOtherProvider();

  getExternalLinkAck = () => preferenceService.getExternalLinkAck();

  setExternalLinkAck = (ack) => preferenceService.setExternalLinkAck(ack);

  getLocale = () => preferenceService.getLocale();
  setLocale = (locale: string) => preferenceService.setLocale(locale);

  getLastTimeSendToken = (address: string) =>
    preferenceService.getLastTimeSendToken(address);
  setLastTimeSendToken = (address: string, token: any) =>
    preferenceService.setLastTimeSendToken(address, token);

  /* chains */
  getSavedChains = () => preferenceService.getSavedChains();
  saveChain = (id: string) => preferenceService.saveChain(id);
  updateChain = (list: string[]) => preferenceService.updateChain(list);
  /* connectedSites */

  getConnectedSite = permissionService.getConnectedSite;
  getConnectedSites = permissionService.getConnectedSites;
  setRecentConnectedSites = (sites: ConnectedSite[]) => {
    permissionService.setRecentConnectedSites(sites);
  };
  getRecentConnectedSites = () => {
    return permissionService.getRecentConnectedSites();
  };
  getCurrentConnectedSite = (tabId: number) => {
    const { origin } = sessionService.getSession(tabId) || {};
    return permissionService.getWithoutUpdate(origin);
  };
  updateConnectSite = (origin: string, data: ConnectedSite) => {
    permissionService.updateConnectSite(origin, data);
    // sessionService.broadcastEvent(
    //   'chainChanged',
    //   {
    //     chain: CHAINS[data.chain].hex,
    //     networkVersion: CHAINS[data.chain].network,
    //   },
    //   data.origin
    // );
  };
  removeConnectedSite = (origin: string) => {
    sessionService.broadcastEvent('accountsChanged', [], origin);
    permissionService.removeConnectedSite(origin);
  };
  // getSitesByDefaultChain = permissionService.getSitesByDefaultChain;
  topConnectedSite = (origin: string) =>
    permissionService.topConnectedSite(origin);
  unpinConnectedSite = (origin: string) =>
    permissionService.unpinConnectedSite(origin);
  /* keyrings */

  clearKeyrings = () => keyringService.clearKeyrings();


  getPrivateKey = async (
    password: string,
    { address, type }: { address: string; type: string }
  ) => {
    await this.verifyPassword(password);
    const keyring = await keyringService.getKeyringForAccount(address, type);
    if (!keyring) return null;
    return await keyring.exportAccount(address);
  };

  getMnemonics = async (password: string) => {
    await this.verifyPassword(password);
    const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);
    const serialized = await keyring.serialize();
    const seedWords = serialized.mnemonic;
    return seedWords;
  };

  importPrivateKey = async (data) => {
    const privateKey = ethUtil.stripHexPrefix(data);
    const buffer = Buffer.from(privateKey, 'hex');

    const error = new Error(i18n.t('the private key is invalid'));
    try {
      if (!ethUtil.isValidPrivate(buffer)) {
        throw error;
      }
    } catch {
      throw error;
    }

    const keyring = await keyringService.importPrivateKey(privateKey);
    return this._setCurrentAccountFromKeyring(keyring);
  };


  getPreMnemonics = () => keyringService.getPreMnemonics();
  generatePreMnemonic = () => keyringService.generatePreMnemonic();
  removePreMnemonics = () => keyringService.removePreMnemonics();
  createKeyringWithMnemonics = async (mnemonic) => {
    // TODO: NEED REVISIT HERE:
    await keyringService.clearKeyrings();

    const keyring = await keyringService.createKeyringWithMnemonics(mnemonic);
    keyringService.removePreMnemonics();
    return this._setCurrentAccountFromKeyring(keyring);
  };

  getHiddenAddresses = () => preferenceService.getHiddenAddresses();
  showAddress = (type: string, address: string) =>
    preferenceService.showAddress(type, address);
  hideAddress = (type: string, address: string, brandName: string) => {
    preferenceService.hideAddress(type, address, brandName);
    const current = preferenceService.getCurrentAccount();
    if (current?.address === address && current.type === type) {
      this.resetCurrentAccount();
    }
  };

  removeAddress = async (address: string, type: string, brand?: string) => {
    await keyringService.removeAccount(address, type, brand);
    preferenceService.removeAddressBalance(address);
    const current = preferenceService.getCurrentAccount();
    if (
      current?.address === address &&
      current.type === type &&
      current.brandName === brand
    ) {
      this.resetCurrentAccount();
    }
  };

  resetCurrentAccount = async () => {
    const [account] = await this.getAccounts();
    if (account) {
      preferenceService.setCurrentAccount(account);
    } else {
      preferenceService.setCurrentAccount(null);
    }
  };


  addKeyring = async (keyringId) => {
    const keyring = stashKeyrings[keyringId];
    if (keyring) {
      await keyringService.addKeyring(keyring);
      this._setCurrentAccountFromKeyring(keyring);
    } else {
      throw new Error('failed to addKeyring, keyring is undefined');
    }
  };

  getKeyringByType = (type: string) => keyringService.getKeyringByType(type);

  checkHasMnemonic = () => {
    try {
      const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);
      return !!keyring.mnemonic;
    } catch (e) {
      return false;
    }
  };

  deriveNewAccountFromMnemonic = async () => {
    const keyring = this._getKeyringByType(KEYRING_CLASS.MNEMONIC);

    const result = await keyringService.addNewAccount(keyring);
    this._setCurrentAccountFromKeyring(keyring, -1);
    return result;
  };

  getAccountsCount = async () => {
    const accounts = await keyringService.getAccounts();
    return accounts.filter((x) => x).length;
  };

  getTypedAccounts = async (type) => {
    return Promise.all(
      keyringService.keyrings
        .filter((keyring) => !type || keyring.type === type)
        .map((keyring) => keyringService.displayForKeyring(keyring))
    );
  };

  getAllVisibleAccounts: () => Promise<DisplayedKeryring[]> = async () => {
    const typedAccounts = await keyringService.getAllTypedVisibleAccounts();

    return typedAccounts.map((account) => ({
      ...account,
      keyring: new DisplayKeyring(account.keyring),
    }));
  };

  getAllVisibleAccountsArray: () => Promise<Account[]> = () => {
    return keyringService.getAllVisibleAccountsArray();
  };

  getAllClassAccounts: () => Promise<DisplayedKeryring[]> = async () => {
    const typedAccounts = await keyringService.getAllTypedAccounts();

    return typedAccounts.map((account) => ({
      ...account,
      keyring: new DisplayKeyring(account.keyring),
    }));
  };

  changeAccount = (account: Account) => {
    preferenceService.setCurrentAccount(account);
  };

  isUseLedgerLive = () => preferenceService.isUseLedgerLive();

  // updateUseLedgerLive = async (value: boolean) =>
  //   preferenceService.updateUseLedgerLive(value);

  connectHardware = async ({
    type,
    hdPath,
    needUnlock = false,
    isWebUSB = false,
  }: {
    type: string;
    hdPath?: string;
    needUnlock?: boolean;
    isWebUSB?: boolean;
  }) => {
    let keyring;
    let stashKeyringId: number | null = null;
    try {
      keyring = this._getKeyringByType(type);
    } catch {
      const Keyring = keyringService.getKeyringClassForType(type);
      keyring = new Keyring();
      stashKeyringId = Object.values(stashKeyrings).length;
      stashKeyrings[stashKeyringId] = keyring;
    }

    if (hdPath && keyring.setHdPath) {
      keyring.setHdPath(hdPath);
    }

    if (needUnlock) {
      await keyring.unlock();
    }

    if (keyring.useWebUSB) {
      keyring.useWebUSB(isWebUSB);
    }

    return stashKeyringId;
  };

  signPersonalMessage = async (
    type: string,
    from: string,
    data: string,
    options?: any
  ) => {
    const keyring = await keyringService.getKeyringForAccount(from, type);
    const res = await keyringService.signPersonalMessage(
      keyring,
      { from, data },
      options
    );
    if (type === KEYRING_TYPE.WalletConnectKeyring) {
      eventBus.emit(EVENTS.broadcastToUI, {
        method: EVENTS.SIGN_FINISHED,
        params: {
          success: true,
          data: res,
        },
      });
    }
    return res;
  };

  signTransaction = async (
    type: string,
    from: string,
    data: any,
    options?: any
  ) => {
    const keyring = await keyringService.getKeyringForAccount(from, type);
    return keyringService.signTransaction(keyring, data, options);
  };

  requestKeyring = (type, methodName, keyringId: number | null, ...params) => {
    let keyring;
    if (keyringId !== null && keyringId !== undefined) {
      keyring = stashKeyrings[keyringId];
    } else {
      try {
        keyring = this._getKeyringByType(type);
      } catch {
        const Keyring = keyringService.getKeyringClassForType(type);
        keyring = new Keyring();
      }
    }
    if (keyring[methodName]) {
      return keyring[methodName].call(keyring, ...params);
    }
  };

  unlockHardwareAccount = async (keyring, indexes, keyringId) => {
    let keyringInstance: any = null;
    try {
      keyringInstance = this._getKeyringByType(keyring);
    } catch (e) {
      // NOTHING
    }
    if (!keyringInstance && keyringId !== null && keyringId !== undefined) {
      await keyringService.addKeyring(stashKeyrings[keyringId]);
      keyringInstance = stashKeyrings[keyringId];
    }
    for (let i = 0; i < indexes.length; i++) {
      keyringInstance!.setAccountToUnlock(indexes[i]);
      await keyringService.addNewAccount(keyringInstance);
    }

    return this._setCurrentAccountFromKeyring(keyringInstance);
  };

  setIsDefaultWallet = (val: boolean) =>
    preferenceService.setIsDefaultWallet(val);
  isDefaultWallet = () => preferenceService.getIsDefaultWallet();

  private _getKeyringByType(type) {
    const keyring = keyringService.getKeyringsByType(type)[0];

    if (keyring) {
      return keyring;
    }

    throw ethErrors.rpc.internal(`No ${type} keyring found`);
  }

  private async _setCurrentAccountFromKeyring(keyring, index = 0) {
    const accounts = keyring.getAccountsWithBrand
      ? await keyring.getAccountsWithBrand()
      : await keyring.getAccounts();
    const account = accounts[index < 0 ? index + accounts.length : index];

    if (!account) {
      throw new Error('the current account is empty');
    }

    const _account = {
      address: typeof account === 'string' ? account : account.address,
      type: keyring.type,
      brandName: typeof account === 'string' ? keyring.type : account.brandName,
    };
    preferenceService.setCurrentAccount(_account);

    return [_account];
  }

  getHighlightWalletList = () => {
    return preferenceService.getWalletSavedList();
  };

  updateHighlightWalletList = (list) => {
    return preferenceService.updateWalletSavedList(list);
  };

  getAlianName = (address: string) => preferenceService.getAlianName(address);
  updateAlianName = (address: string, name: string) =>
    preferenceService.updateAlianName(address, name);
  getAllAlianName = () => preferenceService.getAllAlianName();
  // getInitAlianNameStatus = () => preferenceService.getInitAlianNameStatus();
  // updateInitAlianNameStatus = () =>
  //   preferenceService.changeInitAlianNameStatus();
  // getLastTimeGasSelection = (chainId) => {
  //   return preferenceService.getLastTimeGasSelection(chainId);
  // };

  // updateLastTimeGasSelection = (chainId: string, gas: ChainGas) => {
  //   return preferenceService.updateLastTimeGasSelection(chainId, gas);
  // };
  getIsFirstOpen = () => {
    return preferenceService.getIsFirstOpen();
  };
  updateIsFirstOpen = () => {
    return preferenceService.updateIsFirstOpen();
  };
  listChainAssets = async (address: string) => {
    return await openapiService.getCoinList(address);
  };
  // getAddedToken = (address: string) => {
  //   return preferenceService.getAddedToken(address);
  // };
  // updateAddedToken = (address: string, tokenList: []) => {
  //   return preferenceService.updateAddedToken(address, tokenList);
  // };

  // lilico new service

  // userinfo
  getUserInfo = async (forceRefresh: boolean) => {
    const data = await userInfoService.getUserInfo();

    if (forceRefresh) {
      return await this.fetchUserInfo();
    }

    if (data.username.length) {
      return data;
    }

    return await this.fetchUserInfo();
  };

  fetchUserInfo = async () => {
    const result = await openapiService.userInfo();
    const info = result['data'];
    info.avatar = this.addTokenForFirebaseImage(info.avatar);
    userInfoService.addUserInfo(info);
    return info;
  };

  addTokenForFirebaseImage = (avatar: string): string => {
    if (!avatar) {
      return avatar;
    }
    try {
      const url = new URL(avatar);
      if (url.host === 'firebasestorage.googleapis.com') {
        url.searchParams.append('alt', 'media');
        return url.toString();
      }
      return avatar;
    } catch (err) {
      console.log(err);
      return avatar;
    }
  };

  checkUserDomain = async (username: string) => {
    const res = await openapiService.getFlownsAddress(username, 'meow');
    const network = await this.getNetwork();

    if (res) {
      await userInfoService.setMeow(username + '.meow', network);
    }
  };

  checkUserChildAccount = async () => {
    const network = await this.getNetwork();

    const address = await userWalletService.getMainWallet(network);
    // const res = await openapiService.checkChildAccount(address);
    const meta = await openapiService.checkChildAccountMeta(
      address
    );
    // openapiService.checkChildAccountNFT(address).then((res) => {
    //   console.log(res)
    // }).catch((err) => {
    //   console.log(err)
    // })
    console.log('res ', meta);

    return meta;
  };

  checkAccessibleNft = async (childAccount) => {
    const network = await this.getNetwork();

    const address = await userWalletService.getMainWallet(network);
    // const res = await openapiService.checkChildAccount(address);
    // const nfts = await openapiService.queryAccessible(
    //   '0x84221fe0294044d7',
    //   '0x16c41a2b76dee69b'
    // );
    const nfts = await openapiService.queryAccessible(
      address,
      childAccount
    );
    // openapiService.checkChildAccountNFT(address).then((res) => {
    //   console.log(res)
    // }).catch((err) => {
    //   console.log(err)
    // })
    console.log('res nfts ', nfts);

    return nfts;
  };

  checkAccessibleFt = async (childAccount) => {
    const network = await this.getNetwork();

    const address = await userWalletService.getMainWallet(network);
    // const res = await openapiService.checkChildAccount(address);
    const result = await openapiService.queryAccessibleFt(
      address,
      childAccount
    );
    // openapiService.checkChildAccountNFT(address).then((res) => {
    //   console.log(res)
    // }).catch((err) => {
    //   console.log(err)
    // })
    console.log('res nfts ', result);

    return result;
  };

  fetchFlownsInbox = async () => {
    const info = await userInfoService.getUserInfo();
    const res = await openapiService.getFlownsInbox(info.username);

    return res;
  };

  setPopStat = async (stat: boolean) => {
    const network = await this.getNetwork();
    flownsService.setPop(network, stat);
  };

  fetchPopStat = async () => {
    const network = await this.getNetwork();
    const popStat = await flownsService.getPop(network);
    return popStat;
  };

  fetchUserDomain = async () => {
    const network = await this.getNetwork();
    const domain = await userInfoService.getMeow(network);
    return domain;
  };

  updateUserInfo = (data: UserInfoStore) => {
    userInfoService.updateUserInfo(data);
  };

  removeUserInfo = () => {
    userInfoService.removeUserInfo();
  };

  getDashIndex = async () => {
    const dashIndex = await userInfoService.getDashIndex();
    return dashIndex;
  };

  setDashIndex = (data: number) => {
    userInfoService.setDashIndex(data);
  };

  //coinList
  getCoinList = async (_expiry = 5000): Promise<CoinItem[]> => {
    const network = await this.getNetwork();
    const now = new Date();
    const expiry = coinListService.getExpiry();

    // compare the expiry time of the item with the current time
    if (now.getTime() > expiry) {
      this.refreshCoinList(_expiry);
    }

    return coinListService.listCoins(network);
  };

  private tokenPrice = async (tokenSymbol: string) => {
    const token = tokenSymbol.toLowerCase();
    switch (token) {
      case 'flow':
        return await openapiService.getTokenPrice('flow');
      case 'usdc':
        return await openapiService.getUSDCPrice();
      case 'fusd':
        return Promise.resolve({
          price: { last: '1.0', change: { percentage: '0.0' } },
        });
      default:
        return null;
    }
  };

  refreshCoinList = async (_expiry = 5000) => {
    const now = new Date();
    const exp = _expiry + now.getTime();
    coinListService.setExpiry(exp);

    const address = await this.getCurrentAddress();
    const tokenList = await openapiService.getEnabledTokenList();
    const balances = await openapiService.getTokenListBalance(
      address || '0x',
      tokenList
    );
    const prices = tokenList.map((token) => this.tokenPrice(token.symbol));
    const allBalance = await Promise.all(balances);
    const allPrice = await Promise.all(prices);

    const coins: CoinItem[] = tokenList.map((token, index) => ({
      coin: token.name,
      unit: token.symbol,
      icon: token.icon,
      balance: parseFloat(parseFloat(allBalance[index]).toFixed(3)),
      price:
        allPrice[index] === null
          ? 0
          : new BN(allPrice[index].price.last).toNumber(),
      change24h:
        allPrice[index] === null
          ? 0
          : new BN(allPrice[index].price.change.percentage)
            .multipliedBy(100)
            .toNumber(),
      total:
        allPrice[index] === null
          ? 0
          : this.currencyBalance(allBalance[index], allPrice[index].price.last),
    }));

    const network = await this.getNetwork();
    coins
      .sort((a, b) => {
        if (b.total === a.total) {
          return b.balance - a.balance;
        } else {
          return b.total - a.total;
        }
      })
      .map((coin) => coinListService.addCoin(coin, network));
    const allTokens = await openapiService.getAllTokenInfo();
    const enabledSymbols = tokenList.map((token) => token.symbol);
    const disableSymbols = allTokens
      .map((token) => token.symbol)
      .filter((symbol) => !enabledSymbols.includes(symbol));
    disableSymbols.map((coin) => coinListService.removeCoin(coin, network));
    return coinListService.listCoins(network);
  };

  private currencyBalance = (balance, price) => {
    const bnBalance = new BN(balance);
    const currencyBalance = bnBalance.times(new BN(price));
    return currencyBalance.toNumber();
  };

  setCurrentCoin = async (coinName: string) => {
    await coinListService.setCurrentCoin(coinName);
  };

  getCurrentCoin = async () => {
    return await coinListService.getCurrentCoin();
  };
  // addressBook
  setRecent = async (data) => {
    const network = await this.getNetwork();
    addressBookService.setRecent(data, network);
  };

  getRecent = async () => {
    const network = await this.getNetwork();
    return addressBookService.getRecent(network);
  };

  getAddressBook = async () => {
    const network = await this.getNetwork();
    const addressBook = await addressBookService.getAddresBook(network);
    if (!addressBook) {
      return await this.refreshAddressBook();
    } else if (!addressBook[0]) {
      return await this.refreshAddressBook();
    }
    return addressBook;
  };

  refreshAddressBook = async () => {
    const network = await this.getNetwork();
    const { data } = await openapiService.getAddressBook();
    const list = data.contacts;
    if (list && list.length > 0) {
      list.forEach((addressBook, index) => {
        if (list[index] && list[index].avatar) {
          list[index].avatar = this.addTokenForFirebaseImage(
            addressBook.avatar
          );
        }
      });
    }
    addressBookService.setAddressBook(list, network);
    return list;
  };

  checkAddress = async (address: string) => {
    const formatted = withPrefix(address.trim())!;

    if (!/^(0x)?[a-fA-F0-9]{16}$/.test(formatted)) {
      throw new Error('Invalid address length or format');
    }

    const account = await openapiService.getFlowAccount(formatted);
    if (!account) {
      throw new Error("Can't find address in chain");
    }
    return account;
  };

  //user wallets
  refreshUserWallets = async () => {
    const network = await this.getNetwork();
    const active = await userWalletService.getActiveWallet();
    const v2data = await openapiService.userWalletV2();
    if (!active) {
      userWalletService.setUserWallets(v2data.data.wallets, network);
    }

    return v2data.data.wallets;
  };

  getUserWallets = async () => {
    const network = await this.getNetwork();
    const wallets = await userWalletService.getUserWallets(network);
    if (!wallets[0]) {
      await this.refreshUserWallets();
      const data = await userWalletService.getUserWallets(network);
      return data;
    } else if (!wallets[0].blockchain) {
      await this.refreshUserWallets();
      const data = await userWalletService.getUserWallets(network);
      return data;
    }
    return wallets;
  };

  // switchWallet = async (walletId:number, blockId:number, _sortKey = 'id' ) => {
  //   const network = await this.getNetwork();
  //   await userWalletService.switchWallet(walletId, blockId, _sortKey,network);
  // }

  setChildWallet = async (wallet: any) => {
    await userWalletService.setChildWallet(wallet);
  };

  getActiveWallet = async () => {
    const activeWallet = await userWalletService.getActiveWallet();
    return activeWallet;
  };

  setActiveWallet = async (wallet: any, key: any) => {
    await userWalletService.setActiveWallet(key);

    const network = await this.getNetwork();
    await userWalletService.setCurrentWallet(wallet, key, network);
  };

  hasCurrentWallet = async () => {
    const wallet = await userWalletService.getCurrentWallet();
    return wallet.address !== '';
  };

  getCurrentWallet = async () => {
    const wallet = await userWalletService.getCurrentWallet();
    if (!wallet.address) {
      const data = this.refreshUserWallets();
      return data[0].blockchain[0];
    }
    return wallet;
  };

  getCurrentAddress = async () => {
    const address = await userWalletService.getCurrentAddress();
    if (!address) {
      const data = this.refreshUserWallets();
      return withPrefix(data[0].blockchain[0].address);
    } else if (address.length < 3) {
      const data = this.refreshUserWallets();
      return withPrefix(data[0].blockchain[0].address);
    }
    return withPrefix(address);
  };

  sendTransaction = async (cadence: string, args: any[]): Promise<string> => {
    return await userWalletService.sendTransaction(cadence, args);
  };

  unlinkChildAccount = async (address: string): Promise<string> => {
    const network = await this.getNetwork();
    return await userWalletService.sendTransaction(
      `
      import HybridCustody from 0xHybridCustody

      transaction(child: Address) {
          prepare (acct: AuthAccount) {
              let manager = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
                  ?? panic("manager not found")
              manager.removeChild(addr: child)
          }
      }
      `,
      [fcl.arg(address, t.Address)]
    );
  };

  editChildAccount = async (
    address: string,
    name: string,
    description: string,
    thumbnail: string
  ): Promise<string> => {
    const network = await this.getNetwork();
    return await userWalletService.sendTransaction(
      `
      import HybridCustody from 0xHybridCustody
      import MetadataViews from 0xMetadataViews

      transaction(childAddress: Address, name: String, description: String, thumbnail: String) {
          prepare(acct: AuthAccount) {
              let m = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
                  ?? panic("manager not found")
              
              let d = MetadataViews.Display(
                  name: name,
                  description: description,
                  thumbnail: MetadataViews.HTTPFile(url: thumbnail)
              )

              m.setChildAccountDisplay(address: childAddress, d)
          }
      }
      `,
      [
        fcl.arg(address, t.Address),
        fcl.arg(name, t.String),
        fcl.arg(description, t.String),
        fcl.arg(thumbnail, t.String),
      ]
    );
  };

  // TODO: Replace with generic token
  transferTokens = async (
    symbol: string,
    address: string,
    amount: string
  ): Promise<string> => {
    const token = await openapiService.getTokenInfo(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    const network = await this.getNetwork();
    return await userWalletService.sendTransaction(
      `
        import FungibleToken from 0xFungibleToken
        import <Token> from <TokenAddress>

        transaction(amount: UFix64, recipient: Address) {

          // The Vault resource that holds the tokens that are being transfered
          let sentVault: @FungibleToken.Vault

          prepare(signer: AuthAccount) {
            // Get a reference to the signer's stored vault
            let vaultRef = signer.borrow<&<Token>.Vault>(from: <TokenStoragePath>)
              ?? panic("Could not borrow reference to the owner's Vault!")

            // Withdraw tokens from the signer's stored vault
            self.sentVault <- vaultRef.withdraw(amount: amount)
          }

          execute {
            // Get the recipient's public account object
            let recipientAccount = getAccount(recipient)

            // Get a reference to the recipient's Receiver
            let receiverRef = recipientAccount.getCapability(<TokenReceiverPath>)!
              .borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow receiver reference to the recipient's Vault")

            // Deposit the withdrawn tokens in the recipient's receiver
            receiverRef.deposit(from: <-self.sentVault)
          }
        }
      `
        .replaceAll('<Token>', token.contract_name)
        .replaceAll('<TokenBalancePath>', token.storage_path.balance)
        .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
        .replaceAll('<TokenStoragePath>', token.storage_path.vault)
        .replaceAll('<TokenAddress>', token.address[network]),
      [fcl.arg(amount, t.UFix64), fcl.arg(address, t.Address)]
    );
  };

  // TODO: Replace with generic token
  transferInboxTokens = async (
    symbol: string,
    address: string,
    amount: string
  ): Promise<string> => {
    console.log('inbox');
    const token = await openapiService.getTokenInfo(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    const network = await this.getNetwork();
    return await userWalletService.sendTransaction(
      `
      import FungibleToken from 0xFungibleToken
      import Domains from 0xFlowns
      import <Token> from <TokenAddress>

      transaction(amount: UFix64, recipient: Address) {
        let senderRef: &{FungibleToken.Receiver}
        // The Vault resource that holds the tokens that are being transfered
        let sentVault: @FungibleToken.Vault
        let sender: Address

        prepare(signer: AuthAccount) {
          // Get a reference to the signer's stored vault
          let vaultRef = signer.borrow<&<Token>.Vault>(from: <TokenStoragePath>)
            ?? panic("Could not borrow reference to the owner's Vault!")
          self.senderRef = signer.getCapability(<TokenReceiverPath>)
            .borrow<&{FungibleToken.Receiver}>()!
          self.sender = vaultRef.owner!.address
          // Withdraw tokens from the signer's stored vault
          self.sentVault <- vaultRef.withdraw(amount: amount)
        }

        execute {
          // Get the recipient's public account object
          let recipientAccount = getAccount(recipient)

          // Get a reference to the recipient's Receiver
          let receiverRef = recipientAccount.getCapability(<TokenReceiverPath>)
            .borrow<&{FungibleToken.Receiver}>()
          
          if receiverRef == nil {
              let collectionCap = recipientAccount.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
              let collection = collectionCap.borrow()!
              var defaultDomain: &{Domains.DomainPublic}? = nil

              let ids = collection.getIDs()

              if ids.length == 0 {
                  panic("Recipient have no domain ")
              }
              
              defaultDomain = collection.borrowDomain(id: ids[0])!
                  // check defualt domain 
              for id in ids {
                let domain = collection.borrowDomain(id: id)!
                let isDefault = domain.getText(key: "isDefault")
                if isDefault == "true" {
                  defaultDomain = domain
                }
              }
              // Deposit the withdrawn tokens in the recipient's domain inbox
              defaultDomain!.depositVault(from: <- self.sentVault, senderRef: self.senderRef)

          } else {
              // Deposit the withdrawn tokens in the recipient's receiver
              receiverRef!.deposit(from: <- self.sentVault)
          }
        }
      }
      `
        .replaceAll('<Token>', token.contract_name)
        .replaceAll('<TokenBalancePath>', token.storage_path.balance)
        .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
        .replaceAll('<TokenStoragePath>', token.storage_path.vault)
        .replaceAll('<TokenAddress>', token.address[network]),
      [fcl.arg(amount, t.UFix64), fcl.arg(address, t.Address)]
    );
  };

  // TODO: Replace with generic token
  claimFTFromInbox = async (
    domain: string,
    amount: string,
    symbol: string,
    root = 'meow'
  ): Promise<string> => {
    const domainName = domain.split('.')[0];
    const token = await openapiService.getTokenInfoByContract(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    const network = await this.getNetwork();
    const address = fcl.sansPrefix(token.address[network]);
    const key = `A.${address}.${symbol}.Vault`;
    return await userWalletService.sendTransaction(
      `
      import Domains from 0xDomains
      import FungibleToken from 0xFungibleToken
      import Flowns from 0xFlowns
      import <Token> from <TokenAddress>

      transaction(name: String, root:String, key:String, amount: UFix64) {
        var domain: &{Domains.DomainPrivate}
        var vaultRef: &<Token>.Vault
        prepare(account: AuthAccount) {
          let prefix = "0x"
          let rootHahsh = Flowns.hash(node: "", lable: root)
          let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: name))

          let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath) 
          let collection = collectionCap.borrow()!
          var domain: &{Domains.DomainPrivate}? = nil
          let collectionPrivate = account.borrow<&{Domains.CollectionPrivate}>(from: Domains.CollectionStoragePath) ?? panic("Could not find your domain collection cap")
          
          let ids = collection.getIDs()

          let id = Domains.getDomainId(nameHash)
          if id != nil && !Domains.isDeprecated(nameHash: nameHash, domainId: id!) {
            domain = collectionPrivate.borrowDomainPrivate(id!)
          }

          self.domain = domain!
          let vaultRef = account.borrow<&<Token>.Vault>(from: <TokenStoragePath>)
          if vaultRef == nil {
            account.save(<- <Token>.createEmptyVault(), to: <TokenStoragePath>)

            account.link<&<Token>.Vault{FungibleToken.Receiver}>(
              <TokenReceiverPath>,
              target: <TokenStoragePath>
            )

            account.link<&<Token>.Vault{FungibleToken.Balance}>(
              <TokenBalancePath>,
              target: <TokenStoragePath>
            )
            self.vaultRef = account.borrow<&<Token>.Vault>(from: <TokenStoragePath>)
          ?? panic("Could not borrow reference to the owner's Vault!")

          } else {
            self.vaultRef = vaultRef!
          }
        }
        execute {
          self.vaultRef.deposit(from: <- self.domain.withdrawVault(key: key, amount: amount))
        }
      }
      `
        .replaceAll('<Token>', token.contract_name)
        .replaceAll('<TokenBalancePath>', token.storage_path.balance)
        .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
        .replaceAll('<TokenStoragePath>', token.storage_path.vault)
        .replaceAll('<TokenAddress>', token.address[network]),
      [
        fcl.arg(domainName, t.String),
        fcl.arg(root, t.String),
        fcl.arg(key, t.String),
        fcl.arg(amount, t.UFix64),
      ]
    );
  };

  claimNFTFromInbox = async (
    domain: string,
    itemId: string,
    symbol: string,
    root = 'meow'
  ): Promise<string> => {
    const domainName = domain.split('.')[0];
    const token = await openapiService.getNFTCollectionInfo(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    const address = fcl.sansPrefix(token.address);
    const key = `A.${address}.${symbol}.Collection`;
    return await userWalletService.sendTransaction(
      `
      import Domains from 0xDomains
      import Flowns from 0xFlowns
      import NonFungibleToken from 0xNonFungibleToken
      import MetadataViews from 0xMetadataViews
      import <NFT> from <NFTAddress>

      // key will be 'A.f8d6e0586b0a20c7.Domains.Collection' of a NFT collection
      transaction(name: String, root: String, key: String, itemId: UInt64) {
        var domain: &{Domains.DomainPrivate}
        var collectionRef: &<NFT>.Collection
        prepare(account: AuthAccount) {
          let prefix = "0x"
          let rootHahsh = Flowns.hash(node: "", lable: root)
          let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: name))
          var domain: &{Domains.DomainPrivate}? = nil
          let collectionPrivate = account.borrow<&{Domains.CollectionPrivate}>(from: Domains.CollectionStoragePath) ?? panic("Could not find your domain collection cap")

          let id = Domains.getDomainId(nameHash)
          if id !=nil {
            domain = collectionPrivate.borrowDomainPrivate(id!)
          }
          self.domain = domain!

          let collectionRef = account.borrow<&<NFT>.Collection>(from: <CollectionStoragePath>)
          if collectionRef == nil {
            account.save(<- <NFT>.createEmptyCollection(), to: <CollectionStoragePath>)
            account.link<&<CollectionPublicType>>(<CollectionPublicPath>, target: <CollectionStoragePath>)
            self.collectionRef = account.borrow<&<NFT>.Collection>(from: <CollectionStoragePath>)?? panic("Can not borrow collection")
          } else {
            self.collectionRef = collectionRef!
          }
        
        }
        execute {
          self.collectionRef.deposit(token: <- self.domain.withdrawNFT(key: key, itemId: itemId))
        }
      }
      `
        .replaceAll('<NFT>', token.contract_name)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage_path)
        .replaceAll('<CollectionPublicType>', token.path.public_type)
        .replaceAll('<CollectionPublicPath>', token.path.public_path),
      [
        fcl.arg(domainName, t.String),
        fcl.arg(root, t.String),
        fcl.arg(key, t.String),
        fcl.arg(itemId, t.UInt64),
      ]
    );
  };

  enableTokenStorage = async (symbol: string) => {
    const token = await openapiService.getTokenInfo(symbol);
    if (!token) {
      return;
    }
    const network = await this.getNetwork();
    return await userWalletService.sendTransaction(
      `
      import FungibleToken from 0xFungibleToken
      import <Token> from <TokenAddress>
      
      transaction {
      
        prepare(signer: AuthAccount) {
          if(signer.borrow<&<Token>.Vault>(from: <TokenStoragePath>) == nil) {
            signer.save(<-<Token>.createEmptyVault(), to: <TokenStoragePath>)
          }

          signer.unlink(
            <TokenReceiverPath>
          )
      
          signer.link<&<Token>.Vault{FungibleToken.Receiver}>(
            <TokenReceiverPath>,
            target: <TokenStoragePath>
          )

          signer.unlink(
            <TokenBalancePath>
          )

          signer.link<&<Token>.Vault{FungibleToken.Balance}>(
            <TokenBalancePath>,
            target: <TokenStoragePath>
          )
        }
      }
      `
        .replaceAll('<Token>', token.contract_name)
        .replaceAll('<TokenBalancePath>', token.storage_path.balance)
        .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
        .replaceAll('<TokenStoragePath>', token.storage_path.vault)
        .replaceAll('<TokenAddress>', token.address[network]),
      []
    );
  };

  enableNFTStorage = async (contract_name: string) => {
    const result = await openapiService.genTx(contract_name);
    if (!result) {
      return;
    }
    const cadence = result.data;
    return await userWalletService.sendTransaction(cadence, []);
  };

  enableNFTStorageLocal = async (token: NFTModel) => {
    const cadence = `
    import NonFungibleToken from 0xNonFungibleToken
    import MetadataViews from 0xMetadataViews
    import <NFT> from <NFTAddress>

    transaction {

      prepare(signer: AuthAccount) {
        if signer.borrow<&<NFT>.Collection>(from: <CollectionStoragePath>) == nil {
          let collection <- <NFT>.createEmptyCollection()
          signer.save(<-collection, to: <CollectionStoragePath>)
        }
        if (signer.getCapability<&<CollectionPublicType>>(<CollectionPublicPath>).borrow() == nil) {
          signer.unlink(<CollectionPublicPath>)
          signer.link<&<CollectionPublicType>>(<CollectionPublicPath>, target: <CollectionStoragePath>)
        }
      }
    }
    `
      .replaceAll('<NFT>', token.contract_name)
      .replaceAll('<NFTAddress>', token.address)
      .replaceAll('<CollectionStoragePath>', token.path.storage_path)
      .replaceAll('<CollectionPublicType>', token.path.public_type)
      .replaceAll('<CollectionPublicPath>', token.path.public_path);
    return await userWalletService.sendTransaction(cadence, []);
  };

  sendNFT = async (
    recipient: string,
    id: any,
    token: NFTModel
  ): Promise<string> => {
    const network = await this.getNetwork();

    return await userWalletService.sendTransaction(
      `
      import NonFungibleToken from 0xNonFungibleToken
      import <NFT> from <NFTAddress>

      // This transaction is for transferring and NFT from
      // one account to another

      transaction(recipient: Address, withdrawID: UInt64) {

          prepare(signer: AuthAccount) {
              // get the recipients public account object
              let recipient = getAccount(recipient)

              // borrow a reference to the signer's NFT collection
              let collectionRef = signer
                  .borrow<&NonFungibleToken.Collection>(from: <CollectionStoragePath>)
                  ?? panic("Could not borrow a reference to the owner's collection")

              // borrow a public reference to the receivers collection
              let depositRef = recipient
                  .getCapability(<CollectionPublicPath>)
                  .borrow<&{NonFungibleToken.Collection>}>()
                  ?? panic("Could not borrow a reference to the receiver's collection")

              // withdraw the NFT from the owner's collection
              let nft <- collectionRef.withdraw(withdrawID: withdrawID)

              // Deposit the NFT in the recipient's collection
              depositRef.deposit(token: <-nft)
          }
      }
      `
        .replaceAll('<NFT>', token.contract_name)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage_path)
        .replaceAll('<CollectionPublicPath>', token.path.public_path),
      [fcl.arg(recipient, t.Address), fcl.arg(parseInt(id), t.UInt64)]
    );
  };

  sendNBANFT = async (
    recipient: string,
    id: any,
    token: NFTModel
  ): Promise<string> => {
    const network = await this.getNetwork();

    return await userWalletService.sendTransaction(
      `
      import NonFungibleToken from 0xNonFungibleToken
        import Domains from 0xDomains
        import <NFT> from <NFTAddress>
      // This transaction is for transferring and NFT from
      // one account to another
      transaction(recipient: Address, withdrawID: UInt64) {
        prepare(signer: AuthAccount) {
          // get the recipients public account object
          let recipient = getAccount(recipient)
          // borrow a reference to the signer''s NFT collection
          let collectionRef = signer
            .borrow<&NonFungibleToken.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow a reference to the owner''s collection")
          let senderRef = signer
            .getCapability(/public/MomentCollection)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
          // borrow a public reference to the receivers collection
          let recipientRef = recipient
            .getCapability(/public/MomentCollection)
            .borrow<&{TopShot.MomentCollectionPublic}>()
          
          if recipientRef == nil {
            let collectionCap = recipient.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
            let collection = collectionCap.borrow()!
            var defaultDomain: &{Domains.DomainPublic}? = nil
          
            let ids = collection.getIDs()
            if ids.length == 0 {
              panic("Recipient have no domain ")
            }
            
            // check defualt domain
            defaultDomain = collection.borrowDomain(id: ids[0])!
            // check defualt domain
            for id in ids {
              let domain = collection.borrowDomain(id: id)!
              let isDefault = domain.getText(key: "isDefault")
              if isDefault == "true" {
                defaultDomain = domain
              }
            }
            let typeKey = collectionRef.getType().identifier
            // withdraw the NFT from the owner''s collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            if defaultDomain!.checkCollection(key: typeKey) == false {
              let collection <- TopShot.createEmptyCollection()
              defaultDomain!.addCollection(collection: <- collection)
            }
            defaultDomain!.depositNFT(key: typeKey, token: <- nft, senderRef: senderRef )
          } else {
            // withdraw the NFT from the owner''s collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            // Deposit the NFT in the recipient''s collection
            recipientRef!.deposit(token: <-nft)
          }
        }
      }
      `
        .replaceAll('<NFT>', token.contract_name)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage_path)
        .replaceAll('<CollectionPublicPath>', token.path.public_path),
      [fcl.arg(recipient, t.Address), fcl.arg(parseInt(id), t.UInt64)]
    );
  };

  sendInboxNFT = async (
    recipient: string,
    id: any,
    token: NFTModel
  ): Promise<string> => {
    console.log(token, id);
    return await userWalletService.sendTransaction(
      `
      import NonFungibleToken from 0xNonFungibleToken
      import Domains from 0xDomains
      import <NFT> from <NFTAddress>


      // This transaction is for transferring and NFT from
      // one account to another

      transaction(recipient: Address, withdrawID: UInt64) {

        prepare(signer: AuthAccount) {
          // get the recipients public account object
          let recipient = getAccount(recipient)

          // borrow a reference to the signer's NFT collection
          let collectionRef = signer
            .borrow<&NonFungibleToken.Collection>(from: <CollectionStoragePath>)
            ?? panic("Could not borrow a reference to the owner's collection")

          let senderRef = signer
            .getCapability(<CollectionPublicPath>)
            .borrow<&{NonFungibleToken.CollectionPublic}>()

          // borrow a public reference to the receivers collection
          let recipientRef = recipient
            .getCapability(<CollectionPublicPath>)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
          
          if recipientRef == nil {
            let collectionCap = recipient.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
            let collection = collectionCap.borrow()!
            var defaultDomain: &{Domains.DomainPublic}? = nil
          
            let ids = collection.getIDs()

            if ids.length == 0 {
              panic("Recipient have no domain ")
            }
            
            // check defualt domain 
            defaultDomain = collection.borrowDomain(id: ids[0])!
            // check defualt domain 
            for id in ids {
              let domain = collection.borrowDomain(id: id)!
              let isDefault = domain.getText(key: "isDefault")
              if isDefault == "true" {
                defaultDomain = domain
              }
            }
            let typeKey = collectionRef.getType().identifier
            // withdraw the NFT from the owner's collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            if defaultDomain!.checkCollection(key: typeKey) == false {
              let collection <- <NFT>.createEmptyCollection()
              defaultDomain!.addCollection(collection: <- collection)
            }
            defaultDomain!.depositNFT(key: typeKey, token: <- nft, senderRef: senderRef )
          } else {
            // withdraw the NFT from the owner's collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            // Deposit the NFT in the recipient's collection
            recipientRef!.deposit(token: <-nft)
          }
        }
      }
      `
        .replaceAll('<NFT>', token.contract_name)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage_path)
        .replaceAll('<CollectionPublicPath>', token.path.public_path),
      [fcl.arg(recipient, t.Address), fcl.arg(parseInt(id), t.UInt64)]
    );
  };

  // SwapTokensForExactTokens
  swapSend = async (
    swapPaths,
    tokenInMax,
    tokenInVaultPath,
    tokenOutSplit,
    tokenOutVaultPath,
    tokenOutReceiverPath,
    tokenOutBalancePath,
    deadline
  ): Promise<string> => {
    const network = await this.getNetwork();
    let SwapConfig = testnetCodes;
    if (network == 'mainnet') {
      SwapConfig = mainnetCodes;
    }
    const CODE = SwapConfig.Codes.Transactions.SwapTokensForExactTokens;
    const tokenInKey = swapPaths[0];
    const tokenOutKey = swapPaths[swapPaths.length - 1];
    const arr = tokenOutKey.split('.');
    if (arr.length != 3) {
      throw Error(
        `Invalid TokenKey String, expect [A.adress.name] got ${tokenOutKey}`
      );
    }
    const tokenName = arr[2];
    const tokenAddress = `0x${arr[1]}`;
    return await userWalletService.sendTransaction(
      CODE.replaceAll('Token1Name', tokenName).replaceAll(
        'Token1Addr',
        tokenAddress
      ),
      [
        fcl.arg(swapPaths, t.Array(t.String)),
        fcl.arg(tokenOutSplit, t.Array(t.UFix64)),
        fcl.arg(tokenInMax.toFixed(8), t.UFix64),
        fcl.arg(deadline.toFixed(8), t.UFix64),
        fcl.arg({ domain: 'storage', identifier: tokenInVaultPath }, t.Path),
        fcl.arg({ domain: 'storage', identifier: tokenOutVaultPath }, t.Path),
        fcl.arg({ domain: 'public', identifier: tokenOutReceiverPath }, t.Path),
        fcl.arg({ domain: 'public', identifier: tokenOutBalancePath }, t.Path),
      ]
    );
  };

  // SwapExactTokensForTokens
  sendSwap = async (
    swapPaths,
    tokenInSplit,
    tokenInVaultPath,
    tokenOutMin,
    tokenOutVaultPath,
    tokenOutReceiverPath,
    tokenOutBalancePath,
    deadline
  ): Promise<string> => {
    const network = await this.getNetwork();
    let SwapConfig = testnetCodes;
    if (network == 'mainnet') {
      SwapConfig = mainnetCodes;
    }
    const CODE = SwapConfig.Codes.Transactions.SwapExactTokensForTokens;
    const tokenOutKey = swapPaths[swapPaths.length - 1];
    const arr = tokenOutKey.split('.');
    if (arr.length != 3) {
      throw Error(
        `Invalid TokenKey String, expect [A.adress.name] got ${tokenOutKey}`
      );
    }
    const tokenName = arr[2];
    const tokenAddress = `0x${arr[1]}`;
    return await userWalletService.sendTransaction(
      CODE.replaceAll('Token1Name', tokenName).replaceAll(
        'Token1Addr',
        tokenAddress
      ),
      [
        fcl.arg(swapPaths, t.Array(t.String)),
        fcl.arg(tokenInSplit, t.Array(t.UFix64)),
        fcl.arg(tokenOutMin.toFixed(8), t.UFix64),
        fcl.arg(deadline.toFixed(8), t.UFix64),
        fcl.arg({ domain: 'storage', identifier: tokenInVaultPath }, t.Path),
        fcl.arg({ domain: 'storage', identifier: tokenOutVaultPath }, t.Path),
        fcl.arg({ domain: 'public', identifier: tokenOutReceiverPath }, t.Path),
        fcl.arg({ domain: 'public', identifier: tokenOutBalancePath }, t.Path),
      ]
    );
  };

  //transaction

  getTransaction = async (
    address: string,
    limit: number,
    offset: number,
    _expiry = 60000
  ) => {
    const network = await this.getNetwork();
    const now = new Date();
    const expiry = transactionService.getExpiry();
    // compare the expiry time of the item with the current time

    const txList = {};

    // txList['list'] = await transactionService.listTransactions();
    txList['count'] = await transactionService.getCount();
    const sealed = await transactionService.listTransactions(network);
    if (now.getTime() > expiry) {
      this.refreshTransaction(address, limit, offset, _expiry);
    }
    const pending = await transactionService.listPending(network);
    let totalList = sealed;
    if (pending && pending.length > 0) {
      totalList = pending.concat(sealed);
    }
    txList['list'] = totalList;

    return txList;
  };

  getPendingTx = async () => {
    const network = await this.getNetwork();
    const pending = await transactionService.listPending(network);
    return pending;
  };

  refreshTransaction = async (
    address: string,
    limit: number,
    offset: number,
    _expiry = 5000
  ) => {
    const network = await this.getNetwork();
    const now = new Date();
    const exp = _expiry + now.getTime();
    transactionService.setExpiry(exp);

    const dataResult = await openapiService.getTransfers(address, '', limit);
    transactionService.setTransaction(dataResult.data, network);
    chrome.runtime.sendMessage({
      msg: 'transferListReceived',
    });
  };

  signInWithMnemonic = async (mnemonic: string, replaceUser = true) => {
    return userWalletService.signInWithMnemonic(mnemonic, replaceUser);
  };

  signMessage = async (message: string): Promise<string> => {
    return userWalletService.sign(message);
  };

  switchNetwork = async (network: string) => {
    await userWalletService.setNetwork(network);
    if (network === 'testnet') {
      await fclTestnetConfig();
    } else if (network == 'mainnet') {
      await fclMainnetConfig();
    } else {
      await fclSanboxnetConfig();
    }
    this.refreshAll();
    eventBus.emit('switchNetwork', network);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      tabs[0].id &&
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'FCW:NETWORK',
          network: network,
        });
    });
  };

  checkNetwork = async () => {
    const network = await this.getNetwork();
    await this.switchNetwork(network);
  };

  switchMonitor = async (monitor: string) => {
    await userWalletService.setMonitor(monitor);
  };

  getMonitor = (): string => {
    return userWalletService.getMonitor();
  };

  refreshAll = async () => {
    const wallets = await this.refreshUserWallets();
    this.refreshAddressBook();
    const address = await this.getCurrentAddress();
    if (address) {
      this.refreshTransaction(address, 15, 0);
    }
    this.refreshCoinList();
  };

  getNetwork = async (): Promise<string> => {
    return await userWalletService.getNetwork();
  };

  getFlowscanURL = async (): Promise<string> => {
    const network = await this.getNetwork();
    let baseURL = 'https://flowdiver.io';
    switch (network) {
      case 'testnet':
        baseURL = 'https://testnet.flowdiver.io';
        break;
      case 'mainnet':
        baseURL = 'https://flowdiver.io';
        break;
      case 'sandboxnet':
        baseURL = 'https://sandboxnet.flowscan.org';
        break;
    }
    return baseURL;
  };

  getViewSourceUrl = async (): Promise<string> => {
    const network = await this.getNetwork();
    let baseURL = 'https://flow-view-source.com/mainnet';
    switch (network) {
      case 'mainnet':
        baseURL = 'https://flow-view-source.com/mainnet';
        break;
      case 'testnet':
        baseURL = 'https://flow-view-source.com/testnet';
        break;
      case 'sandboxnet':
        baseURL = 'https://flow-view-source.vercel.app/sandboxnet';
        break;
    }
    return baseURL;
  };

  listenTransaction = async (
    txId: string,
    sendNotification = true,
    title = chrome.i18n.getMessage('Transaction__Sealed'),
    body = '',
    icon = chrome.runtime.getURL('./images/icon-64.png')
  ) => {
    if (!txId || !txId.match(/^0?x?[0-9a-fA-F]{64}/)) {
      return;
    }
    const address = (await this.getCurrentAddress()) || '0x';
    const network = await this.getNetwork();
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chrome.storage.session.set({
        transactionPending: { txId, network, date: new Date() },
      });
      eventBus.emit('transactionPending');
      chrome.runtime.sendMessage({
        msg: 'transactionPending',
        network: network,
      });
      transactionService.setPending(txId, address, network, icon, title);
      await fcl.tx(txId).onceSealed();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await chrome.storage.session.remove('transactionPending');
      const baseURL = this.getFlowscanURL();
      transactionService.removePending(txId, address, network);
      this.refreshTransaction(address, 15, 0);
      eventBus.emit('transactionDone');
      chrome.runtime.sendMessage({
        msg: 'transactionDone',
      });
      if (sendNotification) {
        notification.create(
          `${baseURL}/transaction/${txId}`,
          title,
          body,
          icon
        );
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await chrome.storage.session.remove('transactionPending');
      transactionService.removePending(txId, address, network);
      chrome.runtime.sendMessage({
        msg: 'transactionDone',
      });
    }
  };

  getNFTListCahce = async (): Promise<NFTData> => {
    const network = await this.getNetwork();
    // const list =
    // if (!list.length){
    // const data = this.refreshNft(address);
    // return data;
    // }
    return await nftService.getNft(network);
  };

  refreshNft = async (address: string, offset = 0): Promise<NFTData> => {
    // change the address to real address after testing complete
    // const address = await this.getCurrentAddress();
    const limit = 24;
    // const {data} = await openapiService.getNFTListV2(address!, offset, limit);
    const data = await openapiService.nftCatalogList(address!, limit, offset);
    const nfts = data.nfts;
    if (!nfts) {
      return {
        nfts: [],
        nftCount: data.nftCount,
      };
    }
    nfts.map((nft) => {
      nft.unique_id = nft.collectionName + '_' + nft.id;
    });
    function getUniqueListBy(arr, key) {
      return [...new Map(arr.map((item) => [item[key], item])).values()];
    }
    const unique_nfts = getUniqueListBy(nfts, 'unique_id');
    const network = await this.getNetwork();
    const result = { nfts: unique_nfts, nftCount: data.nftCount };
    nftService.setNft(result, network);
    return result;
  };

  clearNFT = () => {
    nftService.clear();
  };

  clearNFTList = async () => {
    await nftService.clearNFTList();
  };

  clearNFTCollection = async () => {
    await nftService.clearNFTCollection();
  };

  clearAllStorage = () => {
    nftService.clear();
    userInfoService.removeUserInfo();
    coinListService.clear();
    addressBookService.clear();
    userWalletService.clear();
    transactionService.clear();
  };

  clearLocalStorage = async () => {
    await storage.clear();
  };

  getCollectionCache = async () => {
    const network = await this.getNetwork();
    const list = await nftService.getCollectionList(network);
    if (!list) {
      return [];
    }
    const sortedList = list.sort((a, b) => b.count - a.count);
    return sortedList;
  };

  getSingleCollectionCache = async (collectionId: string) => {
    const network = await this.getNetwork();
    const list = await nftService.getSingleCollection(collectionId, network);
    if (!list) {
      return [];
    }
    return list;
  };

  getSingleCollection = async (
    address: string,
    contract: string,
    offset = 0
  ) => {
    // const {data} = await openapiService.getSingleCollectionV2(address!, contract, offset)
    const data = await openapiService.nftCatalogCollectionList(
      address!,
      contract,
      24,
      offset
    );

    data.nfts.map((nft) => {
      nft.unique_id = nft.collectionName + '_' + nft.id;
    });
    function getUniqueListBy(arr, key) {
      return [...new Map(arr.map((item) => [item[key], item])).values()];
    }
    const unique_nfts = getUniqueListBy(data.nfts, 'unique_id');
    data.nfts = unique_nfts;
    return data;
  };

  getCollectionApi = async (address: string, contract: string, offset = 0) => {
    const network = await this.getNetwork();
    // const {data} = await openapiService.getSingleCollectionV2(address!, contract, offset)
    const result = await openapiService.nftCollectionApiPaging(
      address!,
      contract,
      24,
      offset,
      network
    );
    console.log('result  ---- ', result.collection.display);
    result['info'] = result.collection;
    // result['info']['collectionDisplay']['name'] = result.collection.display.name
    // result['nftCount'] = result.collection.nftCount
    console.log('result  ---- ', result);
    return result;
  };

  refreshCollection = async (address: string) => {
    // change the address to real address after testing complete
    // const address = await this.getCurrentAddress();
    const network = await this.getNetwork();
    // const {data} = await openapiService.getNFTCollectionV2(address!)
    const data = await openapiService.nftCatalogCollections(address!);
    if (!data) {
      return [];
    }
    const sortedList = data.sort((a, b) => b.count - a.count);
    nftService.setCollectionList(sortedList, network);
    return sortedList;
  };

  getNftCatalog = async () => {
    const catStorage = await storage.get('catalogData');

    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    console.log('catstorage ', now, catStorage);
    if (
      catStorage &&
      catStorage['expiry'] &&
      now.getTime() <= catStorage['expiry']
    ) {
      return catStorage['data'];
    }

    const data = (await openapiService.nftCatalog()) ?? [];
    console.log('data expired ');
    const catalogData = {
      data: data,
      expiry: exp,
    };
    storage.set('catalogData', catalogData);
    return data;
  };

  getSwapConfig = async () => {
    const swapStorage = await storage.get('swapConfig');

    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    console.log('swapConfig ', now, swapStorage);
    if (
      swapStorage &&
      swapStorage['expiry'] &&
      now.getTime() <= swapStorage['expiry']
    ) {
      return swapStorage['data'];
    }

    const data = (await openapiService.getSwapInfo()) ?? false;
    console.log('data expired ');
    const swapConfig = {
      data: data,
      expiry: exp,
    };
    storage.set('swapConfig', swapConfig);
    return data;
  };

  reset = async () => {
    await keyringService.loadStore(undefined);
    keyringService.store.subscribe((value) =>
      storage.set('keyringState', value)
    );
  };

  // Google Drive - Backup
  getBackupFiles = async () => {
    return googleDriveService.listFiles();
  };

  hasGooglePremission = async () => {
    return googleDriveService.hasGooglePremission();
  };

  deleteAllBackups = async () => {
    return googleDriveService.deleteAllFile();
  };

  deleteCurrentUserBackup = async () => {
    const data = await userInfoService.getUserInfo();
    const username = data.username;
    return googleDriveService.deleteUserBackup(username);
  };

  deleteUserBackup = async (username: string) => {
    return googleDriveService.deleteUserBackup(username);
  };

  hasCurrentUserBackup = async () => {
    const data = await userInfoService.getUserInfo();
    const username = data.username;
    return googleDriveService.hasUserBackup(username);
  };

  hasUserBackup = async (username: string) => {
    return googleDriveService.hasUserBackup(username);
  };

  syncBackup = async () => {
    const data = await userInfoService.getUserInfo();
    const username = data.username;
    const password = keyringService.password;
    const mnemonic = await this.getMnemonics(password || '');
    return this.uploadMnemonicToGoogleDrive(mnemonic, username, password);
  };

  uploadMnemonicToGoogleDrive = async (mnemonic, username, password) => {
    const app = getApp(process.env.NODE_ENV!);
    const user = await getAuth(app).currentUser;
    return googleDriveService.uploadMnemonicToGoogleDrive(
      mnemonic,
      username,
      user!.uid,
      password
    );
  };

  loadBackupAccounts = async (): Promise<string[]> => {
    return googleDriveService.loadBackupAccounts();
  };

  restoreAccount = async (username, password): Promise<string | null> => {
    return googleDriveService.restoreAccount(username, password);
  };

  getCurrentPassword = async (password: string) => {
    await keyringService.verifyPassword(password);
  };

  getPayerAddressAndKeyId = async () => {
    try {
      const config = await fetchConfig.remoteConfig();
      const network = await this.getNetwork();
      return config.payer[network];
    } catch {
      const network = await this.getNetwork();
      return defaultConfig.payer[network];
    }
  };

  allowLilicoPay = async (): Promise<boolean> => {
    const isFreeGasFeeKillSwitch = await storage.get('freeGas');
    const isFreeGasFeeEnabled = await storage.get('lilicoPayer');
    return isFreeGasFeeKillSwitch && isFreeGasFeeEnabled;
  };

  signPayer = async (signable): Promise<string> => {
    return await userWalletService.signPayer(signable);
  };

  updateProfilePreference = async (privacy: number) => {
    await openapiService.updateProfilePreference(privacy);
  };

  flownsPrepare = async () => {
    const resp = await openapiService.flownsPrepare();
    return resp;
  };

  flownsResponse = async (script, domain, flownsAddress, lilicoAddress) => {
    const resp = await flownsService.sendTransaction(
      script,
      domain,
      flownsAddress,
      lilicoAddress
    );
    return resp;
  };

  setHistory = async (token, nft) => {
    const network = await userWalletService.getNetwork();
    const data = {
      token,
      nft,
    };
    await flownsService.setHistory(network, data);
  };

  getHistory = async () => {
    const network = await userWalletService.getNetwork();
    const resp = await flownsService.getHistory(network);
    return resp;
  };

  nodeInfo = async (address) => {
    const result = await stakingService.nodeInfo(address);
    return result;
  };

  stakeInfo = async (address) => {
    const result = await stakingService.stakeInfo(address);
    return result;
  };

  delegateInfo = async (address) => {
    const result = await stakingService.delegateInfo(address);
    return result;
  };

  delegateStore = async () => {
    const result = await stakingService.delegateStore();
    return result;
  };

  createDelegator = async (amount, node) => {
    const result = await stakingService.createDelegator(amount, node);
    return result;
  };

  createStake = async (amount, node, delegate) => {
    const result = await stakingService.createStake(amount, node, delegate);
    return result;
  };

  withdrawReward = async (amount, node, delegate) => {
    const result = await stakingService.withdrawReward(amount, node, delegate);
    return result;
  };

  restakeReward = async (amount, node, delegate) => {
    const result = await stakingService.restakeReward(amount, node, delegate);
    return result;
  };

  restakeUnstaked = async (amount, node, delegate) => {
    const result = await stakingService.restakeUnstaked(amount, node, delegate);
    return result;
  };

  withdrawUnstaked = async (amount, node, delegate) => {
    const result = await stakingService.withdrawUnstaked(
      amount,
      node,
      delegate
    );
    return result;
  };

  unstake = async (amount, node, delegate) => {
    const result = await stakingService.unstake(amount, node, delegate);
    return result;
  };

  getApr = async () => {
    const result = await stakingService.getApr();
    return result;
  };

  checkStakingSetup = async (address) => {
    return await stakingService.checkSetup(address);
  };

  setupDelegator = async (address) => {
    const result = await stakingService.setup(address);
    return result;
  };

  createFlowSandboxAddress = async () => {
    const result = await openapiService.createFlowSandboxAddress();
    return result;
  };

  checkSandBoxnet = async () => {
    const result = await userWalletService.checkSandBoxnet();
    return result;
  };
}

export default new WalletController();
