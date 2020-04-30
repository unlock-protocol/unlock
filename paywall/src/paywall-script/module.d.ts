interface PaywallModuleConfig {
  readOnlyProvider: string
  locksmithUri: string
  unlockAppUrl: string
}

export function isUnlocked(
  userAccountAddress: string,
  paywallConfig: string,
  config: PaywallModuleConfig
): Promise<boolean>

export class Paywall {
  constructor(paywallConfig: any, moduleConfig: PaywallModuleConfig, provider?: any)
}
