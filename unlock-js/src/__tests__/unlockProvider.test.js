import sigUtil from 'eth-sig-util'
import UnlockProvider from '../unlockProvider'
import UnlockUser from '../structured_data/unlockUser'

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
const emailAddress = 'geoff@bitconnect.gov'

const userData = UnlockUser.build({
  emailAddress,
  publicKey,
  passwordEncryptedPrivateKey: key,
})

describe('Unlock Provider', () => {
  let provider
  beforeEach(async () => {
    const readOnlyProvider = 'http://localhost:8545'
    provider = new UnlockProvider({ readOnlyProvider })
    await provider.connect({ key, password, emailAddress })
  })

  describe('object properties', () => {
    it('should have a property `isUnlock` that is set to `true`', () => {
      expect.assertions(1)
      expect(provider.isUnlock).toBeTruthy()
    })

    it('should have a property `wallet` that is set to an ethers wallet', () => {
      expect.assertions(1)
      expect(provider.wallet).toEqual(
        expect.objectContaining({
          address: publicKey,
        })
      )
    })

    it('should have a property `emailAddress` that is set to the provided email address', () => {
      expect.assertions(1)
      expect(provider.emailAddress).toEqual(emailAddress)
    })
  })

  describe('implemented JSON-RPC calls', () => {
    it('should respond to eth_accounts with an array containing only `this.wallet.address` after being initialized', async () => {
      expect.assertions(2)
      const accounts = await provider.send('eth_accounts')
      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toEqual(publicKey)
    })

    it('should respond to eth_signTypedData with a valid signature', async () => {
      expect.assertions(1)
      const sig = await provider.send('eth_signTypedData', [
        'account',
        { data: userData },
      ])
      // sigutil seems to downcase things
      expect(sigUtil.recoverTypedSignature({ data: userData, sig })).toEqual(
        publicKey.toLowerCase()
      )
    })
  })
})
