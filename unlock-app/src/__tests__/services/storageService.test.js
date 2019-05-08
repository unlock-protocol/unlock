import axios from 'axios'
import { StorageService, success, failure } from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)

  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('storeLockDetails', () => {
    describe('when storing a new lock', () => {
      it('emits a success', done => {
        expect.assertions(2)
        axios.post.mockReturnValue()
        storageService.storeLockDetails({
          name: 'lock_name',
          address: 'lock_address',
        })

        storageService.on(success.storeLockDetails, address => {
          expect(address).toBe('lock_address')
          done()
        })

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/lock`,
          {
            name: 'lock_name',
            address: 'lock_address',
          },
          {}
        )
      })
    })

    describe('when attempting to store an existing lock', () => {
      it('emits a failure', done => {
        expect.assertions(3)
        axios.post.mockRejectedValue('An Error')

        storageService.storeLockDetails({
          name: 'lock_name',
          address: 'existing_address',
        })

        storageService.on(failure.storeLockDetails, ({ address, error }) => {
          expect(address).toBe('existing_address')
          expect(error).toBe('An Error')
          done()
        })

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/lock`,
          {
            name: 'lock_name',
            address: 'existing_address',
          },
          {}
        )
      })
    })
  })

  describe('updateLockDetails', () => {
    describe('when a lock can be updated', () => {
      it('returns a successful promise', done => {
        expect.assertions(2)
        axios.put.mockReturnValue()
        storageService.updateLockDetails('lock_address', {
          name: 'new_lock_name',
          address: 'lock_address',
        })

        storageService.on(success.updateLockDetails, address => {
          expect(address).toBe('lock_address')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          {
            name: 'new_lock_name',
            address: 'lock_address',
          },
          {}
        )
      })
    })

    describe('when a lock can not be updated', () => {
      it('returns an rejected Promise', done => {
        expect.assertions(3)
        axios.put.mockRejectedValue('An Error')

        storageService.updateLockDetails('lock_address')

        storageService.on(failure.updateLockDetails, ({ address, error }) => {
          expect(address).toBe('lock_address')
          expect(error).toBe('An Error')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          undefined,
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
        const user = {
          emailAddress: 'hello@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }
        axios.post.mockReturnValue({})
        storageService.createUser(user)

        storageService.on(success.createUser, emailAddress => {
          expect(emailAddress).toBe(user.emailAddress)
          done()
        })

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
        const user = {
          emailAddress: 'hello@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }
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
        const user = {
          emailAddress: 'goodbye@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }

        storageService.updateUser('hello@unlock-protocol.com', user, null)

        storageService.on(success.updateUser, lastEmail => {
          expect(lastEmail).toBe('hello@unlock-protocol.com')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}`,
          user,
          {}
        )
      })
    })

    describe('When a user cannot be updated', () => {
      it('emits a failure', done => {
        expect.assertions(3)
        axios.put.mockRejectedValue('Egads! An Error')
        const user = {
          emailAddress: 'goodbye@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }

        storageService.updateUser('hello@unlock-protocol.com', user, null)

        storageService.on(failure.updateUser, ({ emailAddress, error }) => {
          expect(emailAddress).toBe('hello@unlock-protocol.com')
          expect(error).toEqual('Egads! An Error')
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'hello@unlock-protocol.com'
          )}`,
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
