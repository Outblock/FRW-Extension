import mixpanel from 'mixpanel-browser';

import type { TrackingEvents, TrackMessage } from '@/shared/types/tracking-types';

import packageJson from '../../../package.json';
const { version } = packageJson;

// Super properties that will be sent with every event
type SuperProperties = {
  app_version: string;
  platform: 'extension';
  environment: 'development' | 'production';
  wallet_type: 'flow';
};

class MixpanelBrowserService {
  private static instance: MixpanelBrowserService;
  private initialized = false;

  private mixpanelEventMessageHandler: (message: TrackMessage) => void;

  private constructor() {
    this.initMixpanel();

    this.mixpanelEventMessageHandler = (message: TrackMessage) => {
      switch (message.msg) {
        case 'track_event':
          // TypeScript knows eventName and properties are available here
          this.track(message.eventName, message.properties);
          break;
        case 'track_user':
          // TypeScript knows userId is available here
          this.identify(message.userId);
          break;
        case 'track_reset':
          // TypeScript knows this is just a reset message
          this.reset();
          break;
        case 'track_time':
          // TypeScript knows eventName is available here
          this.time(message.eventName);
          break;
      }
    };

    this.setupEventListener();
  }

  private setupEventListener() {
    // Listen for messages from the background script
    // This feels blunt as we have to switch on the message type
    // TODO: We should use a more elegant approach to filter messages based on the sender
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.msg) {
        case 'track_event':
        case 'track_user':
        case 'track_reset':
        case 'track_time':
          this.mixpanelEventMessageHandler(message);
          sendResponse({ success: true });
          break;
      }
      return true; // Keep the message channel open for asynchronous response
    });
  }

  init() {
    // Don't need to do anything here
    // Mixpanel is initialized in the constructor
  }
  cleanup() {
    // Remove the event listener
    chrome.runtime.onMessage.removeListener(this.mixpanelEventMessageHandler);
  }

  static getInstance(): MixpanelBrowserService {
    if (!MixpanelBrowserService.instance) {
      MixpanelBrowserService.instance = new MixpanelBrowserService();
    }
    return MixpanelBrowserService.instance;
  }

  private registerSuperProperties() {
    const superProperties: SuperProperties = {
      app_version: version,
      platform: 'extension',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      wallet_type: 'flow',
    };

    mixpanel.register(superProperties);
  }

  private initMixpanel() {
    if (this.initialized) return;

    const token = process.env.MIXPANEL_TOKEN;
    if (!token) {
      console.warn('Mixpanel token not found');
      return;
    }

    mixpanel.init(token, {
      debug: process.env.NODE_ENV !== 'production',
      track_pageview: true,
      persistence: 'localStorage',
      batch_requests: true,
      batch_size: 10,
      batch_flush_interval_ms: 2000,
    });

    this.registerSuperProperties();
    this.initialized = true;
  }

  track<T extends keyof TrackingEvents>(eventName: T, properties?: TrackingEvents[T]) {
    if (!this.initialized) {
      console.warn('Mixpanel not initialized');
      return;
    }

    const baseProps = {
      timestamp: Date.now(),
    };

    mixpanel.track(eventName, {
      ...baseProps,
      ...properties,
    });
  }

  time<T extends keyof TrackingEvents>(eventName: T) {
    mixpanel.time_event(eventName);
  }

  identify(userId: string) {
    if (!this.initialized) return;
    mixpanel.identify(userId);
  }

  reset() {
    if (!this.initialized) return;
    mixpanel.reset();
  }
}

export const mixpanelBrowserService = MixpanelBrowserService.getInstance();
