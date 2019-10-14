import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig, Balance } from '../unlockTypes'
import { DEFAULT_STABLECOIN_BALANCE } from '../constants'
import StartupConstants from './startupTypes'

export const injectDefaultBalance = (
  oldBalance: Balance,
  managedPurchaseStablecoinAddress: string
): Balance => {
  const newBalance: Balance = {}
  const tokens = Object.keys(oldBalance)
  tokens.forEach(token => {
    if (token === managedPurchaseStablecoinAddress) {
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
    // listen for updates to state from the data iframe, and forward them to the checkout UI
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT, account =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
      let balanceUpdate = balance
      if (usingManagedAccount) {
        const { managedPurchaseStablecoinAddress } = this.constants
        balanceUpdate = injectDefaultBalance(
          balance,
          managedPurchaseStablecoinAddress
        )
      }
      this.iframes.checkout.postMessage(
        PostMessages.UPDATE_ACCOUNT_BALANCE,
        balanceUpdate
      )
    })
    this.iframes.data.on(PostMessages.UPDATE_LOCKS, locks =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_LOCKS, locks)
    )
    this.iframes.data.on(PostMessages.UPDATE_KEYS, keys =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_KEYS, keys)
    )
    this.iframes.data.on(PostMessages.UPDATE_TRANSACTIONS, transactions => {
      return this.iframes.checkout.postMessage(
        PostMessages.UPDATE_TRANSACTIONS,
        transactions
      )
    })
    this.iframes.data.on(PostMessages.UPDATE_NETWORK, network =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_NETWORK, network)
    )

    // pass on the configuration and request the latest data
    this.iframes.checkout.on(PostMessages.READY, () => {
      this.iframes.checkout.postMessage(PostMessages.CONFIG, this.config)

      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'locks')
      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'account')
      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'balance')
      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'network')
      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'keys')
      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'transactions')
    })

    // pass on any errors
    this.iframes.data.on(PostMessages.ERROR, error =>
      this.iframes.checkout.postMessage(PostMessages.ERROR, error)
    )

    // pass on locked status
    this.iframes.data.on(PostMessages.LOCKED, () =>
      this.iframes.checkout.postMessage(PostMessages.LOCKED, undefined)
    )
    this.iframes.data.on(PostMessages.UNLOCKED, lockAddresses =>
      this.iframes.checkout.postMessage(PostMessages.UNLOCKED, lockAddresses)
    )
  }
}
