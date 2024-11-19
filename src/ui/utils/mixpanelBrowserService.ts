import mixpanel from 'mixpanel-browser';

import eventBus from '@/eventBus';
import type { TrackingEvents } from '@/shared/types/tracking-types';

import { version } from '../../../package.json';

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
  private boundTrackEventHandler: <T extends keyof TrackingEvents>(params: {
    eventName: T;
    properties?: TrackingEvents[T];
  }) => void;
  private boundTrackUserHandler: (params: { userId: string }) => void;
  private boundTrackResetHandler: () => void;
  private boundTrackTimeHandler: (params: { eventName: keyof TrackingEvents }) => void;
  private constructor() {
    this.initMixpanel();
    // Store bound handlers so we can remove them later
    this.boundTrackEventHandler = <T extends keyof TrackingEvents>(params: {
      eventName: T;
      properties?: TrackingEvents[T];
    }) => {
      this.track(params.eventName, params.properties);
    };

    this.boundTrackUserHandler = (params: { userId: string }) => {
      this.identify(params.userId);
    };
    this.boundTrackResetHandler = () => {
      this.reset();
    };
    this.boundTrackTimeHandler = (params: { eventName: keyof TrackingEvents }) => {
      this.time(params.eventName);
    };

    this.setupEventListener();
  }

  private setupEventListener() {
    // Bind event handlers to the event bus
    eventBus.addEventListener('track_event', this.boundTrackEventHandler);
    eventBus.addEventListener('track_user', this.boundTrackUserHandler);
    eventBus.addEventListener('track_reset', this.boundTrackResetHandler);
    eventBus.addEventListener('track_time', this.boundTrackTimeHandler);
  }

  init() {
    // Don't need to do anything here
    // Mixpanel is initialized in the constructor
  }
  cleanup() {
    if (this.boundTrackEventHandler) {
      eventBus.removeEventListener('track_event', this.boundTrackEventHandler);
    }
    if (this.boundTrackUserHandler) {
      eventBus.removeEventListener('track_user', this.boundTrackUserHandler);
    }
    if (this.boundTrackResetHandler) {
      eventBus.removeEventListener('track_reset', this.boundTrackResetHandler);
    }
    if (this.boundTrackTimeHandler) {
      eventBus.removeEventListener('track_time', this.boundTrackTimeHandler);
    }
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
