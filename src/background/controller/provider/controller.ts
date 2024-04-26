import { ethErrors } from 'eth-rpc-errors';

// import RpcCache from 'background/utils/rpcCache';
import {
  permissionService,
  preferenceService,
  sessionService,
  signTextHistoryService,
  keyringService,
} from 'background/service';
import Wallet from '../wallet';
import BaseController from '../base';
import { Account } from 'background/service/preference';
import { stringToHex } from 'web3-utils';
import {
  normalize as normalizeAddress,
  recoverPersonalSignature,
} from 'eth-sig-util';
import { ethers } from "ethers";
import { sha256, isHexString, ecsign, bufferToHex } from "ethereumjs-util";
import RLP from 'rlp';
import HDWallet from 'ethereum-hdwallet';
import Web3 from 'web3';
import { signWithKey, seed2PubKey } from '@/ui/utils/modules/passkey.js';
import { storage } from '../../webapi';

interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

interface COAOwnershipProof {
  keyIndices: bigint[];
  address: Uint8Array;
  capabilityPath: string;
  signatures: Uint8Array[];
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

function removeHexPrefix(hexString: string): string {
  return hexString.startsWith('0x') ? hexString.substring(2) : hexString;
}
function toHexString(bytes: Uint8Array): string {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function createAndEncodeCOAOwnershipProof(keyIndices: bigint[], address: Uint8Array, capabilityPath: string, signatures: Uint8Array[]): Uint8Array {
  const proof: COAOwnershipProof = {
    keyIndices,
    address,
    capabilityPath,
    signatures
  };
  console.log('proof ', proof)
  // Prepare data for RLP encoding
  const encodedData = RLP.encode([
    proof.keyIndices.map(index => Buffer.from(index.toString(16), 'hex')), // Convert bigint to Buffer
    proof.address,
    Buffer.from(proof.capabilityPath, 'utf8'),
    proof.signatures
  ]);

  return encodedData; // Convert the encoded data to a hexadecimal string for easy display or transmission
}

async function signMessage(keyring, msgParams, opts = {}) {


  const web3 = new Web3();
  const textData = msgParams.data;
  console.log('texttexttexttext ', textData)

  const rightPaddedHexBuffer = (value: string, pad: number) =>
    Buffer.from(value.padEnd(pad * 2, '0'), 'hex')
  const hashedData = web3.eth.accounts.hashMessage(textData);

  const USER_DOMAIN_TAG = rightPaddedHexBuffer(
    Buffer.from('FLOW-V0.0-user').toString('hex'),
    32
  ).toString('hex')


  const prependUserDomainTag = (msg: string) => USER_DOMAIN_TAG + msg
  const signableData = prependUserDomainTag(removeHexPrefix(hashedData))

  const hashed = sha256(Buffer.from(signableData, "hex"));

  // Retrieve the private key from the wallet (assuming Ethereum wallet)
  const keyrings = await keyringService.getKeyring();
  const privateKey = keyrings[0].wallets[0].privateKey.toString('hex');

  const hashAlgo = await storage.get('hashAlgo');
  const signAlgo = await storage.get('signAlgo');
  // const wallet = new ethers.Wallet(privateKey);
  const signature = await signWithKey(signableData, signAlgo, hashAlgo, privateKey);
  const currentWallet = await Wallet.getCurrentWallet();
  const proof = {
    keyIndices: Buffer.from([0]),
    address: Buffer.from(currentWallet.address, 'hex'),
    capabilityPath: Buffer.from("evm", 'utf8'),
    signatures: Buffer.from(signature, 'hex'),
  };
  const encoded = RLP.encode([
    proof.keyIndices,
    proof.address,
    proof.capabilityPath,
    proof.signatures
  ]);

  const addressHex = currentWallet.address;
  const addressBuffer = Buffer.from(addressHex.slice(2), 'hex');
  const addressArray = Uint8Array.from(addressBuffer);

  const encodedProof = createAndEncodeCOAOwnershipProof([BigInt(0)], addressArray, 'evm', [Uint8Array.from(Buffer.from(signature, 'hex'))]);


  console.log("coa address ===> ", keyring);
  console.log("message data ===> ", hashedData);
  console.log("signableData message ===> ", signableData);
  console.log("hashed message ===> ", bufferToHex(hashed));
  console.log("sig ===> ", signature);
  console.log("encoded ===> ", toHexString(encodedProof));





  return '0x' + toHexString(encodedProof);
}

class ProviderController extends BaseController {
  ethRequestAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin)) {
      throw ethErrors.provider.unauthorized();
    }

    const currentWallet = await Wallet.getCurrentWallet();
    let res = await Wallet.queryEvmAddress(currentWallet.address);
    res = '0x' + res;
    const account = res ? [res.toLowerCase()] : [];
    sessionService.broadcastEvent('accountsChanged', account);
    const connectSite = permissionService.getConnectedSite(origin);

    console.log('account ', account)
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
  ethEstimateGas = async ({data}) => {

    console.log('account ', data)
    const url = 'https://previewnet.evm.nodes.onflow.org'
    const provider = new ethers.JsonRpcProvider(url)
    const gas = await provider.estimateGas({
      from: data.params[0].from,
      // Wrapped ETH address
      to: data.params[0].to,
      // `function deposit() payable`
      data: "0xd0e30db0",
      // 1 ether
      value: data.params[0].value
    });
    console.log('gas gas gas ', gas)
    return '0x' + gas.toString(16);
  };

  ethSendTransaction = async (data) => {

    console.log('account ', data)
    if (!data || !data.data || !data.data.params || !data.data.params.length) {
      console.error("Invalid data structure");
      return null;
    }

    // Accessing the first item in 'params' array
    const transactionParams = data.data.params[0];

    // Extracting individual parameters
    const from = transactionParams.from || '';
    const gas = transactionParams.gas || '0x76c0';
    const to = transactionParams.to || '';
    const value = transactionParams.value || '0.0';
    const dataValue = transactionParams.data || '0x';

    console.log('transactionParams ', transactionParams)
    const result = await Wallet.sendEvmTransaction(to, gas, value,dataValue);
    return result;
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
    return res;
    // return ['000000000000000000000002f9e3b9cbbaa99770'];
  };

  personalSign = async ({ data, approvalRes, session }) => {
    console.log('data ', data);
    if (!data.params) return;
    try {
      const [string, from] = data.params;
      const hex = isHexString(string) ? string : stringToHex(string);
      const keyring = await this._checkAddress(from);
      const result = await signMessage(
        keyring,
        { data: hex, from },
        approvalRes?.extra
      );
      signTextHistoryService.createHistory({
        address: from,
        text: string,
        origin: session.origin,
        type: 'personalSign',
      });
      return result;
    } catch (e) {
      throw e;
    }
  };

  private _checkAddress = async (address) => {
    // eslint-disable-next-line prefer-const
    return normalizeAddress(address).toLowerCase();
  };

  ethChainId = ({ session }) => {
    return 646;
  };
}

export default new ProviderController();
