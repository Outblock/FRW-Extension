import { createTab } from './tab';

chrome.notifications.onClicked.addListener((url) => {
  if (url.startsWith('https://')) {
    createTab(url.split('_randomId_')[0]);
  }
});

const create = (
  url: string,
  title: string,
  message: string,
  icon: string = chrome.runtime.getURL('./images/icon-64.png'),
  priority = 0
) => {
  const randomId = +new Date();
  chrome.notifications.create(url && `${url}_randomId_=${randomId}`, {
    type: 'basic',
    title,
    iconUrl: icon,
    message,
    priority,
  });
};

export default { create };
