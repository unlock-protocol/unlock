import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig } from '../unlockTypes'

export default class DataHandler {
  private iframes: IframeHandler
  private config: PaywallConfig

  constructor(iframes: IframeHandler, config: PaywallConfig) {
    this.iframes = iframes
    this.config = config
  }

  init() {
    this.iframes.data.on(PostMessages.READY, () => {
      if (this.config) {
        this.iframes.data.postMessage(PostMessages.CONFIG, this.config)
      }
    })
  }
}
