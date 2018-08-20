import configure from '../config'

describe('config', () => {

  it('should include all networks', () => {
    let config = configure(global)
    expect(config.networks).toEqual({
      dev:
      {
        url: 'ws://127.0.0.1:8545',
        name: 'Development',
        protocol: 'ws',
      },
      test:
      {
        url: 'http://127.0.0.1:8545',
        name: 'Test',
        protocol: 'http',
      },
      ganache:
      {
        url: 'ws://127.0.0.1:8546',
        name: 'Ganache',
        protocol: 'ws',
      },
    })
  })

  describe('when metamask is available', () => {

    it('should include the metamask provider', () => {
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

      expect(config.networks.metamask).toEqual({
        name: 'Metamask',
        provider: {
          isMetaMask: true,
        },
      })
    })

  })

  describe('staging', () => {
    let config
    beforeEach(() => {
      config = configure({
        location: {
          hostname: 'staging.unlock-protocol.com',
        },
      })
    })

    it('should have the right default network', () => {
      expect(config.defaultNetwork).toEqual('metamask')
    })

  })

})