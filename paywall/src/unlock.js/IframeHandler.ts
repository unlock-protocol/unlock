import DataIframeMessageEmitter from './PostMessageEmitters/DataIframeMessageEmitter'
import CheckoutIframeMessageEmitter from './PostMessageEmitters/CheckoutIframeMessageEmitter'
import AccountsIframeMessageEmitter from './PostMessageEmitters/AccountsIframeMessageEmitter'
import {
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../windowTypes'

/**
 * This class creates the 3 iframes and provides a simple way to access all 3
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
}
