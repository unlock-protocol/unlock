import UnlockProvider from '../../services/unlockProvider'

const rpc = method => ({
  id: 1, // except for `method` these are just dummy values of no import
  jsonrpc: 3,
  method,
})

describe('Unlock Provider', () => {
  let provider
  beforeEach(() => {
    provider = new UnlockProvider({})
  })
  it('should respond to eth_accounts with an empty array before being initialized', done => {
    expect.assertions(1)
    provider.send(rpc('eth_accounts'), (_, data) => {
      expect(data.result).toHaveLength(0)
      done()
    })
  })

  it('should respond to eth_account with an array containing only `this.address` after being initialized', done => {
    expect.assertions(2)
    provider.setAddress('0x12345678')
    provider.send(rpc('eth_accounts'), (_, data) => {
      expect(data.result).toHaveLength(1)
      expect(data.result[0]).toBe('0x12345678')
      done()
    })
  })
})
