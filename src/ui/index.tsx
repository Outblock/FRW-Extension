import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import eventBus from '@/eventBus';
import { Message } from '@/utils';
import { EVENTS } from 'consts';
import { getUITypeName } from 'ui/utils';

import Views from './views';
// import './style/index.less';

function initAppMeta() {
  const head = document.querySelector('head');
  const icon = document.createElement('link');
  icon.href = 'https://lilico.app/fcw-logo.png';
  icon.rel = 'icon';
  head?.appendChild(icon);
  const name = document.createElement('meta');
  name.name = 'name';
  name.content = 'Flow Wallet';
  head?.appendChild(name);
  const description = document.createElement('meta');
  description.name = 'description';
  description.content = chrome.i18n.getMessage('appDescription');
  head?.appendChild(description);
}

initAppMeta();

const { PortMessage } = Message;
const portMessageChannel = new PortMessage();
portMessageChannel.connect(getUITypeName());

const wallet: Record<string, any> = new Proxy(
  {},
  {
    get(obj, key) {
      // console.log('portMessageChannel', obj, key);
      switch (key) {
        case 'openapi':
          return new Proxy(
            {},
            {
              get(obj, key) {
                return function (...params: any) {
                  chrome.runtime.sendMessage({ message: 'openapi' }, function (response) {
                    // console.log(response);
                  });

                  return portMessageChannel.request({
                    type: 'openapi',
                    method: key,
                    params,
                  });
                };
              },
            }
          );
        default:
          return function (...params: any) {
            chrome.runtime.sendMessage(
              {
                type: 'controller',
                method: key,
                params,
              },
              function (_response) {
                // console.log('portMessageChannel 3 ->', response);
              }
            );

            // console.log('portMessageChannel 2', obj, key);

            return portMessageChannel.request({
              type: 'controller',
              method: key,
              params,
            });
          };
      }
    },
  }
);

portMessageChannel.listen((data) => {
  console.log('portMessageChannel.listen ->', data);
  if (data.type === 'broadcast') {
    eventBus.emit(data.method, data.params);
  }
});

eventBus.addEventListener(EVENTS.broadcastToBackground, (data) => {
  console.log('eventBus.addEventListener ->', data);
  portMessageChannel.request({
    type: 'broadcast',
    method: data.method,
    params: data.data,
  });
});

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <StrictMode>
    <Views wallet={wallet} />
  </StrictMode>
);
