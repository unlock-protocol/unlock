import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import WalletHandler from './WalletHandler'

export default class PurchaseHandler {
  private iframes: IframeHandler
  private walletHandler: WalletHandler

  constructor(iframes: IframeHandler, walletHandler: WalletHandler) {
    this.iframes = iframes
    this.walletHandler = walletHandler
  }

  init() {
    this.iframes.checkout.on(PostMessages.PURCHASE_KEY, async request => {
      if (this.walletHandler.usingUserAccounts()) {
        this.iframes.accounts.postMessage(PostMessages.PURCHASE_KEY, request)
      } else {
        this.iframes.data.postMessage(PostMessages.PURCHASE_KEY, request)
      }
    })
  }
}
