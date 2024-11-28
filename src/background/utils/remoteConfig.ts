import { storage } from '@/background/webapi';

import { userWalletService } from '../service';
import openapi from '../service/openapi';

import defaultConfig from './defaultConfig.json';
import mainnetNftList from './defaultNftList.mainnet.json';
import testnetNftList from './defaultNftList.testnet.json';
import defaultTokenList from './defaultTokenList.json';

interface CacheState {
  result: any;
  expireTime: number;
}

const BASE_FUNCTIONS_URL = process.env.FB_FUNCTIONS;

class fetchRemoteConfig {
  coinState: CacheState = { result: {}, expireTime: 0 };
  nftState = {
    mainnet: {
      result: {},
      expireTime: 0,
    },
    testnet: {
      result: {},
      expireTime: 0,
    },
  };
  configState: CacheState = { result: {}, expireTime: 0 };

  async flowCoins() {
    const expire = this.coinState.expireTime;
    const now = new Date();
    // one hour expire time
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    if (expire < now.getTime()) {
      try {
        const result = await openapi.sendRequest('GET', '/fetchFTList', {}, {}, BASE_FUNCTIONS_URL);

        this.coinState.result = result;
        this.coinState.expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultTokenList;
      }
    } else {
      return this.coinState.result;
    }
  }

  async nftCollection() {
    const network = await userWalletService.getNetwork();
    const expire = this.nftState[network].expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    let defaultNftList = testnetNftList;
    if (network === 'mainnet') {
      defaultNftList = mainnetNftList;
    }
    if (expire < now.getTime()) {
      try {
        const result = await openapi.getNFTListFromGithub(network);
        // fetch(`${baseURL}/fetchNFTList`);
        // const result = await coins.json();
        this.nftState[network].result = result;
        this.nftState[network].expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultNftList;
      }
    } else {
      return this.nftState[network].result;
    }
  }

  async nftv2Collection() {
    const network = await userWalletService.getNetwork();
    const address = await userWalletService.getCurrentAddress();
    const expire = this.nftState[network].expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    let defaultNftList = testnetNftList;
    if (network === 'mainnet') {
      defaultNftList = mainnetNftList;
    }
    if (expire < now.getTime()) {
      try {
        const result = await openapi.getNFTV2CollectionList(address, network);
        // fetch(`${baseURL}/fetchNFTList`);
        // const result = await coins.json();
        this.nftState[network].result = result;
        this.nftState[network].expireTime = exp;
        return result;
      } catch (err) {
        console.error(err);
        return defaultNftList;
      }
    } else {
      return this.nftState[network].result;
    }
  }

  async remoteConfig() {
    const expire = this.configState.expireTime;
    const now = new Date();
    const exp = 1000 * 60 * 60 * 1 + now.getTime();
    if (expire < now.getTime()) {
      try {
        const result = await openapi.sendRequest('GET', '/config', {}, {}, BASE_FUNCTIONS_URL);
        // fetch(`${baseURL}/config`);
        // const result = await config.json();
        this.configState.result = result;
        this.configState.expireTime = exp;
        await storage.set('freeGas', result.features.free_gas);
        await storage.set('alchemyAPI', result.features.alchemy_api);
        // console.log('remoteConfig ->', result, result.features.free_gas)
        return result;
      } catch (err) {
        console.error(err);
        await storage.set('freeGas', defaultConfig.features.free_gas);
        return defaultConfig;
      }
    } else {
      return this.configState.result;
    }
  }
}

export default new fetchRemoteConfig();
