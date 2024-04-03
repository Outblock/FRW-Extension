import { ethErrors } from 'eth-rpc-errors';

// import RpcCache from 'background/utils/rpcCache';
import {

  preferenceService,
} from 'background/service';
import { Session } from 'background/service/session';
import Wallet from '../wallet';
import BaseController from '../base';
import { Account } from 'background/service/preference';

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
  // ethRpc = (req, forceChainServerId?: string) => {
  //   const {
  //     data: { method, params },
  //     session: { origin },
  //   } = req;

  //   if (
  //     !permissionService.hasPermission(origin) &&
  //     !SAFE_RPC_METHODS.includes(method)
  //   ) {
  //     throw ethErrors.provider.unauthorized();
  //   }

  //   const site = permissionService.getSite(origin);
  //   let chainServerId = CHAINS[CHAINS_ENUM.ETH].serverId;
  //   if (site) {
  //     chainServerId = CHAINS[site.chain].serverId;
  //   }
  //   if (forceChainServerId) {
  //     chainServerId = forceChainServerId;
  //   }

  //   const currentAddress =
  //     preferenceService.getCurrentAccount()?.address.toLowerCase() || '0x';
  //   const cache = RpcCache.get(currentAddress, {
  //     method,
  //     params,
  //     chainId: chainServerId,
  //   });
  //   if (cache) return cache;
  //   const chain = Object.values(CHAINS).find(
  //     (item) => item.serverId === chainServerId
  //   )!;
  //   if (RPCService.hasCustomRPC(chain.enum)) {
  //     const promise = RPCService.requestCustomRPC(
  //       chain.enum,
  //       method,
  //       params
  //     ).then((result) => {
  //       RpcCache.set(currentAddress, {
  //         method,
  //         params,
  //         result,
  //         chainId: chainServerId,
  //       });
  //       return result;
  //     });
  //     RpcCache.set(currentAddress, {
  //       method,
  //       params,
  //       result: promise,
  //       chainId: chainServerId,
  //     });
  //     return promise;
  //   } else {
  //     const promise = openapiService
  //       .ethRpc(chainServerId, {
  //         origin: encodeURIComponent(origin),
  //         method,
  //         params,
  //       })
  //       .then((result) => {
  //         RpcCache.set(currentAddress, {
  //           method,
  //           params,
  //           result,
  //           chainId: chainServerId,
  //         });
  //         return result;
  //       });
  //     RpcCache.set(currentAddress, {
  //       method,
  //       params,
  //       result: promise,
  //       chainId: chainServerId,
  //     });
  //     return promise;
  //   }
  // };
}

export default new ProviderController();
