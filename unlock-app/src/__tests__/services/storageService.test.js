import axios from 'axios'
import { StorageService, success, failure } from '../../services/storageService'
import UnlockUser from '../../structured_data/unlockUser'
import { vi, describe, beforeAll, beforeEach, expect, it } from 'vitest'

const emailAddress = 'stick@stick.ly'
const publicKey = '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290'
const passwordEncryptedPrivateKey = {
  id: 'fb1280c0-d646-4e40-9550-7026b1be504a',
  address: '0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290',
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

const user = UnlockUser.build({
  emailAddress,
  publicKey,
  passwordEncryptedPrivateKey,
})

describe.skip('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  let storageService

  beforeEach(() => {
    vi.clearAllMocks()
    storageService = new StorageService(serviceHost)
  })

  describe('Create user', () => {
    describe('When a user can be created', () => {
      it('emits a success', (done) => {
        expect.assertions(5)
        const recoveryPhrase = 'recoveryPhrase'
        axios.post.mockReturnValue({
          data: {
            recoveryPhrase,
          },
        })

        const emailAddress = 'johnnyapple@seed.ly'
        const password = 'password123'

        storageService.on(success.createUser, (result) => {
          expect(result.passwordEncryptedPrivateKey).toEqual(
            passwordEncryptedPrivateKey
          )
          expect(result.emailAddress).toEqual(emailAddress)
          expect(result.password).toEqual(password)
          expect(result.recoveryPhrase).toEqual(recoveryPhrase)
          done()
        })
        storageService.createUser(user, emailAddress, password)

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/users/`,
          user,
          {}
        )
      })
    })

    describe('When a user cannot be created', () => {
      it('emits a failure', (done) => {
        expect.assertions(2)
        axios.post.mockRejectedValue('Hark! An Error')
        storageService.createUser(user)
        storageService.on(failure.createUser, (error) => {
          expect(error).toEqual('Hark! An Error')
          done()
        })

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/users/`,
          user,
          {}
        )
      })
    })
  })

  describe('Update user', () => {
    describe('When a user can be updated', () => {
      it('emits a success', (done) => {
        expect.assertions(2)
        axios.put.mockReturnValue()
        storageService.updateUserEncryptedPrivateKey(
          'hello@unlock-protocol.com',
          user,
          'token'
        )

        storageService.on(success.updateUser, ({ emailAddress }) => {
          expect(emailAddress).toBe('hello@unlock-protocol.com')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/passwordEncryptedPrivateKey`,
          user,
          {
            headers: {
              Authorization: ' Bearer token',
            },
          }
        )
      })
    })

    describe('When a user cannot be updated', () => {
      it('emits a failure', (done) => {
        expect.assertions(3)
        axios.put.mockRejectedValue('Egads! An Error')
        storageService.updateUserEncryptedPrivateKey(
          'hello@unlock-protocol.com',
          user,
          'token'
        )

        storageService.on(failure.updateUser, ({ emailAddress, error }) => {
          expect(emailAddress).toBe('hello@unlock-protocol.com')
          expect(error).toEqual('Egads! An Error')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/passwordEncryptedPrivateKey`,
          user,
          {
            headers: {
              Authorization: ' Bearer token',
            },
          }
        )
      })
    })
  })

  describe('Retrieve a private key for a user', () => {
    describe('When a private key can be retrieved', () => {
      it('emits a success', (done) => {
        expect.assertions(3)
        axios.get.mockReturnValue({
          data: {
            passwordEncryptedPrivateKey: 'Private Key  reporting for duty',
          },
        })

        storageService.getUserPrivateKey('hello@unlock-protocol.com', null)

        storageService.on(
          success.getUserPrivateKey,
          ({ emailAddress, passwordEncryptedPrivateKey }) => {
            expect(emailAddress).toBe('hello@unlock-protocol.com')
            expect(passwordEncryptedPrivateKey).toBe(
              'Private Key  reporting for duty'
            )
            done()
          }
        )

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/privatekey`,
          null,
          {}
        )
      })
    })

    describe('When a private key cannot be retrieved', () => {
      it('emits a failure', (done) => {
        expect.assertions(3)
        axios.get.mockRejectedValue('Great Snakes! An Error')

        storageService.getUserPrivateKey('hello@unlock-protocol.com', null)

        storageService.on(
          failure.getUserPrivateKey,
          ({ emailAddress, error }) => {
            expect(emailAddress).toBe('hello@unlock-protocol.com')
            expect(error).toEqual('Great Snakes! An Error')
            done()
          }
        )

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/privatekey`,
          null,
          {}
        )
      })
    })
  })

  describe('ejecting user', () => {
    it('should send a request to eject a user', (done) => {
      expect.assertions(1)
      axios.post.mockReturnValue({})
      const data = {}
      const signature = 'signature'

      storageService.ejectUser(publicKey, data, signature)

      storageService.on(success.ejectUser, () => {
        done()
      })

      expect(axios.post).toHaveBeenCalledWith(
        `${serviceHost}/users/${publicKey}/eject`,
        data,
        {
          headers: {
            Authorization: ' Bearer c2lnbmF0dXJl', // base64 encode signature
          },
        }
      )
    })
  })

  describe('Retrieve a user recovery phrase', () => {
    describe('When a recovery phrase can be retrieved', () => {
      it('emits a success', (done) => {
        expect.assertions(3)
        axios.get.mockReturnValue({
          data: {
            recoveryPhrase: 'quick wafting zephyrs vex bold jim',
          },
        })

        storageService.getUserRecoveryPhrase('hello@unlock-protocol.com', null)

        storageService.on(
          success.getUserRecoveryPhrase,
          ({ emailAddress, recoveryPhrase }) => {
            expect(emailAddress).toBe('hello@unlock-protocol.com')
            expect(recoveryPhrase).toBe('quick wafting zephyrs vex bold jim')
            done()
          }
        )

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/recoveryphrase`,
          null,
          {}
        )
      })
    })

    describe('When a recovery phrase cannot be retrieved', () => {
      it('emits a failure', (done) => {
        expect.assertions(3)
        axios.get.mockRejectedValue('Zounds! An Error')

        storageService.getUserRecoveryPhrase('hello@unlock-protocol.com', null)

        storageService.on(
          failure.getUserRecoveryPhrase,
          ({ emailAddress, error }) => {
            expect(emailAddress).toBe('hello@unlock-protocol.com')
            expect(error).toEqual('Zounds! An Error')
            done()
          }
        )

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}/recoveryphrase`,
          null,
          {}
        )
      })
    })
  })
})
