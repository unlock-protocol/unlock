import events from 'events'
import { CheckoutEvents, MethodCall, Paywall } from '../Paywall'
import { PaywallConfig } from '@unlock-protocol/types'

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

const Events = {
  resolveMethodCall: 'handleMethodCallEvent',
  resolveOnEvent: 'handleOnEventCallEvent',
}
export class PaywallProvider extends events.EventEmitter {
  paywall: Paywall
  unlockUrl: string
  config: PaywallConfig
  isMetamask = true

  #methodCalls: {
    [id: string]: (error: any, response: any) => void
  } = {}

  #eventHandlers: { [name: string]: (...args: any) => void } = {}

  constructor(paywall: Paywall, unlockUrl, config) {
    super()
    this.paywall = paywall
    this.unlockUrl = unlockUrl
    this.config = config
  }

  async connect() {
    if (this.paywall.iframe) {
      this.paywall.showIframe()
    } else {
      await this.paywall.shakeHands(this.unlockUrl)
    }
    this.paywall.sendOrBuffer('authenticate', this.config)
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

  async #createRequestPromise(args: MethodCall) {
    return new Promise((resolve, reject) => {
      this.#methodCalls[args.id] = (error: any, response: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      }
      this.paywall.sendOrBuffer(Events.resolveMethodCall, args)
    })
  }

  async request(args: MethodCall): Promise<unknown> {
    if (!args.id) {
      // Generate a random ID for this request
      args.id = window.crypto.randomUUID()
    }

    if (args.method === 'eth_requestAccounts') {
      await this.connect()
      const response = await this.#createRequestPromise(args)
      return response
    }
    const response = await this.#createRequestPromise(args)
    return response
  }

  on(event: string, callback: any) {
    this.#eventHandlers[event] = callback
    this.paywall.sendOrBuffer(Events.resolveOnEvent, { event })
    return this
  }
}
