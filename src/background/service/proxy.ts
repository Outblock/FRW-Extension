import { createPersistStore } from 'background/utils';
import { WalletResponse, BlockchainResponse, ChildAccount, DeviceInfoRequest } from './networkModel';
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
import { getHashAlgo, getSignAlgo, getStoragedAccount } from 'ui/utils';


class Proxy {

  proxySign = async (token: string, userId: string) => {
  
    return wallet.openapi.proxyKey(token, userId);
  };


  requestJwt = async () => {
  
    return wallet.openapi.proxytoken();
  };

}

export default new Proxy();
