import DataIframeMessageEmitter from './DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './CheckoutIframeMessageEmitter'
import UserAccountsIframeMessageEmitter from './UserAccountsIframeMessageEmitter'
import {
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../windowTypes'
import { PaywallConfig } from '../unlockTypes'
import { PostMessages } from '../messageTypes'

export default class IframeHandler {
  data: DataIframeMessageEmitter
  checkout: CheckoutIframeMessageEmitter
  accounts: UserAccountsIframeMessageEmitter

  constructor(
    window: IframeManagingWindow & PostOfficeWindow & OriginWindow,
    dataIframeUrl: string,
    checkoutIframeUrl: string,
    userIframeUrl: string
  ) {
    this.data = new DataIframeMessageEmitter(window, dataIframeUrl)
    this.checkout = new CheckoutIframeMessageEmitter(window, checkoutIframeUrl)
    this.accounts = new UserAccountsIframeMessageEmitter(window, userIframeUrl)
  }

  init() {
    this.data.setupListeners()
    this.checkout.setupListeners()
    // account listener setup will be on-demand
  }

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
