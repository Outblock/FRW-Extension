import { ethErrors } from 'eth-rpc-errors';

// import RpcCache from 'background/utils/rpcCache';
import {
  permissionService,
  preferenceService,
  sessionService,
} from 'background/service';
import Wallet from '../wallet';
import BaseController from '../base';
import { Account } from 'background/service/preference';
import {
  CHAINS,
  SAFE_RPC_METHODS
} from 'consts';
interface ApprovalRes {
  type?: string;
  address?: string;
  uiRequestComponent?: string;
  isSend?: boolean;
  isGnosis?: boolean;
  nonce?: boolean;
  account?: Account;
  extra?: Record<string, any>;
}

interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

const v1SignTypedDataVlidation = ({
  data: {
    params: [_, from],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

const signTypedDataVlidation = ({
  data: {
    params: [from, _],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

class ProviderController extends BaseController {
  ethRequestAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }

    const _account = await this.getCurrentAccount();
    const account = _account ? [_account.address.toLowerCase()] : [];
    sessionService.broadcastEvent('accountsChanged', account);
    const connectSite = permissionService.getConnectedSite(origin);
    // if (connectSite) {
    //   const chain = CHAINS[connectSite.chai!];
    //   // rabby:chainChanged event must be sent before chainChanged event
    //   sessionService.broadcastEvent('rabby:chainChanged', chain, origin);
    //   sessionService.broadcastEvent(
    //     'chainChanged',
    //     {
    //       chain: chain.hex,
    //       networkVersion: chain.network,
    //     },
    //     origin
    //   );
    // }

    return account;
  };

  ethAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin) || !Wallet.isUnlocked()) {
      return [];
    }
   
    const network = await Wallet.getNetwork();
    if (network !== 'previewnet') {
     await Wallet.switchNetwork('previewnet');
    }
    const currentWallet = await Wallet.getCurrentWallet();
    const res = await Wallet.queryEvmAddress(currentWallet.address);
    return [res];
    // return ['000000000000000000000002f9e3b9cbbaa99770'];
  };

  ethChainId = ({ session }) => {
    return 646;
  };
}

export default new ProviderController();
