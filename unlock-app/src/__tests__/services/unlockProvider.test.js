import UnlockProvider from '../../services/unlockProvider'

describe('Unlock Provider', () => {
  let provider
  beforeEach(() => {
    provider = new UnlockProvider({})
  })
  it('should respond to eth_accounts with an empty array before being initialized', done => {
    expect.assertions(1)
    provider.send(
      {
        id: 1,
        jsonrpc: 3,
        method: 'eth_accounts',
      },
      (_, data) => {
        expect(data.result).toHaveLength(0)
        done()
      }
    )
  })
})
