import { ethErrors } from 'eth-rpc-errors';

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
}

export default new ProviderController();
