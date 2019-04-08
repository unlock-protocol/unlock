// UnlockProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class UnlockProvider {
  constructor(fallbackProvider) {
    this.fallbackProvider = fallbackProvider
    this.address = ''
  }

  disconnect = () => true

  async eth_accounts(respond) {
    // Must always return an array of addresses
    if (this.address) {
      respond([this.address])
    } else {
      respond([])
    }
  }

  setAddress(newAddress) {
    this.address = newAddress
  }

  send(args, cb) {
    const { id, jsonrpc, method } = args
    // Calling respond with some argument will call the callback with
    // a "fake" JSON-RPC response constructed by the provider.
    const respond = result => {
      cb(null, {
        id,
        jsonrpc,
        result,
      })
    }

    try {
      return this[method](respond)
    } catch (err) {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return this.fallbackProvider.send(args, cb)
    }
  }
}
