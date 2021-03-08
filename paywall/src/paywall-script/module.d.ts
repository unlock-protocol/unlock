
export function isUnlocked(
  userAccountAddress: string,
  paywallConfig: PaywallConfig,
): Promise<boolean>

export class Paywall {
  constructor(paywallConfig: PaywallConfig, networkConfigs: NetworkConfigs, provider?: any)
}
