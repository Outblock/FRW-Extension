// this script is injected into webpage's context
import { EventEmitter } from "events";
import { ethErrors, serializeError } from "eth-rpc-errors";
import BroadcastChannelMessage from "./utils/message/broadcastChannelMessage";
import PushEventHandlers from "./pageProvider/pushEventHandlers";
import { domReadyCall, $ } from "./pageProvider/utils";
import ReadyPromise from "./pageProvider/readyPromise";
import DedupePromise from "./pageProvider/dedupePromise";
import { switchChainNotice } from "./pageProvider/interceptors/switchChain";
import { switchWalletNotice } from "./pageProvider/interceptors/switchWallet";
import { getProviderMode, patchProvider } from "./utils/metamask";

declare const __rabby__channelName;
declare const __rabby__isDefaultWallet;
declare const __rabby__uuid;
declare const __rabby__isOpera;

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `%c [rabby] (${new Date().toTimeString().substr(0, 8)}) ${event}`,
      "font-weight: bold; background-color: #7d6ef9; color: white;",
      ...args
    );
  }
};

let channelName =
  typeof __rabby__channelName !== "undefined" ? __rabby__channelName : "";
let isDefaultWallet =
  typeof __rabby__isDefaultWallet !== "undefined"
    ? __rabby__isDefaultWallet
    : false;
let isOpera =
  typeof __rabby__isOpera !== "undefined" ? __rabby__isOpera : false;
let uuid = typeof __rabby__uuid !== "undefined" ? __rabby__uuid : "";

const getParams = () => {
  if (localStorage.getItem("rabby:channelName")) {
    channelName = localStorage.getItem("rabby:channelName") as string;
    localStorage.removeItem("rabby:channelName");
  }
  if (localStorage.getItem("rabby:isDefaultWallet")) {
    isDefaultWallet = localStorage.getItem("rabby:isDefaultWallet") === "true";
    localStorage.removeItem("rabby:isDefaultWallet");
  }
  if (localStorage.getItem("rabby:uuid")) {
    uuid = localStorage.getItem("rabby:uuid") as string;
    localStorage.removeItem("rabby:uuid");
  }
  if (localStorage.getItem("rabby:isOpera")) {
    isOpera = localStorage.getItem("rabby:isOpera") === "true";
    localStorage.removeItem("rabby:isOpera");
  }
};
getParams();

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}
interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProvider;
}

interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

export class EthereumProvider extends EventEmitter {
  chainId: string | null = null;
  selectedAddress: string | null = null;
  /**
   * The network ID of the currently connected Ethereum chain.
   * @deprecated
   */
  networkVersion: string | null = null;
  isRabby = true;
  isMetaMask = true;
  _isRabby = true;

  _isReady = false;
  _isConnected = false;
  _initialized = false;
  _isUnlocked = false;

  _cacheRequestsBeforeReady: any[] = [];
  _cacheEventListenersBeforeReady: [string | symbol, () => any][] = [];

  _state: StateProvider = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false,
  };

  _metamask = {
    isUnlocked: () => {
      return new Promise((resolve) => {
        resolve(this._isUnlocked);
      });
    },
  };

  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(2);
  private _dedupePromise = new DedupePromise([]);
  private _bcm = new BroadcastChannelMessage(channelName);

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    this.shimLegacy();
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async () => {
    document.addEventListener(
      "visibilitychange",
      this._requestPromiseCheckVisibility
    );

    this._bcm.connect().on("message", this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name =
        document.title ||
        ($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
        origin;

      this._bcm.request({
        method: "tabCheckin",
        params: { icon, name, origin },
      });

      this._requestPromise.check(2);
    });

    try {
      const { chainId, accounts, networkVersion, isUnlocked }: any =
        await this.requestInternalMethods({
          method: "getProviderState",
        });
      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.chainId = chainId;
      this.networkVersion = networkVersion;
      this.emit("connect", { chainId });
      this._pushEventHandlers.chainChanged({
        chain: chainId,
        networkVersion,
      });

      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit("_initialized");
    }
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === "visible") {
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    log("[push event]", event, data);
    if (this._pushEventHandlers[event]) {
      return this._pushEventHandlers[event](data);
    }

    this.emit(event, data);
  };

  isConnected = () => {
    return true;
  };

  // TODO: support multi request!
  request = async (data) => {
    if (!this._isReady) {
      const promise = new Promise((resolve, reject) => {
        this._cacheRequestsBeforeReady.push({
          data,
          resolve,
          reject,
        });
      });
      return promise;
    }
    return this._dedupePromise.call(data.method, () => this._request(data));
  };

  _request = async (data) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      if (data.method !== "eth_call") {
        log("[request]", JSON.stringify(data, null, 2));
      }

      return this._bcm
        .request(data)
        .then((res) => {
          if (data.method !== "eth_call") {
            log("[request: success]", data.method, res);
          }
          return res;
        })
        .catch((err) => {
          if (data.method !== "eth_call") {
            log("[request: error]", data.method, serializeError(err));
          }
          throw serializeError(err);
        });
    });
  };

  requestInternalMethods = (data) => {
    return this._dedupePromise.call(data.method, () => this._request(data));
  };

  // shim to matamask legacy api
  sendAsync = (payload, callback) => {
    if (Array.isArray(payload)) {
      return Promise.all(
        payload.map(
          (item) =>
            new Promise((resolve) => {
              this.sendAsync(item, (err, res) => {
                // ignore error
                resolve(res);
              });
            })
        )
      ).then((result) => callback(null, result));
    }
    const { method, params, ...rest } = payload;
    this.request({ method, params })
      .then((result) => callback(null, { ...rest, method, result }))
      .catch((error) => callback(error, { ...rest, method, error }));
  };

  send = (payload, callback?) => {
    if (typeof payload === "string" && (!callback || Array.isArray(callback))) {
      // send(method, params? = [])
      return this.request({
        method: payload,
        params: callback,
      }).then((result) => ({
        id: undefined,
        jsonrpc: "2.0",
        result,
      }));
    }

    if (typeof payload === "object" && typeof callback === "function") {
      return this.sendAsync(payload, callback);
    }

    let result;
    switch (payload.method) {
      case "eth_accounts":
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;

      case "eth_coinbase":
        result = this.selectedAddress || null;
        break;

      default:
        throw new Error("sync method doesnt support");
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  };

  shimLegacy = () => {
    const legacyMethods = [
      ["enable", "eth_requestAccounts"],
      ["net_version", "net_version"],
    ];

    for (const [_method, method] of legacyMethods) {
      this[_method] = () => this.request({ method });
    }
  };

  on = (event: string | symbol, handler: (...args: any[]) => void) => {
    if (!this._isReady) {
      this._cacheEventListenersBeforeReady.push([event, handler]);
      return this;
    }
    return super.on(event, handler);
  };
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
    web3: any;
    rabby: EthereumProvider;
    rabbyWalletRouter: {
      rabbyProvider: EthereumProvider;
      lastInjectedProvider?: EthereumProvider;
      currentProvider: EthereumProvider;
      providers: EthereumProvider[];
      setDefaultProvider: (rabbyAsDefault: boolean) => void;
      addProvider: (provider: EthereumProvider) => void;
    };
  }
}

const provider = new EthereumProvider();
patchProvider(provider);
const rabbyProvider = new Proxy(provider, {
  deleteProperty: (target, prop) => {
    if (
      typeof prop === "string" &&
      ["on", "isRabby", "isMetaMask", "_isRabby"].includes(prop)
    ) {
      delete target[prop];
    }
    return true;
  },
});

const requestHasOtherProvider = () => {
  return provider.requestInternalMethods({
    method: "hasOtherProvider",
    params: [],
  });
};

const requestIsDefaultWallet = () => {
  return provider.requestInternalMethods({
    method: "isDefaultWallet",
    params: [],
  }) as Promise<boolean>;
};

const initOperaProvider = () => {
  window.ethereum = rabbyProvider;
  rabbyProvider._isReady = true;
  window.rabby = rabbyProvider;
  patchProvider(rabbyProvider);
  rabbyProvider.on("rabby:chainChanged", switchChainNotice);
};

const initProvider = () => {
  rabbyProvider._isReady = true;
  rabbyProvider.on("defaultWalletChanged", switchWalletNotice);
  patchProvider(rabbyProvider);
  if (window.ethereum) {
    requestHasOtherProvider();
  }
  if (!window.web3) {
    window.web3 = {
      currentProvider: rabbyProvider,
    };
  }
  const descriptor = Object.getOwnPropertyDescriptor(window, "ethereum");
  const canDefine = !descriptor || descriptor.configurable;
  if (canDefine) {
    try {
      Object.defineProperties(window, {
        rabby: {
          value: rabbyProvider,
          configurable: false,
          writable: false,
        },
        ethereum: {
          get() {
            return window.rabbyWalletRouter.currentProvider;
          },
          set(newProvider) {
            window.rabbyWalletRouter.addProvider(newProvider);
          },
          configurable: false,
        },
        rabbyWalletRouter: {
          value: {
            rabbyProvider,
            lastInjectedProvider: window.ethereum,
            currentProvider: rabbyProvider,
            providers: [
              rabbyProvider,
              ...(window.ethereum ? [window.ethereum] : []),
            ],
            setDefaultProvider(rabbyAsDefault: boolean) {
              if (rabbyAsDefault) {
                window.rabbyWalletRouter.currentProvider = window.rabby;
              } else {
                const nonDefaultProvider =
                  window.rabbyWalletRouter.lastInjectedProvider ??
                  window.ethereum;
                window.rabbyWalletRouter.currentProvider = nonDefaultProvider;
              }
            },
            addProvider(provider) {
              if (!window.rabbyWalletRouter.providers.includes(provider)) {
                window.rabbyWalletRouter.providers.push(provider);
              }
              if (rabbyProvider !== provider) {
                requestHasOtherProvider();
                window.rabbyWalletRouter.lastInjectedProvider = provider;
              }
            },
          },
          configurable: false,
          writable: false,
        },
      });
    } catch (e) {
      // think that defineProperty failed means there is any other wallet
      requestHasOtherProvider();
      console.error(e);
      window.ethereum = rabbyProvider;
      window.rabby = rabbyProvider;
    }
  } else {
    window.ethereum = rabbyProvider;
    window.rabby = rabbyProvider;
  }
};

if (isOpera) {
  initOperaProvider();
} else {
  initProvider();
}

requestIsDefaultWallet().then((rabbyAsDefault) => {
  window.rabbyWalletRouter?.setDefaultProvider(rabbyAsDefault);
  if (rabbyAsDefault) {
    window.ethereum = rabbyProvider;
  }
});

const announceEip6963Provider = (provider: EthereumProvider) => {
  const info: EIP6963ProviderInfo = {
    uuid: uuid,
    name: "Flow Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzc0MV8yNzUxKSI+CjxtYXNrIGlkPSJtYXNrMF83NDFfMjc1MSIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+CjxwYXRoIGQ9Ik0zMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMkMyNC44MzY2IDMyIDMyIDI0LjgzNjYgMzIgMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazBfNzQxXzI3NTEpIj4KPHBhdGggZD0iTTMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNloiIGZpbGw9IiM3MDg0RkYiLz4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZF83NDFfMjc1MSkiPgo8cGF0aCBkPSJNMjcuNjAxOSAxNy4zODc2QzI4LjUyMTYgMTUuMzI2MSAyMy45NzQ4IDkuNTY2MzIgMTkuNjMxIDcuMTY2NzZDMTYuODkyOSA1LjMwNzc5IDE0LjAzOTkgNS41NjMxOCAxMy40NjIgNi4zNzkzOEMxMi4xOTQgOC4xNzA2OSAxNy42NjExIDkuNjg4NTEgMjEuMzE3NCAxMS40NTk3QzIwLjUzMTQgMTEuODAyMiAxOS43OTA4IDEyLjQxNjkgMTkuMzU1MiAxMy4yMDI5QzE3Ljk5MjEgMTEuNzA5OCAxNS4wMDAzIDEwLjQyMzkgMTEuNDg5NyAxMS40NTk3QzkuMTIzOTcgMTIuMTU3NyA3LjE1NzkxIDEzLjgwMzIgNi4zOTgwNCAxNi4yODg1QzYuMjEzMzcgMTYuMjA2MiA2LjAwODk0IDE2LjE2MDQgNS43OTM4NyAxNi4xNjA0QzQuOTcxNDIgMTYuMTYwNCA0LjMwNDY5IDE2LjgyOTQgNC4zMDQ2OSAxNy42NTQ2QzQuMzA0NjkgMTguNDc5OSA0Ljk3MTQyIDE5LjE0ODggNS43OTM4NyAxOS4xNDg4QzUuOTQ2MzIgMTkuMTQ4OCA2LjQyMjk4IDE5LjA0NjMgNi40MjI5OCAxOS4wNDYzTDE0LjAzOTkgMTkuMTAxNkMxMC45OTM3IDIzLjk1MDQgOC41ODYzNSAyNC42NTkxIDguNTg2MzUgMjUuNDk5MkM4LjU4NjM1IDI2LjMzOTIgMTAuODg5OCAyNi4xMTE2IDExLjc1NDcgMjUuNzk4NEMxNS44OTQ5IDI0LjI5OTUgMjAuMzQxNyAxOS42MjggMjEuMTA0OCAxOC4yODMzQzI0LjMwOTIgMTguNjg0NCAyNy4wMDIyIDE4LjczMTggMjcuNjAxOSAxNy4zODc2WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzc0MV8yNzUxKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIxLjMwMjkgMTEuNDUzOEMyMS4zMDY3IDExLjQ1NTUgMjEuMzEwNiAxMS40NTcxIDIxLjMxNDQgMTEuNDU4OEMyMS40ODM5IDExLjM5MTggMjEuNDU2NSAxMS4xNDA3IDIxLjQwOTkgMTAuOTQzNUMyMS4zMDMgMTAuNDkwMSAxOS40NTc1IDguNjYxNjUgMTcuNzI0NSA3Ljg0MjY1QzE1LjM2MjkgNi43MjY2NSAxMy42MjQgNi43ODQyMSAxMy4zNjcyIDcuMjk4NjVDMTMuODQ3MiA4LjI4ODIxIDE2LjA3NzkgOS4yMTcyNyAxOC40MDc3IDEwLjE4NzZDMTkuMzk3MSAxMC41OTk2IDIwLjQwNDMgMTEuMDE5MSAyMS4zMDI5IDExLjQ1MzhaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfNzQxXzI3NTEpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTguMzIyOCAyMS40MTY3QzE3Ljg0NTMgMjEuMjMzNyAxNy4zMDYgMjEuMDY1OCAxNi42OTI5IDIwLjkxMzNDMTcuMzQ2OSAxOS43MzkzIDE3LjQ4NDEgMTguMDAxMSAxNi44NjY1IDE2LjkwMjJDMTUuOTk5OCAxNS4zNTk5IDE0LjkxMTcgMTQuNTM5MSAxMi4zODM0IDE0LjUzOTFDMTAuOTkyOCAxNC41MzkxIDcuMjQ4NzcgMTUuMDA5IDcuMTgyMjcgMTguMTQ1QzcuMTc1MzQgMTguNDczOCA3LjE4MjA5IDE4Ljc3NTEgNy4yMDU3NyAxOS4wNTIxTDE0LjA0MyAxOS4xMDE5QzEzLjEyMSAyMC41Njk0IDEyLjI1NzUgMjEuNjU3NyAxMS41MDE2IDIyLjQ4NTJDMTIuNDA5MiAyMi43MTg2IDEzLjE1ODEgMjIuOTE0NCAxMy44NDU3IDIzLjA5NDNDMTQuNDk3OCAyMy4yNjQ4IDE1LjA5NDYgMjMuNDIwOSAxNS43MTkzIDIzLjU4MDlDMTYuNjYyIDIyLjg5MTggMTcuNTQ4MyAyMi4xNDA0IDE4LjMyMjggMjEuNDE2N1oiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl83NDFfMjc1MSkiLz4KPHBhdGggZD0iTTYuMzA4NzQgMTguNzI4M0M2LjU4ODA1IDIxLjExMDUgNy45MzczNiAyMi4wNDQxIDEwLjY5NDYgMjIuMzIwNUMxMy40NTE5IDIyLjU5NjggMTUuMDMzNSAyMi40MTE0IDE3LjEzOTEgMjIuNjAzNkMxOC44OTc3IDIyLjc2NDEgMjAuNDY4IDIzLjY2MzMgMjEuMDUwNSAyMy4zNTI2QzIxLjU3NDcgMjMuMDczIDIxLjI4MTQgMjIuMDYyNiAyMC41Nzk5IDIxLjQxNDRDMTkuNjcwNiAyMC41NzQxIDE4LjQxMjEgMTkuOTkgMTYuMTk3NyAxOS43ODI2QzE2LjYzOSAxOC41NzAyIDE2LjUxNTQgMTYuODcwMyAxNS44Mjk5IDE1Ljk0NTVDMTQuODM4OSAxNC42MDgyIDEzLjAwOTcgMTQuMDAzNiAxMC42OTQ2IDE0LjI2NzhDOC4yNzU4NiAxNC41NDM4IDUuOTU4MjEgMTUuNzM4NiA2LjMwODc0IDE4LjcyODNaIiBmaWxsPSJ1cmwoI3BhaW50M19saW5lYXJfNzQxXzI3NTEpIi8+CjwvZz4KPC9nPgo8L2c+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2RfNzQxXzI3NTEiIHg9Ii03Ny42MTUzIiB5PSItNzYuMTYwMiIgd2lkdGg9IjE4Ny4yNTQiIGhlaWdodD0iMTg0LjE2MiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0Lz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDAuOTYiLz4KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuMTUxOTMzIDAgMCAwIDAgMC4yMzkyMzggMCAwIDAgMCAwLjQ5MDI0MSAwIDAgMCAwLjU0IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfNzQxXzI3NTEiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3dfNzQxXzI3NTEiIHJlc3VsdD0ic2hhcGUiLz4KPC9maWx0ZXI+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl83NDFfMjc1MSIgeDE9IjExLjIxNDIiIHkxPSIxNS41NjIiIHgyPSIyNy40MTE5IiB5Mj0iMjAuMTM5OSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl83NDFfMjc1MSIgeDE9IjI0LjY3NDUiIHkxPSIxNS4yNTE4IiB4Mj0iMTIuOTUzNiIgeTI9IjMuNTQxNjMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzg2OTdGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4Njk3RkYiIHN0b3Atb3BhY2l0eT0iMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfNzQxXzI3NTEiIHgxPSIxOC42NDc4IiB5MT0iMjEuODI2MSIgeDI9IjcuNDA4MDIiIHkyPSIxNS4zODU5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM4Njk3RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjODY5N0ZGIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDNfbGluZWFyXzc0MV8yNzUxIiB4MT0iMTIuMTgyNyIgeTE9IjE1LjQzOTQiIHgyPSIxOS43OTkxIiB5Mj0iMjUuMDg0MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjAuOTgzODk1IiBzdG9wLWNvbG9yPSIjRDFEOEZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNzQxXzI3NTEiPgo8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
    rdns: "github.com/Outblock/FRW-Extension",
  };

  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Object.freeze({ info, provider }),
    })
  );
};

window.addEventListener<any>(
  "eip6963:requestProvider",
  (event: EIP6963RequestProviderEvent) => {
    announceEip6963Provider(rabbyProvider);
  }
);

announceEip6963Provider(rabbyProvider);

window.dispatchEvent(new Event("ethereum#initialized"));
