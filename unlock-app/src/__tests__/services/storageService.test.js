import axios from 'axios'
import StorageService, { success, failure } from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('lockLookUp', () => {
    describe('when the requested lock exists', () => {
      it('returns the details', async () => {
        expect.assertions(2)
        axios.get.mockReturnValue({
          data: {
            name: 'hello',
          },
        })
        const result = await storageService.lockLookUp('0x42')
        expect(result).toEqual('hello')
        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x42`)
      })
    })

    describe('when the requested lock doesnt exist', () => {
      it('raises an appropriate error', async () => {
        expect.assertions(2)
        axios.get.mockRejectedValue('An Error')
        try {
          await storageService.lockLookUp('0x1234243')
        } catch (error) {
          expect(error).toEqual('An Error')
        }
        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x1234243`)
      })
    })
  })

  describe('storeLockDetails', () => {
    describe('when storing a new lock', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.post.mockReturnValue()
        await storageService.storeLockDetails({
          name: 'lock_name',
          address: 'lock_address',
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
      it('returns a failure promise', async () => {
        expect.assertions(2)
        axios.post.mockRejectedValue('An Error')
        try {
          await storageService.storeLockDetails({
            name: 'lock_name',
            address: 'existing_address',
          })
        } catch (error) {
          expect(error).toEqual('An Error')
        }

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
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.put.mockReturnValue()
        await storageService.updateLockDetails('lock_address', {
          name: 'new_lock_name',
          address: 'lock_address',
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
      it('returns an rejected Promise', async () => {
        expect.assertions(2)
        axios.put.mockRejectedValue('An Error')

        try {
          await storageService.updateLockDetails('lock_address')
        } catch (error) {
          expect(error).toEqual('An Error')
        }

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          undefined,
          {}
        )
      })
    })
  })

  describe('getTransactionsHashesSentBy', () => {
    it('should expect a list of transactions', async () => {
      expect.assertions(2)
      const sender = '0x123'
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
      const transactions = await storageService.getTransactionsHashesSentBy(
        sender
      )
      expect(transactions).toEqual([
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
      expect(axios.get).toHaveBeenCalledWith(
        `${serviceHost}/transactions?sender=${sender}`
      )
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
      it('returns a successful promise', async () => {
        expect.assertions(1)
        const user = {
          emailAddress: 'hello@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }
        axios.post.mockReturnValue({})
        await storageService.createUser(user)

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/users/`,
          user,
          {}
        )
      })
    })

    describe('When a user cannot be created', () => {
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        const user = {
          emailAddress: 'hello@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }
        axios.post.mockRejectedValue('Hark! An Error')
        try {
          await storageService.createUser(user)
        } catch (error) {
          expect(error).toEqual('Hark! An Error')
        }

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
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.put.mockReturnValue()
        const user = {
          emailAddress: 'goodbye@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }

        await storageService.updateUser('hello@unlock-protocol.com', user, null)

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
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        axios.put.mockRejectedValue('Egads! An Error')
        const user = {
          emailAddress: 'goodbye@unlock-protocol.com',
          publicKey: 'foo',
          privateKey: 'bar',
        }

        try {
          await storageService.updateUser(
            'hello@unlock-protocol.com',
            user,
            null
          )
        } catch (error) {
          expect(error).toEqual('Egads! An Error')
        }

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
      it('returns a successful promise', async () => {
        expect.assertions(2)
        axios.get.mockReturnValue({
          data: {
            passwordEncryptedPrivateKey: 'Private Key  reporting for duty',
          },
        })

        const key = await storageService.getUserPrivateKey(
          'hello@unlock-protocol.com',
          null
        )

        expect(key).toBe('Private Key  reporting for duty')

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
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        axios.get.mockRejectedValue('Great Snakes! An Error')

        try {
          await storageService.getUserPrivateKey(
            'hello@unlock-protocol.com',
            null
          )
        } catch (error) {
          expect(error).toEqual('Great Snakes! An Error')
        }

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
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.get.mockReturnValue({})

        await storageService.getUserRecoveryPhrase(
          'hello@unlock-protocol.com',
          null
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
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        axios.get.mockRejectedValue('Zounds! An Error')

        try {
          await storageService.getUserRecoveryPhrase(
            'hello@unlock-protocol.com',
            null
          )
        } catch (error) {
          expect(error).toEqual('Zounds! An Error')
        }

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
