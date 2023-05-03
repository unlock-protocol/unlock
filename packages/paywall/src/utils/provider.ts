import events from 'events'

export interface Web3Window {
  // Present with more recent injected providers
  ethereum?: any
  // Present with legacy injected providers
  web3?: {
    currentProvider: any
  }
}

export const getInjectedProvider = (): any => {
  if (typeof window !== 'undefined') {
    const web3Window = window as Web3Window
    // Using a "modern" dapp browser
    if (web3Window && web3Window.ethereum) {
      return web3Window.ethereum
    }

    // Using a "legacy" dapp browser
    if (web3Window && web3Window.web3) {
      return web3Window.web3.currentProvider
    }
  }

  // Browser is not web3 capable
  return undefined
}

/**
 * Helper function to support legacy "enable" method on providers.
 * @param provider
 * @returns
 */
export const enableProvider = async (provider: any) => {
  // This should not occur; if there is no provider, the paywall
  // script should prevent the checkout iframe from trying to connect
  // to one.
  if (!provider) {
    throw new Error('Fatal: no web3 provider found.')
  }

  // resolves if provider is already enabled or if user allows provider to enable
  // rejects if user does not allow
  if (provider.enable) {
    return await provider.enable()
  }
  return null
}

export class PaywallProvider extends events.EventEmitter {
  paywall: any
  isPaywallProvider = true

  constructor(paywall: any) {
    super()
    this.paywall = paywall
    // Be ready to emit the following:
    // - connect
    // - disconnect
    // - chainChanged
    // - accountsChanged
    // - message
    console.log(this.paywall)
  }

  request(args: any): Promise<unknown> {
    console.log('>>> REQUEST', args)
    return new Promise((resolve, reject) => {
      this.paywall.sendOrBuffer('providerRequest', args)
      // And now waittt so we can resolve!
    })
  }
}
