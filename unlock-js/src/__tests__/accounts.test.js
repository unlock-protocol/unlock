import {
  createAccountAndPasswordEncryptKey,
  getAddressFromPrivateKey,
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

      const decryptedAddress = getAddressFromPrivateKey(
        passwordEncryptedPrivateKey,
        'guest'
      )

      expect(decryptedAddress).toBe(address)
    })

    it('should throw when an incorrect password is given for an account', () => {
      expect.assertions(1)
      const {
        passwordEncryptedPrivateKey,
      } = createAccountAndPasswordEncryptKey('guest')

      expect(() => {
        getAddressFromPrivateKey(passwordEncryptedPrivateKey, 'ghost')
      }).toThrow()
    })
  })
})
