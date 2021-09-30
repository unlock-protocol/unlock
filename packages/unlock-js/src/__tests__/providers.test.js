import { getWeb3Provider } from '../providers'

describe('web3 provider creator', () => {
  it('getWeb3Provider returns the URL it is given', () => {
    expect.assertions(1)

    // using ws so that the test will still pass when we move to WebSocketProvider
    const provider = getWeb3Provider('ws://1.2.3.4:1234')
    expect(provider).toBe('ws://1.2.3.4:1234')
  })
})
