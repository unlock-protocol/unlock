import UnlockProvider from '../unlockProvider'

const ethers = require.requireActual('ethers')

function provider() {
  return {
    send: jest.fn(() => 'a response'),
    _ethersType: 'Provider',
  }
}

ethers.providers.JsonRpcProvider = provider

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
const publicKey = '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290'
const password = 'foo'

const userData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    User: [
      { name: 'emailAddress', type: 'string' },
      { name: 'publicKey', type: 'address' },
      { name: 'passwordEncryptedPrivateKey', type: 'string' },
    ],
  },
  domain: {
    name: 'Unlock',
    version: '1',
  },
  primaryType: 'User',
  message: {
    user: {
      emailAddress: 'geoff@bitconnect.gov',
      publicKey: publicKey,
      passwordEncryptedPrivateKey: key,
    },
  },
}

describe('Unlock Provider', () => {
  let provider
  beforeEach(async () => {
    const readOnlyProvider = 'http://localhost:8545'
    provider = new UnlockProvider({ readOnlyProvider })
    await provider.connect({ key, password })
  })

  describe('implemented json-rpc calls', () => {
    it('should respond to eth_account with an array containing only `this.wallet.address` after being initialized', async () => {
      expect.assertions(2)
      const accounts = await provider.send('eth_accounts')
      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toEqual(publicKey)
    })

    it('should respond to eth_signTypedData with a valid signature', async () => {
      expect.assertions(1)

      const signature = await provider.send('eth_signTypedData', userData)
      expect(signature).toEqual(
        '0xaada981b4ac46a5c7a731a988b8ae882ae05aca9c3d15cc406d5896338e4ba231aac1891405b8841d0c75e5e8a8c7a16b86b13eaf9e729f5eef196d1e5341eba1c'
      )
    })
  })

  it('should call the fallback provider for any method it does not implement', async () => {
    expect.assertions(1)
    await provider.send('not_a_real_method')
    expect(provider.fallbackProvider.send).toHaveBeenCalled()
  })
})
