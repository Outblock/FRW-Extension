import { useCallback } from 'react';

import type { TrackingEvents } from '@/shared/types/tracking-types';

import { mixpanelBrowserService } from './mixpanelBrowserService';

export const useMixpanel = () => {
  const track = useCallback(
    <T extends keyof TrackingEvents>(eventName: T, properties?: TrackingEvents[T]) => {
      mixpanelBrowserService.track(eventName, properties);
    },
    []
  );

  const identify = useCallback((userId: string) => {
    mixpanelBrowserService.identify(userId);
  }, []);

  const reset = useCallback(() => {
    mixpanelBrowserService.reset();
  }, []);

  return {
    track,
    identify,
    reset,
  };
};
