import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
  reEncryptPrivateKey,
} from '../../utils/accounts'

import { WALLET_ENCRYPTION_OPTIONS } from '../../constants'

jest.setTimeout(20000)

describe('account helpers', () => {
  describe('web3 accounts creation', () => {
    it('should call ethers.createRandom', async () => {
      expect.assertions(3)

      const { address, passwordEncryptedPrivateKey } =
        await createAccountAndPasswordEncryptKey('hello')

      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(passwordEncryptedPrivateKey.address).toBe(
        address.substring(2).toLowerCase()
      )
      expect(passwordEncryptedPrivateKey.Crypto.kdfparams.n).toBe(
        WALLET_ENCRYPTION_OPTIONS.scrypt.N
      )
    })
  })

  describe('web3 account decryption', () => {
    it('should decrypt an account given the correct password', async () => {
      expect.assertions(1)
      const { address, passwordEncryptedPrivateKey } =
        await createAccountAndPasswordEncryptKey('guest')

      const decryptedAddress = await getAccountFromPrivateKey(
        passwordEncryptedPrivateKey,
        'guest'
      )

      expect(decryptedAddress).toEqual(
        expect.objectContaining({
          address,
        })
      )
    })

    it('should throw when an incorrect password is given for an account', async () => {
      expect.assertions(2)
      const { passwordEncryptedPrivateKey } =
        await createAccountAndPasswordEncryptKey('guest')

      try {
        await getAccountFromPrivateKey(passwordEncryptedPrivateKey, 'ghost')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e.message).toBe('invalid password')
      }
    })
  })

  describe('re-encrypting a private key with a new password', () => {
    it('should return a new wallet that can be decrypted with the new password', async () => {
      expect.assertions(1)
      const oldPassword = 'p@55ω0rd'
      const newPassword = 'γΘτΕ'
      const { address, passwordEncryptedPrivateKey } =
        await createAccountAndPasswordEncryptKey(oldPassword)

      const newEncryptedKey = await reEncryptPrivateKey(
        passwordEncryptedPrivateKey,
        oldPassword,
        newPassword
      )

      const wallet = await getAccountFromPrivateKey(
        newEncryptedKey,
        newPassword
      )

      const newKeyAddress = wallet.address
      // This means we successfully decrypted the new payload with the new
      // password, and we got the same account back out of it.
      expect(newKeyAddress).toEqual(address)
    })
  })

  it('should throw when an incorrect password is given for an account', async () => {
    expect.assertions(2)
    const { passwordEncryptedPrivateKey } =
      await createAccountAndPasswordEncryptKey('ghost')

    try {
      // Note that password order has been swapped
      await reEncryptPrivateKey(passwordEncryptedPrivateKey, 'geist', 'ghost')
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('invalid password')
    }
  })
})
