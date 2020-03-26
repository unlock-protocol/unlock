interface PaywallModuleConfig {
  readOnlyProvider: string
  locksmithUri: string
}

export function isUnlocked(
  userAccountAddress: string,
  paywallConfig: string,
  config: PaywallModuleConfig
): Promise<boolean>
