import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import {
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../windowTypes'
import { PaywallConfig } from '../unlockTypes'
import { PostMessages } from '../messageTypes'

/**
 * This class creates the 3 iframes and provides a simple way to access all 3
 *
 * In addition, it contains code for passing information to the accounts iframe
 * because putting anywhere else introduces a circular dependency and eslint
 * bails out
 */
export default class IframeHandler {
  data: DataIframeMessageEmitter
  checkout: CheckoutIframeMessageEmitter
  accounts: AccountsIframeMessageEmitter

  constructor(
    window: IframeManagingWindow & PostOfficeWindow & OriginWindow,
    dataIframeUrl: string,
    checkoutIframeUrl: string,
    userIframeUrl: string
  ) {
    this.data = new DataIframeMessageEmitter(window, dataIframeUrl)
    this.checkout = new CheckoutIframeMessageEmitter(window, checkoutIframeUrl)
    // note that until "iframes.accounts.createIframe()" is called in Wallet.setupWallet(), this is a fake iframe
    this.accounts = new AccountsIframeMessageEmitter(window, userIframeUrl)
  }

  init() {
    this.data.setupListeners()
    this.checkout.setupListeners()
    // account listener setup will be on-demand, done by the Wallet in setupWallet()
  }

  /**
   * This is called in Wallet.init() if user accounts are enabled
   */
  setupAccountUIHandler(config: PaywallConfig) {
    // listen for updates to state from the data iframe, and forward them to the checkout UI
    this.data.on(PostMessages.UPDATE_LOCKS, locks =>
      this.accounts.postMessage(PostMessages.UPDATE_LOCKS, locks)
    )

    // pass on the configuration and request the latest data
    this.data.on(PostMessages.READY, () => {
      this.accounts.postMessage(PostMessages.CONFIG, config)

      this.data.postMessage(PostMessages.SEND_UPDATES, 'locks')
    })
  }
}
