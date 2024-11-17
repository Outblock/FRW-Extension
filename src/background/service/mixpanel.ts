import mixpanel from 'mixpanel-browser';

import { version } from '../../../package.json';

type BaseProperties = {
  wallet_address?: string;
  network?: string;
  timestamp?: number;
};

// Super properties that will be sent with every event
type SuperProperties = {
  app_version: string;
  platform: 'extension';
  environment: 'development' | 'production';
  wallet_type: 'flow';
};

type TrackingEvents = {
  // Platform Events
  app_launched: BaseProperties;
  screen_view: BaseProperties & {
    screen_name: string;
    path?: string;
  };

  // Wallet Events
  wallet_created: BaseProperties & {
    wallet_type: 'hd' | 'imported' | 'hardware';
    is_first_wallet: boolean;
  };
  wallet_imported: BaseProperties & {
    wallet_type: 'private_key' | 'seed_phrase';
  };
  wallet_unlocked: BaseProperties;
  wallet_locked: BaseProperties;
  wallet_switched: BaseProperties & {
    from_address: string;
    to_address: string;
  };

  // Transaction Events
  transaction_sent: BaseProperties & {
    value: number;
    token_symbol: string;
    transaction_type: 'transfer' | 'swap' | 'contract_interaction';
    gas_price?: number;
  };
  transaction_failed: BaseProperties & {
    error: string;
    transaction_type: string;
  };

  // NFT Events
  nft_view: BaseProperties & {
    collection_address: string;
    token_id: string;
  };
  nft_transfer: BaseProperties & {
    collection_address: string;
    token_id: string;
    recipient_address: string;
  };

  // Settings Events
  settings_changed: BaseProperties & {
    setting_type: string;
    new_value: unknown; // Look at tightening this up based on settings
    old_value: unknown;
  };
  network_switched: BaseProperties & {
    from_network: string;
    to_network: string;
  };
};

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

  private registerSuperProperties() {
    const superProperties: SuperProperties = {
      app_version: version,
      platform: 'extension',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      wallet_type: 'flow',
    };

    mixpanel.register(superProperties);
  }

  init() {
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
      //     network: userWalletService.getNetwork(),
      //    wallet_address: userWalletService.getCurrentAddress(),
    };

    mixpanel.track(eventName, {
      ...baseProps,
      ...properties,
    });
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

export const mixpanelTrack = MixpanelService.getInstance();
