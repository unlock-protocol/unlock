let paywallConfig
let paywallConfigLocks

// these are used by the postOffice to filter the locks
export function setPaywallConfig(newConfig) {
  paywallConfig = newConfig
  paywallConfigLocks = Object.keys(newConfig.locks)
}

export function getPaywallConfig() {
  return paywallConfig
}

export function getRelevantLocks() {
  return paywallConfigLocks
}
