import { createPersistStore } from 'background/utils';
import {
  WalletResponse,
  BlockchainResponse,
  ChildAccount,
  DeviceInfoRequest,
} from './networkModel';
import * as fcl from '@onflow/fcl';
import * as secp from '@noble/secp256k1';
import { keyringService, openapiService } from 'background/service';
import wallet from 'background/controller/wallet';
import { getApp } from 'firebase/app';
import { signWithKey, seed2PubKey } from '@/ui/utils/modules/passkey.js';
import { findAddressWithSeed, findAddressWithPK } from '@/ui/utils/modules/findAddressWithPK';
import { withPrefix } from '@/ui/utils/address';
import { getAuth, signInAnonymously } from '@firebase/auth';
import { storage } from '../webapi';
import SignClient from '@walletconnect/sign-client';
import { FCLWalletConnectMethod } from '@/ui/utils/type';
import { Core } from '@walletconnect/core';

class Proxy {
  proxySign = async (token: string, userId: string) => {
    return wallet.openapi.proxyKey(token, userId);
  };

  requestJwt = async () => {
    return wallet.openapi.proxytoken();
  };

  checkProxy = async () => {
    const password = keyringService.password;
    const keyrings = await wallet.getKeyrings(password || '');
    for (const keyring of keyrings) {
      console.log('checkProxy');
      if (keyring.type === 'HD Key Tree') {
        if (keyring.activeIndexes[0] === 1) {
          console.log('checkProxy is true');
          return true;
        }
      } else {
        return false;
      }
    }
  };

  proxySignRequest = async (cadence, args) => {
    const currentId = await storage.get('currentId');
    const topicId = await storage.get(`${currentId}Topic`);
    try {
      const signwallet = await SignClient.init({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        core: new Core({
          projectId: process.env.WC_PROJECTID,
        }),
        metadata: {
          name: 'Flow Walllet',
          description: 'Digital wallet created for everyone.',
          url: 'https://fcw-link.lilico.app',
          icons: ['https://fcw-link.lilico.app/logo.png'],
        },
      });

      const result = await this.sendSignRequest(signwallet, topicId, cadence, args);
      console.log('result ', result);
      return result;
    } catch (e) {
      console.error(e);
      return e;
    }
  };

  sendSignRequest = async (signwallet: SignClient, topic: string, cadence, args) => {
    const pairings = signwallet.core.pairing.getPairings();

    console.log('signwallet ', pairings);
    const currentNetwork = await wallet.getNetwork();
    const params = {
      method: 'flow_sign_payer',
      topic: topic,
      params: {
        cadence,
        args,
      },
      chainId: currentNetwork,
      requestId: 200200,
      metaData: {},
    };
    console.log('topic ', params);
    try {
      const result: string = await signwallet.request({
        topic: topic,
        chainId: `flow:${currentNetwork}`,
        request: {
          method: FCLWalletConnectMethod.proxysign,
          params: JSON.stringify(params),
        },
      });

      console.log(result);
      const jsonObject = JSON.parse(result);
      console.log(jsonObject);
      return result;
    } catch (error) {
      console.error('Error in first wallet request:', error);
      return error;
    }
  };

  proxyLoginRequest = async () => {
    const currentId = await storage.get('currentId');
    const topicId = await storage.get(`${currentId}Topic`);
    try {
      const signwallet = await SignClient.init({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        core: new Core({
          projectId: process.env.WC_PROJECTID,
        }),
        metadata: {
          name: 'Flow Walllet',
          description: 'Digital wallet created for everyone.',
          url: 'https://fcw-link.lilico.app',
          icons: ['https://fcw-link.lilico.app/logo.png'],
        },
      });

      const result = await this.sendLoginRequest(signwallet, topicId);
      console.log('result ', result);
      return result;
    } catch (e) {
      console.error(e);
      return e;
    }
  };

  sendLoginRequest = async (signwallet: SignClient, topic: string) => {
    try {
      console.log(wallet);
      const deviceInfo: DeviceInfoRequest = await this.getDeviceInfo();
      const jwtToken = await wallet.requestProxyToken();
      const currentNetwork = await wallet.getNetwork();

      const result: string = await signwallet.request({
        topic: topic,
        chainId: `flow:${currentNetwork}`,
        request: {
          method: FCLWalletConnectMethod.proxyaccount,
          params: {
            method: FCLWalletConnectMethod.proxyaccount,
            data: {
              deviceInfo: deviceInfo,
              jwt: jwtToken,
            },
          },
        },
      });

      const jsonObject = JSON.parse(result!);
      const accountKey = {
        public_key: jsonObject.data.publicKey,
        hash_algo: Number(jsonObject.data.hashAlgo),
        sign_algo: Number(jsonObject.data.signAlgo),
        weight: Number(jsonObject.data.weight),
      };

      console.log('jsonObject ', jsonObject);
      return await openapiService.loginV3(accountKey, deviceInfo, jsonObject.data.signature);
    } catch (error) {
      console.error('Error in first wallet request:', error);
      throw error; // Re-throw the error to handle it higher up if necessary
    }
  };

  getDeviceInfo = async (): Promise<DeviceInfoRequest> => {
    const result = await openapiService.getLocation();
    const installationId = await openapiService.getInstallationId();
    // console.log('location ', userlocation);
    const userlocation = result.data;
    const deviceInfo: DeviceInfoRequest = {
      city: userlocation.city,
      continent: userlocation.country,
      continentCode: userlocation.countryCode,
      country: userlocation.country,
      countryCode: userlocation.countryCode,
      currency: userlocation.countryCode,
      device_id: installationId,
      district: '',
      ip: userlocation.query,
      isp: userlocation.as,
      lat: userlocation.lat,
      lon: userlocation.lon,
      name: 'FRW Chrome Extension',
      org: userlocation.org,
      regionName: userlocation.regionName,
      type: '2',
      user_agent: 'Chrome',
      zip: userlocation.zip,
    };
    return deviceInfo;
  };
}

export default new Proxy();
