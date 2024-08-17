import { ethErrors } from 'eth-rpc-errors';
import {
  keyringService,
  notificationService,
  permissionService,
  userWalletService,
} from 'background/service';
import { PromiseFlow, underline2Camelcase } from 'background/utils';
import { EVENTS } from 'consts';
import providerController from './controller';
import eventBus from '@/eventBus';
import Wallet from '../wallet';

const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = ['SignText', 'SignTypedData', 'SignTx', 'EthConfirm'];
  return SIGN_APPROVALS.includes(type);
};

const lockedOrigins = new Set<string>();

const flow = new PromiseFlow();
const flowContext = flow
  .use(async (ctx, next) => {
    // check method
    const {
      data: { method },
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);
    if (!providerController[ctx.mapMethod]) {
      // TODO: make rpc whitelist
      // if (method.startsWith('eth_') || method === 'net_version') {
      //   return providerController.ethRpc(ctx.request);
      //   return next();
      // }

      throw ethErrors.rpc.methodNotFound({
        message: `method [${method}] doesn't has corresponding handler`,
        data: ctx.request.data,
      });
    }

    return next();
  })
  .use(async (ctx, next) => {
    console.log('ctx1 ', ctx)
    const {
      request: {
        session: { origin, },
      },
      mapMethod,
    } = ctx;
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {

      const hasEvm = userWalletService.checkPreviewnet();
      console.log('hasEvm checkpreview ', hasEvm)
      if (!hasEvm.length) {
        throw new Error('previewnet must has at least one account.');
      }
      const isUnlock = keyringService.memStore.getState().isUnlocked;
      const site = permissionService.getConnectedSite(origin);
      if (mapMethod === 'ethAccounts' && (!site || !isUnlock)) {
        throw new Error('Origin not connected. Please connect first.');
      }


      const network = await Wallet.getNetwork();

      if (network !== 'previewnet' && network !== 'testnet') {
        throw new Error('Network not in previewnet or testnet.');
      }

      if (!isUnlock) {
        ctx.request.requestedApproval = true;
        lockedOrigins.add(origin);
        try {
          await notificationService.requestApproval({ lock: true });
          lockedOrigins.delete(origin);
        } catch (e) {
          lockedOrigins.delete(origin);
          throw e;
        }
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    const {
      request: {
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    // check connect
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {

      if (!permissionService.hasPermission(origin)) {
        ctx.request.requestedApproval = true;
        const {
          defaultChain,
          signPermission,
        } = await notificationService.requestApproval(
          {
            params: { origin, name, icon },
            approvalComponent: 'EthConnect',
          },
          { height: 599 }
        );
        permissionService.addConnectedSite(origin, name, icon, defaultChain);
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check need approval
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const [approvalType, condition, { height = 599 } = {}] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    if (mapMethod === 'ethSendTransaction' || mapMethod === 'personalSign') {
      ctx.request.requestedApproval = true;
      ctx.approvalRes = await notificationService.requestApproval(
        {
          approvalComponent: 'EthConfirm',
          params: {
            method,
            data: params,
            session: { origin, name, icon },
          },
          origin,
        },
        { height }
      );
      if (isSignApproval('EthConfirm')) {
        permissionService.updateConnectSite(origin, { isSigned: true }, true);
      } else {
        permissionService.touchConnectedSite(origin);
      }
    }

    return next();
  })
  .use(async (ctx) => {
    const { approvalRes, mapMethod, request } = ctx;
    // process request
    const [approvalType] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    const { uiRequestComponent, ...rest } = approvalRes || {};
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      providerController[mapMethod]({
        ...request,
        approvalRes,
      })
    );

    requestDefer
      .then((result) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result,
            },
          });
        }
        return result;
      })
      .catch((e: any) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e),
            },
          });
        }
      });
    async function requestApprovalLoop({ uiRequestComponent, ...rest }) {
      ctx.request.requestedApproval = true;
      const res = await notificationService.requestApproval({
        approvalComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType,
      });
      if (res.uiRequestComponent) {
        return await requestApprovalLoop(res);
      } else {
        return res;
      }
    }
    if (uiRequestComponent) {
      ctx.request.requestedApproval = true;
      return await requestApprovalLoop({ uiRequestComponent, ...rest });
    }

    return requestDefer;
  })
  .callback();

export default (request) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.requestedApproval) {
      flow.requestedApproval = false;
      // only unlock notification if current flow is an approval flow
      notificationService.unLock();
    }
  });
};
