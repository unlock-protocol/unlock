/* eslint no-console: 0 */

import Web3Utils from 'web3-utils'

import NockHelper from './helpers/nockHelper'

import Web3Service from '../web3Service'

import v0 from '../v0'
import v01 from '../v01'

const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

const nock = new NockHelper(readOnlyProvider, true /** debug */)

const unlockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

let web3Service

describe('Web3Service', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
  })

  describe('_getPastTransactionsForContract', () => {
    it("should getPastEvents on the contract and emit 'transaction.new' for each event", done => {
      expect.assertions(2)

      const contract = jest.mock()
      contract.getPastEvents = jest.fn((events, params, callback) => {
        callback(null, [
          {
            logIndex: '0x2',
            transactionIndex: '0x0',
            transactionHash:
              '0x8a7c22fe9bcb5ee44c06410c584139f96a2f5cff529866bbed615986100eb6bd',
            blockHash:
              '0xf42e7b871541fe9f4b705633a8d5fd5e36899054ea4db817ff533d5ab1015e99',
            blockNumber: '0xcc9',
            address: '0x3f313221a2af33fd8a430891291370632cb471bf',
            data: '0x00',
            topics: [
              '0x01017ed19df0c7f8acc436147b234b09664a9fb4797b4fa3fb9e599c2eb67be7',
              '0x000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
              '0x000000000000000000000000dc069c4d26510749bea2057c4db43ba8efe4d23a',
            ],
            type: 'mined',
          },
        ])
      })

      const events = 'allEvents'

      const filter = {}

      web3Service.once('transaction.new', transactionHash => {
        expect(transactionHash).toEqual(
          '0x8a7c22fe9bcb5ee44c06410c584139f96a2f5cff529866bbed615986100eb6bd'
        )
        expect(contract.getPastEvents).toHaveBeenCalledWith(
          events,
          expect.objectContaining({
            filter: {},
            fromBlock: 0,
            toBlock: 'latest',
          }),
          expect.any(Function)
        )
        done()
      })

      web3Service._getPastTransactionsForContract(contract, events, filter)
    })
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      const balance = '0xdeadbeef'
      const inWei = Web3Utils.hexToNumberString(balance)
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      let addressBalance = await web3Service.getAddressBalance(address)
      expect(addressBalance).toEqual(Web3Utils.fromWei(inWei, 'ether'))
    })
  })

  describe('emitContractEvent', () => {
    it('should handle NewLock and emit lock.updated as well as getLock', () => {
      expect.assertions(5)
      const transactionHash = '0x123'
      const contractAddress = '0x456'
      const blockNumber = 1337
      const params = {
        newLockAddress: ' 0x789',
      }
      web3Service.getLock = jest.fn()

      web3Service.once('lock.updated', (address, lock) => {
        expect(lock.transaction).toBe(transactionHash)
        expect(lock.address).toBe(params.newLockAddress)
        expect(lock.asOf).toBe(blockNumber)
        expect(address).toBe(params.newLockAddress)
      })
      web3Service.emitContractEvent(
        transactionHash,
        contractAddress,
        blockNumber,
        'NewLock',
        params
      )
      expect(web3Service.getLock).toHaveBeenCalledWith(params.newLockAddress)
    })

    it('should handle NewLock and emit transaction.updated with the new lock address', () => {
      expect.assertions(1)
      const transactionHash = '0x123'
      const contractAddress = '0x456'
      const blockNumber = 1337
      const params = {
        newLockAddress: ' 0x789',
      }
      web3Service.getLock = jest.fn()

      web3Service.once('transaction.updated', (hash, update) => {
        expect(update.lock).toBe(params.newLockAddress)
      })
      web3Service.emitContractEvent(
        transactionHash,
        contractAddress,
        blockNumber,
        'NewLock',
        params
      )
    })

    it('should handle Transfer and emit key.save', done => {
      expect.assertions(3)
      const transactionHash = '0x123'
      const contractAddress = '0x456'
      const blockNumber = 1337

      const params = {
        _to: '0x789',
      }

      web3Service.once('key.saved', (keyId, key) => {
        expect(keyId).toBe('0x456-0x789')
        expect(key.owner).toBe(params._to)
        expect(key.lock).toBe(contractAddress)
        done()
      })

      web3Service.emitContractEvent(
        transactionHash,
        contractAddress,
        blockNumber,
        'Transfer',
        params
      )
    })

    it('should handle Transfer and also emit transaction.updated', done => {
      expect.assertions(2)
      const transactionHash = '0x123'
      const contractAddress = '0x456'
      const blockNumber = 1337

      const params = {
        _to: '0x789',
      }

      web3Service.once('transaction.updated', (transactionHash, update) => {
        expect(update.lock).toBe(contractAddress)
        expect(update.key).toBe('0x456-0x789')
        done()
      })

      web3Service.emitContractEvent(
        transactionHash,
        contractAddress,
        blockNumber,
        'Transfer',
        params
      )
    })

    it('should handle PriceChanged and emit key.save', done => {
      expect.assertions(3)
      const transactionHash = '0x123'
      const contractAddress = '0x456'
      const blockNumber = 1337

      const params = {
        keyPrice: '10',
      }

      web3Service.once('lock.updated', (lockAddress, { keyPrice, asOf }) => {
        expect(lockAddress).toBe(contractAddress)
        expect(keyPrice).toBe('0.00000000000000001') // in eth...
        expect(asOf).toBe(blockNumber) // in eth...
        done()
      })

      web3Service.emitContractEvent(
        transactionHash,
        contractAddress,
        blockNumber,
        'PriceChanged',
        params
      )
    })
  })

  describe('_watchTransaction', () => {
    it('should set a timeout based on half the block time', () => {
      expect.assertions(1)
      jest.useFakeTimers()
      web3Service.getTransaction = jest.fn()
      web3Service._watchTransaction('0x')
      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        blockTime / 2
      )
    })

    it('should trigger getTransaction when the timeout expires', () => {
      expect.assertions(1)
      jest.useFakeTimers()
      web3Service.getTransaction = jest.fn()
      const transactionHash = '0x'
      web3Service._watchTransaction(transactionHash)
      jest.runAllTimers()
      expect(web3Service.getTransaction).toHaveBeenCalledWith(transactionHash)
    })
  })

  describe('inputsHandlers', () => {
    describe('createLock', () => {
      it('should emit lock.updated with correctly typed values', async done => {
        expect.assertions(2)
        const params = {
          _expirationDuration: '7',
          _maxNumberOfKeys: '5',
          _keyPrice: '5',
        }
        web3Service.generateLockAddress = jest.fn()
        web3Service.on('lock.updated', (newLockAddress, update) => {
          expect(update.expirationDuration).toBe(7)
          expect(update.maxNumberOfKeys).toBe(5)
          done()
        })

        await web3Service.inputsHandlers.createLock('0x123', '0x456', params)
      })
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = [
      '_getKeyByLockForOwner',
      'getKeyByLockForOwner',
      'getKeysForLockOnPage',
      'getLock',
      'getPastLockCreationsTransactionsForUser',
      'getPastLockTransactions',
    ]

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [method]: function(_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    const versionSpecificUnlockMethods = [
      '_getPendingTransaction',
      '_getSubmittedTransaction',
      'getTransaction',
      'getTransactionType',
      'parseTransactionFromInput',
    ]

    it.each(versionSpecificUnlockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [method]: function(_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.unlockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    const supportedVersions = [v0, v01]
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificLockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
        versionSpecificUnlockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
