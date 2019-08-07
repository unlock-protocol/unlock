import DataIframeMessageEmitter from './DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './CheckoutIframeMessageEmitter'
import UserAccountsIframeMessageEmitter from './UserAccountsIframeMessageEmitter'
import {
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../windowTypes'

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
}
