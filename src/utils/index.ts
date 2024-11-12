import { Period, PeriodFrequency } from 'background/service/networkModel';

import BroadcastChannelMessage from './message/broadcastChannelMessage';
import PortMessage from './message/portMessage';

const Message = {
  BroadcastChannelMessage,
  PortMessage,
};

declare global {
  const langLocales: Record<string, Record<'message', string>>;
}

const t = (name) => chrome.i18n.getMessage(name);

const format = (str, ...args) => {
  return args.reduce((m, n) => m.replace('_s_', n), str);
};

export { Message, t, format };

// const chainsDict = keyBy(CHAINS, 'serverId');
// export const getChain = (chainId?: string) => {
//   if (!chainId) {
//     return null;
//   }
//   return chainsDict[chainId];
// };

export const getPeriodFrequency = (period: Period): PeriodFrequency => {
  switch (period) {
    case Period.oneDay:
      return PeriodFrequency.halfHour;
    case Period.oneWeek:
      return PeriodFrequency.oneHour;
    case Period.oneMonth:
      return PeriodFrequency.oneDay;
    case Period.threeMonth:
      return PeriodFrequency.oneDay;
    case Period.oneYear:
      return PeriodFrequency.threeDay;
    case Period.all:
      return PeriodFrequency.oneWeek;
    default:
      return PeriodFrequency.oneDay;
  }
};
