export type Enabler = {
  enable: () => Promise<void>
}

export interface Web3Window {
  // Present with more recent injected providers
  ethereum?: Enabler
  // Present with legacy injected providers
  web3?: {
    currentProvider: Enabler
  }
}

export const getProvider = (window: Web3Window): Enabler | undefined => {
  // Using a "modern" dapp browser
  if (window.ethereum) {
    return window.ethereum
  }

  // Using a "legacy" dapp browser
  if (window.web3) {
    return window.web3.currentProvider
  }

  // Browser is not web3 capable
  return undefined
}

export const enableInjectedProvider = async (provider: Enabler | undefined) => {
  // This should not occur; if there is no provider, the paywall
  // script should prevent the checkout iframe from trying to connect
  // to one.
  if (!provider) {
    throw new Error('Fatal: no web3 provider found.')
  }

  // resolves if provider is already enabled or if user allows provider to enable
  // rejects if user does not allow
  await provider.enable()
}
