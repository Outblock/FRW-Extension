import { nanoid } from 'nanoid';
import { Message } from 'utils';
const channelName = nanoid();

const initListener = (channelName: string) => {
  const { BroadcastChannelMessage, PortMessage } = Message;
  const pm = new PortMessage().connect();

  const bcm = new BroadcastChannelMessage(channelName).listen((data) =>
    pm.request(data)
  );

  // background notification
  pm.on('message', (data) => bcm.send('message', data));

  // pm.request({
  //   type: EVENTS.UIToBackground,
  //   method: 'getScreen',
  //   params: { availHeight: screen.availHeight },
  // });

  document.addEventListener('beforeunload', () => {
    bcm.dispose();
    pm.dispose();
  });
};

initListener(channelName);

// because the content script run at document start
setTimeout(() => {
  document.body.setAttribute('data-channel-name', channelName);
}, 0);

/**
 * Inject script
 */
// Listener for messages from window/FCL

function injectScript(file_path, tag) {
  const node = document.getElementsByTagName(tag)[0]
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  node.appendChild(script)
  chrome.runtime.sendMessage({type: 'LILICO:CS:LOADED',})
}

injectScript(chrome.runtime.getURL('script.js'), 'body')

// Listener for messages from window/FCL
window.addEventListener('message', function (event) {
  chrome.runtime.sendMessage(event.data)
})

// Listener for Custom Flow Transaction event from FCL send
// window.addEventListener('FLOW::TX', function (event) {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore: Event detail
//   chrome.runtime.sendMessage({type: 'FLOW::TX', ...event.detail})
// })

const extMessageHandler = (msg, sender) => {
  if (msg.type === 'FCL:VIEW:READY') {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*')
  }

  if (msg.f_type && msg.f_type === 'PollingResponse') {
    window &&
      window.postMessage(
        JSON.parse(JSON.stringify({...msg, type: 'FCL:VIEW:RESPONSE'} || {})),
        '*'
      )
  }

  if (msg.data?.f_type && msg.data?.f_type === 'PreAuthzResponse') {
    window &&
      window.postMessage(
        JSON.parse(JSON.stringify({...msg, type: 'FCL:VIEW:RESPONSE'} || {})),
        '*'
      )
  }

  if (msg.type === 'FCL:VIEW:CLOSE') {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*')
  }


  if (msg.type === 'FLOW::TX') {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*')
  }


  if (msg.type === 'LILICO:NETWORK') {
    window && window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*')
  }

  return true;
}

/**
 * Fired when a message is sent from either an extension process or another content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler);

const wakeup = function(){
  setTimeout(function(){
    chrome.runtime.sendMessage('ping', function(){
      return false;
    });
    wakeup();
  }, 2000);
}
wakeup();