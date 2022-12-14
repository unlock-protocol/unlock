import { DecoyUser } from '../../src/utils/decoyUser'

describe('DecoyUser', () => {
  const decoyUser = new DecoyUser()
  describe('recoveryPhrase', () => {
    it('returns a randomly generate string', () => {
      expect.assertions(1)
      const recoveryPhrase = decoyUser.recoveryPhrase()
      expect(recoveryPhrase.length).not.toBe(0)
    })
  })

  describe('encryptedPrivateKey', () => {
    it('returns an encrypted keystore v3 JSON', async () => {
      expect.assertions(3)
      decoyUser.encryptedPrivateKey = async () => {
        return JSON.stringify({
          address: '',
          id: '',
          version: 3,
        })
      }
      const encryptedPrivateKey = JSON.parse(
        await decoyUser.encryptedPrivateKey()
      )

      expect(encryptedPrivateKey).toHaveProperty('address')
      expect(encryptedPrivateKey).toHaveProperty('id')
      expect(encryptedPrivateKey).toHaveProperty('version')
    })
  })
})
