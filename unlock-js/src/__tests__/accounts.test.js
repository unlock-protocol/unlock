import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} from '../accounts'

jest.setTimeout(15000)

describe('account helpers', () => {
  describe('web3 accounts creation', () => {
    it('should call ethers.createRandom', async () => {
      expect.assertions(2)

      const {
        address,
        passwordEncryptedPrivateKey,
      } = await createAccountAndPasswordEncryptKey('hello')

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(passwordEncryptedPrivateKey.address).toBe(
        address.substring(2).toLowerCase()
      )
    })
  })

  describe('web3 account decryption', () => {
    it('should decrypt an account given the correct password', async () => {
      expect.assertions(1)
      const {
        address,
        passwordEncryptedPrivateKey,
      } = await createAccountAndPasswordEncryptKey('guest')

      const decryptedAddress = await getAccountFromPrivateKey(
        passwordEncryptedPrivateKey,
        'guest'
      )

      expect(decryptedAddress).toEqual(
        expect.objectContaining({
          address: address,
          privateKey: expect.any(String),
          publicKey: expect.any(String),
          signDigest: expect.any(Function),
          computeSharedSecret: expect.any(Function),
        })
      )
    })

    it('should throw when an incorrect password is given for an account', async () => {
      expect.assertions(2)
      const {
        passwordEncryptedPrivateKey,
      } = await createAccountAndPasswordEncryptKey('guest')

      try {
        await getAccountFromPrivateKey(passwordEncryptedPrivateKey, 'ghost')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e.message).toBe('invalid password')
      }
    })
  })
})
