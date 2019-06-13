import axios from 'axios'
import { StorageService, success, failure } from '../../services/storageService'
import UnlockUser from '../../structured_data/unlockUser'
import UnlockLock from '../../structured_data/unlockLock'

jest.mock('axios')

const emailAddress = 'stick@stick.ly'
const publicKey = '0x88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290'
const passwordEncryptedPrivateKey = {
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

const lockName = 'A Paywall Concerning Human Understanding'
const lockOwner = publicKey
const lockAddress = '0xA875DB01d7113741C2E2037e9E12eCe5bd8A7363'

const lock = UnlockLock.build({
  name: lockName,
  owner: lockOwner,
  address: lockAddress,
})

const user = UnlockUser.build({
  emailAddress,
  publicKey,
  passwordEncryptedPrivateKey,
})

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  let storageService

  beforeEach(() => {
    jest.clearAllMocks()
    storageService = new StorageService(serviceHost)
  })

  describe('lockLookUp', () => {
    describe('when the requested lock exists', () => {
      it('returns the details', done => {
        expect.assertions(3)
        axios.get.mockReturnValue({
          data: {
            name: 'hello',
          },
        })

        storageService.lockLookUp('0x42')

        storageService.on(success.lockLookUp, ({ address, name }) => {
          expect(address).toBe('0x42')
          expect(name).toBe('hello')
          done()
        })

        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x42`)
      })
    })

    describe('when the requested lock exists but does not have a name', () => {
      it('emits a failure', done => {
        expect.assertions(2)
        axios.get.mockReturnValue({
          data: {},
        })

        storageService.lockLookUp('0x42')

        storageService.on(failure.lockLookUp, error => {
          expect(error).toBe('No name for this lock.')
          done()
        })

        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x42`)
      })
    })

    describe('when the requested lock doesnt exist', () => {
      it('raises an appropriate error', done => {
        expect.assertions(2)
        axios.get.mockRejectedValue('An Error')
        storageService.lockLookUp('0x1234243')

        storageService.on(failure.lockLookUp, error => {
          expect(error).toEqual('An Error')
          done()
        })

        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x1234243`)
      })
    })
  })

  describe('updateLockDetails', () => {
    describe('when a lock can be updated', () => {
      it('returns a successful promise', done => {
        expect.assertions(2)
        axios.put.mockReturnValue()
        storageService.updateLockDetails(lockAddress, lock)

        storageService.on(success.updateLockDetails, address => {
          expect(address).toBe(lockAddress)
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/${lockAddress}`,
          lock,
          {}
        )
      })
    })

    describe('when a lock can not be updated', () => {
      it('returns an rejected Promise', done => {
        expect.assertions(3)
        axios.put.mockRejectedValue('An Error')

        storageService.updateLockDetails(lockAddress, lock)

        storageService.on(failure.updateLockDetails, ({ address, error }) => {
          expect(address).toBe(lockAddress)
          expect(error).toBe('An Error')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/${lockAddress}`,
          lock,
          {}
        )
      })
    })
  })

  describe('getTransactionsHashesSentBy', () => {
    it('should succeed with a list of hashes', done => {
      expect.assertions(3)
      const sender = '0xabc'
      axios.get.mockReturnValue({
        data: {
          transactions: [
            {
              transactionHash: '0x123',
              sender: '0xabc',
              recipient: '0xcde',
              chain: 1984,
            },
            {
              transactionHash: '0x456',
              sender: '0xabc',
              recipient: '0xfgh',
              chain: 1984,
            },
          ],
        },
      })

      storageService.getTransactionsHashesSentBy(sender)

      storageService.on(
        success.getTransactionHashesSentBy,
        ({ senderAddress, hashes }) => {
          expect(senderAddress).toBe(sender)
          expect(hashes).toEqual([
            {
              hash: '0x123',
              from: '0xabc',
              to: '0xcde',
              network: 1984,
            },
            {
              hash: '0x456',
              from: '0xabc',
              to: '0xfgh',
              network: 1984,
            },
          ])
          done()
        }
      )

      expect(axios.get).toHaveBeenCalledWith(
        `${serviceHost}/transactions?sender=${sender}`
      )
    })

    it('should fail with an error', done => {
      expect.assertions(1)

      axios.get.mockRejectedValue('I am error.')

      storageService.getTransactionsHashesSentBy('0xabc')

      storageService.on(failure.getTransactionHashesSentBy, err => {
        expect(err).toBe('I am error.')
        done()
      })
    })
  })

  describe('storeTransaction', () => {
    it('emits a success value', done => {
      expect.assertions(2)
      const transactionHash = ' 0xhash'
      const senderAddress = ' 0xsender'
      const recipientAddress = ' 0xrecipient'
      axios.post.mockReturnValue({})

      storageService.storeTransaction(
        transactionHash,
        senderAddress,
        recipientAddress
      )
      expect(axios.post).toHaveBeenCalledWith(`${serviceHost}/transaction`, {
        transactionHash,
        sender: senderAddress,
        recipient: recipientAddress,
      })
      storageService.on(success.storeTransaction, hash => {
        expect(hash).toBe(transactionHash)
        done()
      })
    })

    it('emits a failure value', done => {
      expect.assertions(2)
      const transactionHash = ' 0xhash'
      const senderAddress = ' 0xsender'
      const recipientAddress = ' 0xrecipient'
      axios.post.mockRejectedValue('I am error.')

      storageService.storeTransaction(
        transactionHash,
        senderAddress,
        recipientAddress
      )
      expect(axios.post).toHaveBeenCalledWith(`${serviceHost}/transaction`, {
        transactionHash,
        sender: senderAddress,
        recipient: recipientAddress,
      })
      storageService.on(failure.storeTransaction, err => {
        expect(err).toBe('I am error.')
        done()
      })
    })
  })

  describe('Create user', () => {
    describe('When a user can be created', () => {
      it('emits a success', done => {
        expect.assertions(2)
        axios.post.mockReturnValue({})

        storageService.on(success.createUser, returnedPublicKey => {
          expect(returnedPublicKey).toBe(publicKey)
          done()
        })
        storageService.createUser(user)

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/users/`,
          user,
          {}
        )
      })
    })

    describe('When a user cannot be created', () => {
      it('emits a failure', done => {
        expect.assertions(2)
        axios.post.mockRejectedValue('Hark! An Error')
        storageService.createUser(user)
        storageService.on(failure.createUser, error => {
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
      it('emits a success', done => {
        expect.assertions(2)
        axios.put.mockReturnValue()
        storageService.updateUserEncryptedPrivateKey(
          'hello@unlock-protocol.com',
          user,
          null
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
          {}
        )
      })
    })

    describe('When a user cannot be updated', () => {
      it('emits a failure', done => {
        expect.assertions(3)
        axios.put.mockRejectedValue('Egads! An Error')
        storageService.updateUserEncryptedPrivateKey(
          'hello@unlock-protocol.com',
          user,
          null
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
          {}
        )
      })
    })
  })

  describe('Retrieve a private key for a user', () => {
    describe('When a private key can be retrieved', () => {
      it('emits a success', done => {
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
      it('emits a failure', done => {
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

  describe('Retrieve a user recovery phrase', () => {
    describe('When a recovery phrase can be retrieved', () => {
      it('emits a success', done => {
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
      it('emits a failure', done => {
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
