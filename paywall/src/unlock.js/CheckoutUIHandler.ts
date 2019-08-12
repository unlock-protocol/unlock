import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig } from '../unlockTypes'

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

  init() {
    // listen for updates to state from the data iframe, and forward them to the checkout UI
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT, account =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.iframes.data.on(PostMessages.UPDATE_ACCOUNT_BALANCE, balance =>
      this.iframes.checkout.postMessage(
        PostMessages.UPDATE_ACCOUNT_BALANCE,
        balance
      )
    )
    this.iframes.data.on(PostMessages.UPDATE_LOCKS, locks =>
      this.iframes.checkout.postMessage(PostMessages.UPDATE_LOCKS, locks)
    )
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
