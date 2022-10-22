import axios from 'axios'
import { StorageService, success, failure } from '../../services/storageService'
import UnlockUser from '../../structured_data/unlockUser'

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

const user = UnlockUser.build({
  emailAddress,
  publicKey,
  passwordEncryptedPrivateKey,
})

describe.skip('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  let storageService

  beforeEach(() => {
    jest.clearAllMocks()
    storageService = new StorageService(serviceHost)
  })

  describe('getRecentTransactionsHashesSentBy', () => {
    it('should succeed with a list of hashes', (done) => {
      expect.assertions(3)
      const sender = '0xabc'
      axios.get.mockReturnValue({
        data: {
          transactions: [
            {
              transactionHash: '0x123',
              sender: '0xabc',
              recipient: '0xcde',
              chain: 1337,
            },
            {
              transactionHash: '0x456',
              sender: '0xabc',
              recipient: '0xfgh',
              chain: 1337,
            },
          ],
        },
      })

      storageService.getRecentTransactionsHashesSentBy(sender)

      storageService.on(
        success.getTransactionHashesSentBy,
        ({ senderAddress, hashes }) => {
          expect(senderAddress).toBe(sender)
          expect(hashes).toEqual([
            {
              hash: '0x123',
              from: '0xabc',
              to: '0xcde',
              network: 1337,
            },
            {
              hash: '0x456',
              from: '0xabc',
              to: '0xfgh',
              network: 1337,
            },
          ])
          done()
        }
      )

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(
          `${serviceHost}/transactions\\?sender=${sender}&createdAfter=[0-9]*`
        )
      )
    })

    it('should fail with an error', (done) => {
      expect.assertions(1)

      axios.get.mockRejectedValue('I am error.')

      storageService.getRecentTransactionsHashesSentBy('0xabc')

      storageService.on(failure.getTransactionHashesSentBy, (err) => {
        expect(err).toBe('I am error.')
        done()
      })
    })

    it('should return a promise of hashes', async () => {
      expect.assertions(2)
      const sender = '0xabc'
      axios.get.mockReturnValue({
        data: {
          transactions: [
            {
              transactionHash: '0x123',
              sender: '0xabc',
              recipient: '0xcde',
              chain: 1337,
            },
            {
              transactionHash: '0x456',
              sender: '0xabc',
              recipient: '0xfgh',
              chain: 1337,
            },
          ],
        },
      })

      const { hashes, senderAddress } =
        await storageService.getRecentTransactionsHashesSentBy(sender)
      expect(senderAddress).toEqual(sender)
      expect(hashes).toEqual([
        {
          hash: '0x123',
          from: '0xabc',
          to: '0xcde',
          network: 1337,
        },
        {
          hash: '0x456',
          from: '0xabc',
          to: '0xfgh',
          network: 1337,
        },
      ])
    })
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

  describe('Add payment method', () => {
    describe('When a payment method is successfully added', () => {
      it('emits a success', (done) => {
        expect.assertions(2)
        axios.put.mockReturnValue()
        storageService.addPaymentMethod(
          'geoff@bitconnect.gov',
          'signed token data',
          null
        )

        storageService.on(success.addPaymentMethod, () => {
          expect(true).toBeTruthy()
          done()
        })

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(
            'geoff@bitconnect.gov'
          )}/paymentdetails`,
          'signed token data',
          {}
        )
      })
    })

    describe('when a payment method cannot be successfully added', () => {
      it('emits a failure', (done) => {
        expect.assertions(1)
        axios.put.mockRejectedValue()
        storageService.addPaymentMethod(
          'geoff@bitconnect.gov',
          'signed token data',
          null
        )
        storageService.on(failure.addPaymentMethod, () => {
          expect(true).toBeTruthy()
          done()
        })
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

  describe('Retrieve user payment details', () => {
    describe('When a request succeeds with at least one card', () => {
      it('emits a success', (done) => {
        expect.assertions(2)
        const emailAddress = 'geoff@bitconnect.gov'
        axios.get.mockReturnValue({ data: [{ id: 'a card object' }] })

        storageService.getCards(emailAddress)

        storageService.on(success.getCards, (cards) => {
          expect(cards[0].id).toEqual('a card object')
          done()
        })

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(emailAddress)}/cards`
        )
      })
    })

    describe('When a request succeeds without a card', () => {
      it('emits a success', (done) => {
        expect.assertions(2)
        const emailAddress = 'geoff@bitconnect.gov'
        axios.get.mockReturnValue({ data: [] })

        storageService.getCards(emailAddress)

        storageService.on(success.getCards, (cards) => {
          expect(cards).toHaveLength(0)
          done()
        })

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/users/${encodeURIComponent(emailAddress)}/cards`
        )
      })
    })

    describe('When a request fails', () => {
      it('emits a failure', (done) => {
        expect.assertions(1)
        const emailAddress = 'geoff@bitconnect.gov'
        axios.get.mockRejectedValue('Could not fulfill request due to sunspots')

        storageService.getCards(emailAddress)

        storageService.on(failure.getCards, ({ error }) => {
          expect(error).toEqual('Could not fulfill request due to sunspots')
          done()
        })
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

  describe('Purchase key', () => {
    describe('When a key purchase succeeds', () => {
      it('emits a success', (done) => {
        expect.assertions(2)
        const data = {
          message: {
            purchaseRequest: {
              lock: '0x321cba',
            },
          },
        }
        axios.post.mockReturnValue()

        storageService.on(success.keyPurchase, () => {
          expect(true).toBeTruthy()
          done()
        })

        storageService.purchaseKey(data, {})

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/purchase`,
          data,
          expect.objectContaining({
            headers: expect.any(Object),
          })
        )
      })
    })

    describe('when a key purchase fails', () => {
      it('emits a failure', (done) => {
        expect.assertions(1)
        axios.post.mockRejectedValue()
        storageService.on(failure.keyPurchase, () => {
          expect(true).toBeTruthy()
          done()
        })

        storageService.purchaseKey({}, {})
      })
    })
  })

  describe('getLockAddressesForUser', () => {
    it('should retrieve the list of locks for a user and emit emit success.getLockAddressesForUser', (done) => {
      expect.assertions(2)
      const user = '0xabc'
      const locks = [
        {
          name: 'The named lock',
          address: '0xAB4723090f6ea6bE32A1aDF4933EC901d315Ff0b',
          owner: '0x3CA206264762Caf81a8F0A843bbB850987B41e16',
          createdAt: '2019-02-06T23:16:16.505Z',
          updatedAt: '2019-02-06T23:16:16.505Z',
        },
        {
          name: 'A lock with a name',
          address: '0xFa8b435a51E074Dd5FBCa54679d32c960C3CBDFb',
          owner: '0x3CA206264762Caf81a8F0A843bbB850987B41e16',
          createdAt: '2019-03-05T01:23:13.545Z',
          updatedAt: '2019-03-05T01:23:13.545Z',
        },
      ]
      axios.get.mockReturnValue({
        data: {
          locks,
        },
      })

      storageService.on(success.getLockAddressesForUser, (addresses) => {
        expect(addresses).toEqual(locks.map((lock) => lock.address))
        done()
      })

      storageService.getLockAddressesForUser(user)

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })

    it('should emit failure.getLockAddressesForUser if the data does not have the expected format', (done) => {
      expect.assertions(2)
      const user = '0xabc'
      axios.get.mockReturnValue({
        data: {},
      })

      storageService.getLockAddressesForUser(user)

      storageService.on(failure.getLockAddressesForUser, (error) => {
        expect(error).toBe('We could not retrieve lock addresses for that user')
        done()
      })

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })

    it('should emit failure.getLockAddressesForUser if there was an error', (done) => {
      expect.assertions(2)
      const user = '0xabc'
      const httpError = 'An Error'
      axios.get.mockRejectedValue(httpError)

      storageService.getLockAddressesForUser(user)

      storageService.on(failure.getLockAddressesForUser, (error) => {
        expect(error).toBe(httpError)
        done()
      })

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })
  })

  describe('getBulkMetadataFor', () => {
    it('should emit success on success', (done) => {
      expect.assertions(2)

      const lockAddress = 'address'
      const typedData = {
        data: 'typed',
      }
      const userMetadata = []
      axios.get.mockReturnValue({
        data: userMetadata,
      })

      storageService.on(
        success.getBulkMetadataFor,
        (returnedLockAddress, result) => {
          expect(result).toEqual(userMetadata)

          done()
        }
      )

      storageService.getBulkMetadataFor(lockAddress, 'a signature', typedData)
      expect(axios.get).toHaveBeenCalledWith(
        `${serviceHost}/api/key/${lockAddress}/keyHolderMetadata`,
        {
          headers: {
            Authorization: ' Bearer a signature',
          },
          params: {
            data: JSON.stringify(typedData),
            signature: 'a signature',
          },
        }
      )
    })

    it('should emit failure on failure', (done) => {
      expect.assertions(1)

      const lockAddress = 'address'
      const typedData = 'stringified-typed-data'

      axios.get.mockRejectedValue('welp')

      storageService.on(failure.getBulkMetadataFor, (error) => {
        expect(error).toBe('welp')
        done()
      })

      storageService.getBulkMetadataFor(lockAddress, 'a signature', typedData)
    })
  })
})
