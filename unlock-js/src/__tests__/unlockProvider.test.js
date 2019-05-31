import UnlockProvider from '../unlockProvider'

const Wallet = require('ethers').Wallet

const rpc = method => ({
  id: 1, // except for `method` these are just dummy values of no import
  jsonrpc: 3,
  method,
})

describe('Unlock Provider', () => {
  let wallet
  let provider
  beforeEach(() => {
    const send = jest.fn((_, cb) => cb(null, 'a response'))
    wallet = Wallet.createRandom()
    // TODO: Mock the fallback provider in a better way.
    provider = new UnlockProvider({ send, _ethersType: 'Provider' })
    provider.connect(wallet)
  })

  it('should respond to eth_account with an array containing only `this.wallet.address` after being initialized', done => {
    expect.assertions(2)
    provider.send(rpc('eth_accounts'), (_, data) => {
      expect(data.result).toHaveLength(1)
      expect(data.result[0]).toBe(wallet.address)
      done()
    })
  })

  it('should call the fallback provider for any method it does not implement', done => {
    expect.assertions(1)
    provider.send(rpc('not_a_real_method'), () => {
      expect(provider.fallbackProvider.send).toHaveBeenCalled()
      done()
    })
  })
})
