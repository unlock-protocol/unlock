let paywallConfig
let paywallConfigLocks

// these are used by the postOffice to filter the locks
export function setPaywallConfig(newConfig) {
  paywallConfig = newConfig
  if (newConfig) {
    paywallConfigLocks = Object.keys(newConfig.locks)
  } else {
    paywallConfigLocks = undefined
  }
}

export function getPaywallConfig() {
  return paywallConfig
}

export function getRelevantLocks() {
  return paywallConfigLocks
}
