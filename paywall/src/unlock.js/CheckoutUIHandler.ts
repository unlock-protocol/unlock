import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig, Balance } from '../unlockTypes'
import { DEFAULT_STABLECOIN_BALANCE } from '../constants'

export const injectDefaultBalance = (oldBalance: Balance): Balance => {
  const newBalance: Balance = {}
  const tokens = Object.keys(oldBalance)
  tokens.forEach(token => {
    if (token.startsWith('0x')) {
      newBalance[token] = DEFAULT_STABLECOIN_BALANCE
    } else {
      newBalance[token] = oldBalance[token]
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

  constructor(iframes: IframeHandler, config: PaywallConfig) {
    this.iframes = iframes
    this.config = config
  }

  init({ usingManagedAccount }: { usingManagedAccount: boolean }) {
    // listen for updates to state from the data iframe, and forward them to the checkout UI
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT, account =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance => {
      let balanceUpdate = balance
      if (usingManagedAccount) {
        balanceUpdate = injectDefaultBalance(balance)
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

    // listen for wallet action
    this.iframes.data.on(PostMessages.UPDATE_WALLET, update =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_WALLET, update)
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
