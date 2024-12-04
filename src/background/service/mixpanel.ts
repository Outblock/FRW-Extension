import eventBus from '@/eventBus';
import type { TrackingEvents } from '@/shared/types/tracking-types';

// TODO: Look at using a server side proxy service to send events to Mixpanel
// Note: Mixpanel is initialized in the browser side. Yes... it is possible for events to be lost if there is no listener.
// At some point, we should migrate to a more reliable event bus.
class MixpanelService {
  private static instance: MixpanelService;
  private initialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): MixpanelService {
    if (!MixpanelService.instance) {
      MixpanelService.instance = new MixpanelService();
    }
    return MixpanelService.instance;
  }

  init() {
    if (this.initialized) return;

    this.initialized = true;
  }
  track<T extends keyof TrackingEvents>(eventName: T, properties?: TrackingEvents[T]) {
    chrome.runtime.sendMessage({
      msg: 'track_event',
      eventName,
      properties,
    });
  }

  time<T extends keyof TrackingEvents>(eventName: T) {
    chrome.runtime.sendMessage({
      msg: 'track_time',
      eventName,
    });
  }

  identify(userId: string) {
    if (!this.initialized) return;

    chrome.runtime.sendMessage({
      msg: 'track_user',
      userId,
    });
  }

  reset() {
    if (!this.initialized) return;

    chrome.runtime.sendMessage({
      msg: 'track_reset',
    });
  }
}

export const mixpanelTrack = MixpanelService.getInstance();
