import { getWeb3Provider } from '../providers'

describe('web3 provider creator', () => {
  it('getWeb3Provider returns a valid web3 provider for a URL', () => {
    expect.assertions(2)

    // using ws so that the test will still pass when we move to WebSocketProvider
    const provider = getWeb3Provider('ws://1.2.3.4:1234')
    expect(provider.send).toBeInstanceOf(Function)
    expect(provider.disconnect).toBeInstanceOf(Function)
  })
})
