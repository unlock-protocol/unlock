import events from 'events'

export interface Provider {}

export class Provider extends events.EventEmitter {
  paywall: any

  constructor(paywall: any) {
    super()
    this.paywall = paywall
    // Be ready to emit the following:
    // - connect
    // - disconnect
    // - chainChanged
    // - accountsChanged
    // - message
    console.log(this.paywall)
  }

  request(args: any): Promise<unknown> {
    console.log('>>> REQUEST', args)
    return new Promise((resolve, reject) => {
      this.paywall.sendOrBuffer('providerRequest', args)
      // And now waittt so we can resolve!
    })
  }
}
