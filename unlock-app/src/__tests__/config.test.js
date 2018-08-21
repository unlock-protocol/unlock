import configure from '../config'

describe('config', () => {

  it('should have the right keys in dev', () => {
    let config = configure(global)
    expect(config.requiredNetwork).toEqual(false)
    expect(config.providers).toEqual({
      HTTP: {
        connected: false,
        headers: undefined,
        host: 'http://127.0.0.1:8545',
        timeout: 0,
      },
    })
  })

  it('should have the right keys in dev when there is a web3 provider', () => {
    let config = configure({
      web3: {
        currentProvider: {
          isMetaMask: true,
        },
      },
      location: {
        hostname: 'localhost',
      },
    })
    expect(config.requiredNetwork).toEqual(false)
    expect(config.providers).toEqual({
      HTTP: {
        connected: false,
        headers: undefined,
        host: 'http://127.0.0.1:8545',
        timeout: 0,
      },
      Metamask: {
        isMetaMask: true,
      },
    })
  })

  it('should have the right keys in staging', () => {
    let config = configure({
      web3: {
        currentProvider: {
          isMetaMask: true,
        },
      },
      location: {
        hostname: 'staging.unlock-protocol.com',
      },
    })
    expect(config.requiredNetwork).toEqual(4) // Rinkeby
    expect(config.providers).toEqual({
      Metamask: {
        isMetaMask: true,
      },
    })
  })

  it('should have the right keys in production', () => {
    let config = configure({
      location: {
        hostname: 'unlock-protocol.com',
      },
    })
    expect(config.requiredNetwork).toEqual(1) // main net
    expect(config.providers).toEqual({}) // We miss a web3 provider!
  })

})