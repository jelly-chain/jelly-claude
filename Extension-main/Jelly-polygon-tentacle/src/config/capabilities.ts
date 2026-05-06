/** Feature flags for jelly-polygon-tentacle capabilities. */

export interface ExtensionCapabilities {
  supportsPolymarket: boolean;
  supportsWebhooks: boolean;
  supportsSimulation: boolean;
  supportsTracing: boolean;
  supportsNegRiskMarkets: boolean;
  supportsClobOrderBook: boolean;
}

export const CAPABILITIES: ExtensionCapabilities = {
  supportsPolymarket: true,
  supportsWebhooks: true,
  supportsSimulation: true,
  supportsTracing: false,
  supportsNegRiskMarkets: true,
  supportsClobOrderBook: true,
};

export function hasCapability(flag: keyof ExtensionCapabilities): boolean {
  return CAPABILITIES[flag];
}
