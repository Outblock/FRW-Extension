// Example of features we use, but could be any string key as we add more
export type FeatureFlagKey = 'free_gas' | 'swap' | 'tx_warning_prediction' | string;

// Feature flags
export type FeatureFlags = {
  // Other feature flags
  [key: FeatureFlagKey]: boolean;
};