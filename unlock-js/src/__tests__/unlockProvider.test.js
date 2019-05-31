import UnlockProvider from '../unlockProvider'

const key = {
  id: 'fb1280c0-d646-4e40-9550-7026b1be504a',
  address: '88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290',
  Crypto: {
    kdfparams: {
      dklen: 32,
      p: 1,
      salt: 'bbfa53547e3e3bfcc9786a2cbef8504a5031d82734ecef02153e29daeed658fd',
      r: 8,
      n: 262144,
    },
    kdf: 'scrypt',
    ciphertext:
      '10adcc8bcaf49474c6710460e0dc974331f71ee4c7baa7314b4a23d25fd6c406',
    mac: '1cf53b5ae8d75f8c037b453e7c3c61b010225d916768a6b145adf5cf9cb3a703',
    cipher: 'aes-128-ctr',
    cipherparams: {
      iv: '1dcdf13e49cea706994ed38804f6d171',
    },
  },
  version: 3,
}

const password = 'foo'

const rpc = method => ({
  id: 1, // except for `method` these are just dummy values of no import
  jsonrpc: 3,
  method,
})

describe('Unlock Provider', () => {
  let provider
  beforeEach(async () => {
    const send = jest.fn((_, cb) => cb(null, 'a response'))
    // TODO: Mock the fallback provider in a better way.
    provider = new UnlockProvider({ send, _ethersType: 'Provider' })
    await provider.connect({ key, password })
  })

  it('should respond to eth_account with an array containing only `this.wallet.address` after being initialized', done => {
    expect.assertions(2)
    provider.send(rpc('eth_accounts'), (_, data) => {
      expect(data.result).toHaveLength(1)
      expect(data.result[0]).toEqual(
        '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290'
      )
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
