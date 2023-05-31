import events from 'events'
import { CheckoutEvents, MethodCall, Paywall } from '../Paywall'

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

interface MethodCallResult {
  id: number
  response?: any
  error?: any
}

export class PaywallProvider extends events.EventEmitter {
  paywall: Paywall
  isMetamask = true

  #methodCalls: {
    [id: string]: (error: any, response: any) => void
  } = {}

  #eventHandlers: { [name: string]: (...args: any) => void } = {}

  constructor(paywall: Paywall) {
    super()
    this.paywall = paywall
    this.paywall.child!.on(
      CheckoutEvents.resolveOnEventCall,
      (event: string) => {
        return this.#eventHandlers?.[event]?.()
      }
    )
    this.paywall.child!.on(
      CheckoutEvents.resolveMethodCall,
      (args: MethodCallResult) => {
        const { id } = args
        const callback = this.#methodCalls[id]
        if (callback) {
          delete this.#methodCalls[id]
          callback(args.error, args.response)
        }
      }
    )
  }

  request(args: MethodCall): Promise<unknown> {
    if (!args.id) {
      // Generate a random ID for this request
      args.id = window.crypto.randomUUID()
    }
    return new Promise((resolve, reject) => {
      this.#methodCalls[args.id] = (error: any, response: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      }
      this.paywall.sendOrBuffer('providerRequest', args)
    })
  }

  on(event: string, callback: any) {
    this.#eventHandlers[event] = callback
    this.paywall.sendOrBuffer('providerOn', { event })
    return this
  }
}
