import IframeHandler from './IframeHandler'
import { PaywallConfig, Balance } from '../unlockTypes'
import { checkoutHandlerInit } from './postMessageHub'
import StartupConstants from './startupTypes'

import { DEFAULT_STABLECOIN_BALANCE } from '../constants'

export const injectDefaultBalance = (
  oldBalance: Balance,
  erc20ContractAddress: string
): Balance => {
  const newBalance: Balance = {}
  const tokens = Object.keys(oldBalance)
  tokens.forEach(token => {
    if (token === erc20ContractAddress) {
      // If the token is the one we allow, we give the user a default
      // balance. TODO: only do this if the corresponding lock is approved.
      newBalance[token] = DEFAULT_STABLECOIN_BALANCE
    } else {
      // the "null account" 0x0000000... has an enormous balance of eth and other tokens. We zero
      // them out here so that we don't enable purchasing on the wrong locks for user
      // account users.
      newBalance[token] = '0'
    }
  })

  return newBalance
}

/**
 * This class handles inter-iframe communication between the checkout iframe and data iframe
 *
 * It listens for state updates from the data iframe and forwards them to the checkout iframe
 * it listens for the "ready" event, and requests updates from the data iframe
 * it passes on errors to the checkout iframe
 */
export default class CheckoutUIHandler {
  private iframes: IframeHandler
  private config: PaywallConfig
  private constants: StartupConstants

  constructor(
    iframes: IframeHandler,
    config: PaywallConfig,
    constants: StartupConstants
  ) {
    this.iframes = iframes
    this.config = config
    this.constants = constants
  }

  init({ usingManagedAccount }: { usingManagedAccount: boolean }) {
    checkoutHandlerInit({
      usingManagedAccount,
      constants: this.constants,
      config: this.config,
      dataIframe: this.iframes.data,
      checkoutIframe: this.iframes.checkout,
    })
  }
}
