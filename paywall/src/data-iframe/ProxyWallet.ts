export class ProxyWallet {
  id: number = 0

  isMetamask: boolean

  noWallet: boolean

  notEnabled: boolean

  requests: { [id: number]: any } = {} // id->callback map

  emit: (name: string, data?: any) => void

  constructor(
    walletInfo: {
      isMetamask: boolean
      noWallet: boolean
      notEnabled: boolean
    },
    emit: (name: string, data?: any) => void
  ) {
    this.isMetamask = walletInfo.isMetamask
    this.noWallet = walletInfo.noWallet
    this.notEnabled = walletInfo.notEnabled
    this.emit = emit
  }

  // TODO: get real types for these
  async sendAsync({ method, params }: any, callback: any) {
    const id = ++this.id

    if (this.noWallet) {
      callback(new Error('no ethereum wallet is available'))
      return
    }

    if (this.notEnabled) {
      callback(new Error('user declined to enable the ethereum wallet'))
      return
    }

    this.requests[id] = callback
    const payload = { method, params, id }

    // TODO: don't use string literals for messages
    this.emit('web3_call', payload)
  }
}

export default ProxyWallet
