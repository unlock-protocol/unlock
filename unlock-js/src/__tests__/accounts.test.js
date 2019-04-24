import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} from '../accounts'

describe('account helpers', () => {
  describe('web3 accounts creation', () => {
    it('should call web3.accounts.create', () => {
      expect.assertions(2)

      const {
        address,
        passwordEncryptedPrivateKey,
      } = createAccountAndPasswordEncryptKey('hello')

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(passwordEncryptedPrivateKey.address).toBe(
        address.substring(2).toLowerCase()
      )
    })
  })

  describe('web3 account decryption', () => {
    it('should decrypt an account given the correct password', () => {
      expect.assertions(1)
      const {
        address,
        passwordEncryptedPrivateKey,
      } = createAccountAndPasswordEncryptKey('guest')

      const decryptedAddress = getAccountFromPrivateKey(
        passwordEncryptedPrivateKey,
        'guest'
      )

      expect(decryptedAddress).toEqual(
        expect.objectContaining({
          address: address,
          privateKey: expect.any(String),
          encrypt: expect.any(Function),
          sign: expect.any(Function),
          signTransaction: expect.any(Function),
        })
      )
    })

    it('should throw when an incorrect password is given for an account', () => {
      expect.assertions(1)
      const {
        passwordEncryptedPrivateKey,
      } = createAccountAndPasswordEncryptKey('guest')

      expect(() => {
        getAccountFromPrivateKey(passwordEncryptedPrivateKey, 'ghost')
      }).toThrow()
    })
  })
})
