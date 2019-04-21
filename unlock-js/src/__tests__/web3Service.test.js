/* eslint no-console: 0 */

import Web3Utils from 'web3-utils'

import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'
import * as UnlockV02 from 'unlock-abi-0-2'
import NockHelper from './helpers/nockHelper'

import Web3Service from '../web3Service'
import TransactionTypes from '../transactionTypes'
import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'
import { KEY_ID } from '../constants'

const supportedVersions = [v0, v01, v02]

const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e'

const transaction = {
  status: 'mined',
  createdAt: new Date().getTime(),
  hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
}
const nock = new NockHelper(readOnlyProvider, false /** debug */)
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

      it('createLock', async () => {
        expect.assertions(4)
        let resolveLockUpdater
        let resolveTransactionUpdater
        const fakeLockAddress = '0x123'
        const fakeParams = {
          _keyPrice: '100000000000000000',
          _expirationDuration: '123',
          _maxNumberOfKeys: '-1',
        }
        const fakeHash = '0x12345'

        const lockUpdater = new Promise(resolve => {
          resolveLockUpdater = resolve
        })
        const transactionUpdater = new Promise(resolve => {
          resolveTransactionUpdater = resolve
        })
        web3Service.generateLockAddress = () => Promise.resolve(fakeLockAddress)

        web3Service.once('lock.updated', (lockAddress, params) => {
          expect(lockAddress).toBe(fakeLockAddress)
          expect(params).toEqual({
            transaction: fakeHash,
            address: fakeLockAddress,
            expirationDuration: 123,
            keyPrice: '0.1',
            maxNumberOfKeys: -1,
            outstandingKeys: 0,
            balance: '0',
          })
          resolveLockUpdater()
        })

        web3Service.once('transaction.updated', (transactionHash, params) => {
          expect(transactionHash).toBe(fakeHash)
          expect(params).toEqual({
            lock: fakeLockAddress,
          })
          resolveTransactionUpdater()
        })

        web3Service.inputsHandlers.createLock(
          fakeHash,
          web3Service.unlockContractAddress,
          fakeParams
        )
        await Promise.all([lockUpdater, transactionUpdater])
      })
    })

    it('purchaseFor', async () => {
      expect.assertions(4)
      let resolveKeySaver
      let resolveTransactionUpdater
      const owner = '0x9876'
      const fakeParams = {
        _recipient: owner,
      }
      const fakeContractAddress = '0xabc'
      const fakeHash = '0x12345'

      const keySaver = new Promise(resolve => {
        resolveKeySaver = resolve
      })
      const transactionUpdater = new Promise(resolve => {
        resolveTransactionUpdater = resolve
      })

      web3Service.once('transaction.updated', (transactionHash, params) => {
        expect(transactionHash).toBe(fakeHash)
        expect(params).toEqual({
          key: KEY_ID(fakeContractAddress, owner),
          lock: fakeContractAddress,
        })
        resolveTransactionUpdater()
      })

      web3Service.once('key.saved', (id, params) => {
        expect(id).toBe(KEY_ID(fakeContractAddress, owner))
        expect(params).toEqual({
          owner,
          lock: fakeContractAddress,
        })
        resolveKeySaver()
      })

      web3Service.inputsHandlers.purchaseFor(
        fakeHash,
        fakeContractAddress,
        fakeParams
      )
      await Promise.all([keySaver, transactionUpdater])
    })
  })

  describe('_getTransactionType', () => {
    it('should compute the method signature to compare it with the inputs', () => {
      expect.assertions(1)
      const data =
        '0xf6e4641f00000000000000000000000033ab07df7f09e793ddd1e9a25b079989a557119a'
      const Contract = {
        contractName: 'PublicLock',
        abi: [
          {
            constant: false,
            inputs: [{ name: '_recipient', type: 'address' }],
            name: 'purchaseFor',
            outputs: [],
            payable: true,
            stateMutability: 'payable',
            type: 'function',
          },
        ],
      }
      expect(web3Service._getTransactionType(Contract, data)).toBe(
        'KEY_PURCHASE'
      )
    })

    describe('v0', () => {
      it('should return null if there is no matching method', () => {
        expect.assertions(1)
        const data = 'notarealmethod'
        expect(web3Service._getTransactionType(UnlockV0.Unlock, data)).toBe(
          null
        )
      })

      it('should return the right transaction type on lock creation', () => {
        expect.assertions(1)
        const unlock = new web3Service.web3.eth.Contract(
          UnlockV0.Unlock.abi,
          ''
        )
        const data = unlock.methods
          .createLock('1000', '1000000000', '1')
          .encodeABI()
        expect(web3Service._getTransactionType(UnlockV0.Unlock, data)).toBe(
          TransactionTypes.LOCK_CREATION
        )
      })

      it('should return the right transaction type on key purchase', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV0.PublicLock.abi,
          ''
        )
        const data = lock.methods
          .purchaseFor(account, Web3Utils.utf8ToHex(''))
          .encodeABI()
        expect(web3Service._getTransactionType(UnlockV0.PublicLock, data)).toBe(
          TransactionTypes.KEY_PURCHASE
        )
      })

      it('should return the right transaction type on withdrawals', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV0.PublicLock.abi,
          ''
        )
        const data = lock.methods.withdraw().encodeABI()
        expect(web3Service._getTransactionType(UnlockV0.PublicLock, data)).toBe(
          TransactionTypes.WITHDRAWAL
        )
      })
    })

    describe('v01', () => {
      it('should return null if there is no matching method', () => {
        expect.assertions(1)
        const data = 'notarealmethod'
        expect(web3Service._getTransactionType(UnlockV01.Unlock, data)).toBe(
          null
        )
      })

      it('should return the right transaction type on lock creation', () => {
        expect.assertions(1)
        const unlock = new web3Service.web3.eth.Contract(
          UnlockV01.Unlock.abi,
          ''
        )
        const currencyAddress = Web3Utils.padLeft(0, 40) // Token address (ERC20 support). null is for Eth
        const data = unlock.methods
          .createLock('1000', currencyAddress, '1000000000', '1')
          .encodeABI()
        expect(web3Service._getTransactionType(UnlockV01.Unlock, data)).toBe(
          TransactionTypes.LOCK_CREATION
        )
      })

      it('should return the right transaction type on key purchase', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          ''
        )
        const data = lock.methods.purchaseFor(account).encodeABI()
        expect(
          web3Service._getTransactionType(UnlockV01.PublicLock, data)
        ).toBe(TransactionTypes.KEY_PURCHASE)
      })

      it('should return the right transaction type on withdrawals', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          ''
        )
        const data = lock.methods.withdraw().encodeABI()
        expect(
          web3Service._getTransactionType(UnlockV01.PublicLock, data)
        ).toBe(TransactionTypes.WITHDRAWAL)
      })
    })

    describe('v02', () => {
      it('should return null if there is no matching method', () => {
        expect.assertions(1)
        const data = 'notarealmethod'
        expect(web3Service._getTransactionType(UnlockV02.Unlock, data)).toBe(
          null
        )
      })

      it('should return the right transaction type on lock creation', () => {
        expect.assertions(1)
        const unlock = new web3Service.web3.eth.Contract(
          UnlockV02.Unlock.abi,
          ''
        )
        const currencyAddress = Web3Utils.padLeft(0, 40) // Token address (ERC20 support). null is for Eth
        const data = unlock.methods
          .createLock('1000', currencyAddress, '1000000000', '1')
          .encodeABI()
        expect(web3Service._getTransactionType(UnlockV02.Unlock, data)).toBe(
          TransactionTypes.LOCK_CREATION
        )
      })

      it('should return the right transaction type on key purchase', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV02.PublicLock.abi,
          ''
        )
        const data = lock.methods.purchaseFor(account).encodeABI()
        expect(
          web3Service._getTransactionType(UnlockV02.PublicLock, data)
        ).toBe(TransactionTypes.KEY_PURCHASE)
      })

      it('should return the right transaction type on withdrawals', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(
          UnlockV02.PublicLock.abi,
          ''
        )
        const data = lock.methods.withdraw().encodeABI()
        expect(
          web3Service._getTransactionType(UnlockV02.PublicLock, data)
        ).toBe(TransactionTypes.WITHDRAWAL)
      })
    })
  })

  describe('getPastLockCreationsTransactionsForUser', () => {
    describe('v0', () => {
      it('should getPastEvents for the Unlock contract', async () => {
        expect.assertions(4)
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return v0
        })
        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV0.Unlock.abi)
            expect(address).toEqual(web3Service.unlockContractAddress)
          }
        }
        web3Service.web3.eth.Contract = MockContract

        const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockCreationsTransactionsForUser(userAddress)
        expect(web3Service.unlockContractAbiVersion).toHaveBeenCalled()

        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'NewLock', {
          lockOwner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        })
      })
    })

    describe('v01', () => {
      it('should getPastEvents for the Unlock contract', async () => {
        expect.assertions(4)
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return v01
        })

        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV01.Unlock.abi)
            expect(address).toEqual(web3Service.unlockContractAddress)
          }
        }
        web3Service.web3.eth.Contract = MockContract

        const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockCreationsTransactionsForUser(userAddress)
        expect(web3Service.unlockContractAbiVersion).toHaveBeenCalled()

        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'NewLock', {
          lockOwner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        })
      })
    })

    describe('v02', () => {
      it('should getPastEvents for the Unlock contract', async () => {
        expect.assertions(4)
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return v02
        })

        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV02.Unlock.abi)
            expect(address).toEqual(web3Service.unlockContractAddress)
          }
        }
        web3Service.web3.eth.Contract = MockContract

        const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockCreationsTransactionsForUser(userAddress)
        expect(web3Service.unlockContractAbiVersion).toHaveBeenCalled()

        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'NewLock', {
          lockOwner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        })
      })
    })
  })

  describe('getPastLockTransactions', () => {
    describe('v0', () => {
      it('should getPastEvents for the Lock contract', async () => {
        expect.assertions(4)
        const lockAddress = '0x123'

        web3Service.lockContractAbiVersion = jest.fn(() => {
          return v0
        })

        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV0.PublicLock.abi)
            expect(address).toEqual(lockAddress)
          }
        }

        web3Service.web3.eth.Contract = MockContract

        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockTransactions(lockAddress)
        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'allevents')
        expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
          lockAddress
        )
      })
    })

    describe('v01', () => {
      it('should getPastEvents for the Lock contract', async () => {
        expect.assertions(4)
        const lockAddress = '0x123'

        web3Service.lockContractAbiVersion = jest.fn(() => {
          return v01
        })

        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV01.PublicLock.abi)
            expect(address).toEqual(lockAddress)
          }
        }

        web3Service.web3.eth.Contract = MockContract

        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockTransactions(lockAddress)
        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'allevents')
        expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
          lockAddress
        )
      })
    })

    describe('v02', () => {
      it('should getPastEvents for the Lock contract', async () => {
        expect.assertions(4)
        const lockAddress = '0x123'

        web3Service.lockContractAbiVersion = jest.fn(() => {
          return v02
        })

        class MockContract {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV02.PublicLock.abi)
            expect(address).toEqual(lockAddress)
          }
        }

        web3Service.web3.eth.Contract = MockContract

        web3Service._getPastTransactionsForContract = jest.fn()

        await web3Service.getPastLockTransactions(lockAddress)
        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(expect.any(MockContract), 'allevents')
        expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
          lockAddress
        )
      })
    })
  })

  describe('_parseTransactionFromInput', () => {
    beforeEach(() => {
      web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
    })

    describe('v0', () => {
      it('should emit transaction.updated with the transaction marked as pending', done => {
        expect.assertions(2)
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toEqual(transaction.hash)
          expect(update).toEqual({
            status: 'pending',
            type: 'TRANSACTION_TYPE',
            confirmations: 0,
            blockNumber: Number.MAX_SAFE_INTEGER,
          })
          done()
        })
        web3Service._parseTransactionFromInput(
          v0,
          transaction.hash,
          UnlockV0.Unlock,
          input,
          web3Service.unlockContractAddress
        )
      })

      it('should call the handler if the transaction input can be parsed', done => {
        expect.assertions(4)
        const input =
          '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

        // Fake method
        const method = {
          signature: '0x2bc888bf',
          name: 'myMethod',
        }

        // Fake abi
        const FakeContract = {
          abi: [method],
        }

        // fake params
        const params = {}
        // keeping track of it so we can clean it up (web3 has a singleton class down below)
        const decodeParams = web3Service.web3.eth.abi.decodeParameters
        web3Service.web3.eth.abi.decodeParameters = jest.fn(() => {
          return params
        })

        // Creating a fake handler
        web3Service.inputsHandlers[method.name] = (
          transactionHash,
          contractAddress,
          args
        ) => {
          expect(
            web3Service.web3.eth.abi.decodeParameters
          ).toHaveBeenCalledWith(method.inputs, input)
          expect(transactionHash).toEqual(transaction.hash)
          expect(contractAddress).toEqual(web3Service.unlockContractAddress)
          expect(args).toEqual(params)
          // Clean up!
          web3Service.web3.eth.abi.decodeParameters = decodeParams
          done()
        }

        web3Service._parseTransactionFromInput(
          v0,
          transaction.hash,
          FakeContract,
          `${method.signature}${input}`,
          web3Service.unlockContractAddress
        )
      })
    })

    describe('v01', () => {
      it('should emit transaction.updated with the transaction marked as pending', done => {
        expect.assertions(2)
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toEqual(transaction.hash)
          expect(update).toEqual({
            status: 'pending',
            type: 'TRANSACTION_TYPE',
            confirmations: 0,
            blockNumber: Number.MAX_SAFE_INTEGER,
          })
          done()
        })
        web3Service._parseTransactionFromInput(
          v01,
          transaction.hash,
          UnlockV01.Unlock,
          input,
          web3Service.unlockContractAddress
        )
      })

      it('should call the handler if the transaction input can be parsed', done => {
        expect.assertions(4)
        const input =
          '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

        // Fake method
        const method = {
          signature: '0x2bc888bf',
          name: 'myMethod',
        }

        // Fake abi
        const FakeContract = {
          abi: [method],
        }

        // fake params
        const params = {}
        // keeping track of it so we can clean it up (web3 has a singleton class down below)
        const decodeParams = web3Service.web3.eth.abi.decodeParameters
        web3Service.web3.eth.abi.decodeParameters = jest.fn(() => {
          return params
        })

        // Creating a fake handler
        web3Service.inputsHandlers[method.name] = (
          transactionHash,
          contractAddress,
          args
        ) => {
          expect(
            web3Service.web3.eth.abi.decodeParameters
          ).toHaveBeenCalledWith(method.inputs, input)
          expect(transactionHash).toEqual(transaction.hash)
          expect(contractAddress).toEqual(web3Service.unlockContractAddress)
          expect(args).toEqual(params)
          // Clean up!
          web3Service.web3.eth.abi.decodeParameters = decodeParams
          done()
        }

        web3Service._parseTransactionFromInput(
          v01,
          transaction.hash,
          FakeContract,
          `${method.signature}${input}`,
          web3Service.unlockContractAddress
        )
      })
    })

    describe('v02', () => {
      it('should emit transaction.updated with the transaction marked as pending', done => {
        expect.assertions(2)
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toEqual(transaction.hash)
          expect(update).toEqual({
            status: 'pending',
            type: 'TRANSACTION_TYPE',
            confirmations: 0,
            blockNumber: Number.MAX_SAFE_INTEGER,
          })
          done()
        })
        web3Service._parseTransactionFromInput(
          v02,
          transaction.hash,
          UnlockV02.Unlock,
          input,
          web3Service.unlockContractAddress
        )
      })

      it('should call the handler if the transaction input can be parsed', done => {
        expect.assertions(4)
        const input =
          '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

        // Fake method
        const method = {
          signature: '0x2bc888bf',
          name: 'myMethod',
        }

        // Fake abi
        const FakeContract = {
          abi: [method],
        }

        // fake params
        const params = {}
        // keeping track of it so we can clean it up (web3 has a singleton class down below)
        const decodeParams = web3Service.web3.eth.abi.decodeParameters
        web3Service.web3.eth.abi.decodeParameters = jest.fn(() => {
          return params
        })

        // Creating a fake handler
        web3Service.inputsHandlers[method.name] = (
          transactionHash,
          contractAddress,
          args
        ) => {
          expect(
            web3Service.web3.eth.abi.decodeParameters
          ).toHaveBeenCalledWith(method.inputs, input)
          expect(transactionHash).toEqual(transaction.hash)
          expect(contractAddress).toEqual(web3Service.unlockContractAddress)
          expect(args).toEqual(params)
          // Clean up!
          web3Service.web3.eth.abi.decodeParameters = decodeParams
          done()
        }

        web3Service._parseTransactionFromInput(
          v02,
          transaction.hash,
          FakeContract,
          `${method.signature}${input}`,
          web3Service.unlockContractAddress
        )
      })
    })
  })

  describe('_getSubmittedTransaction', () => {
    describe('v0', () => {
      const blockNumber = 29
      const defaults = null

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getSubmittedTransaction(
          v0,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(4)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('submitted')
          expect(update.confirmations).toEqual(0)
          expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
          done()
        })
        web3Service._getSubmittedTransaction(
          v0,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should invoke parseTransactionFromInput if the defaults include an input value', done => {
        expect.assertions(4)

        const defaults = {
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        }

        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v0)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(defaults.input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getSubmittedTransaction(
          v0,
          transaction.hash,
          blockNumber,
          defaults
        )
      })
    })

    describe('v01', () => {
      const blockNumber = 29
      const defaults = null

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getSubmittedTransaction(
          v01,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(4)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('submitted')
          expect(update.confirmations).toEqual(0)
          expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
          done()
        })
        web3Service._getSubmittedTransaction(
          v01,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should invoke parseTransactionFromInput if the defaults include an input value', done => {
        expect.assertions(4)

        const defaults = {
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        }

        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v01)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(defaults.input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getSubmittedTransaction(
          v01,
          transaction.hash,
          blockNumber,
          defaults
        )
      })
    })

    describe('v02', () => {
      const blockNumber = 29
      const defaults = null

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getSubmittedTransaction(
          v02,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(4)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('submitted')
          expect(update.confirmations).toEqual(0)
          expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
          done()
        })
        web3Service._getSubmittedTransaction(
          v02,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should invoke parseTransactionFromInput if the defaults include an input value', done => {
        expect.assertions(4)

        const defaults = {
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        }

        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v02)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(defaults.input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getSubmittedTransaction(
          v02,
          transaction.hash,
          blockNumber,
          defaults
        )
      })
    })
  })

  describe('_getPendingTransaction', () => {
    describe('v0', () => {
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

      const blockTransaction = {
        hash: transaction.hash,
        nonce: '0x04',
        blockHash: 'null',
        blockNumber: null, // Not mined
        from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        value: '0x0',
        gas: '0x16e360',
        gasPrice: '0x04a817c800',
        input,
      }

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)

        web3Service._parseTransactionFromInput = jest.fn(() => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getPendingTransaction(v0, blockTransaction)
      })

      it('should invoke parseTransactionFromInput', done => {
        expect.assertions(4)
        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v0)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getPendingTransaction(v0, blockTransaction)
      })
    })

    describe('v01', () => {
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

      const blockTransaction = {
        hash: transaction.hash,
        nonce: '0x04',
        blockHash: 'null',
        blockNumber: null, // Not mined
        from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        value: '0x0',
        gas: '0x16e360',
        gasPrice: '0x04a817c800',
        input,
      }

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)

        web3Service._parseTransactionFromInput = jest.fn(() => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getPendingTransaction(v01, blockTransaction)
      })

      it('should invoke parseTransactionFromInput', done => {
        expect.assertions(4)
        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v01)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getPendingTransaction(v01, blockTransaction)
      })
    })

    describe('v02', () => {
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

      const blockTransaction = {
        hash: transaction.hash,
        nonce: '0x04',
        blockHash: 'null',
        blockNumber: null, // Not mined
        from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        value: '0x0',
        gas: '0x16e360',
        gasPrice: '0x04a817c800',
        input,
      }

      beforeEach(() => {
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)

        web3Service._parseTransactionFromInput = jest.fn(() => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getPendingTransaction(v02, blockTransaction)
      })

      it('should invoke parseTransactionFromInput', done => {
        expect.assertions(4)
        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(v02)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getPendingTransaction(v02, blockTransaction)
      })
    })
  })

  describe('getTransaction', () => {
    describe('v0', () => {
      describe('when the transaction was submitted', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, null)
          web3Service._watchTransaction = jest.fn()
        })

        it('should call _getSubmittedTransaction', async () => {
          expect.assertions(2)

          const defaultTransactionValues = {
            to: unlockAddress,
          }

          web3Service.unlockContractAbiVersion = jest.fn(() =>
            Promise.resolve(v0)
          )

          web3Service._getSubmittedTransaction = jest.fn(() =>
            Promise.resolve()
          )

          await web3Service.getTransaction(
            transaction.hash,
            defaultTransactionValues
          )
          expect(web3Service._getSubmittedTransaction).toHaveBeenCalledWith(
            v0,
            transaction.hash,
            29,
            defaultTransactionValues
          )
          expect(web3Service.unlockContractAbiVersion).toHaveBeenCalledWith()
        })
      })

      describe('when the transaction is pending/waiting to be mined', () => {
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        const blockTransaction = {
          hash: transaction.hash,
          nonce: '0x04',
          blockHash: 'null',
          blockNumber: null, // Not mined
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input,
        }

        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
        })

        it('should call _getPendingTransaction', async () => {
          expect.assertions(2)

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v0)
          })

          web3Service._getPendingTransaction = jest.fn(() => Promise.resolve())

          await web3Service.getTransaction(transaction.hash)
          expect(web3Service._getPendingTransaction).toHaveBeenCalledWith(
            v0,
            expect.objectContaining({
              hash: transaction.hash,
              input,
            })
          )
          expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
            blockTransaction.to
          )
        })
      })

      describe('when the transaction has been mined in the next block', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })

          nock.ethGetTransactionReceipt(transaction.hash, {
            status: 1,
            transactionHash: transaction.hash,
            transactionIndex: '0x0d',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            contractAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            gasUsed: '0x16e360',
            cumulativeGasUsed: '0x16e360',
            logs: [],
          })

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v0)
          })

          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        })

        it('should emit a transaction.updated event with 0 confirmations', async done => {
          expect.assertions(1)
          web3Service.on('transaction.updated', (hash, update) => {
            expect(update.confirmations).toEqual(0) // 0 > -1 [17-18]
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction has been mined but not fully confirmed', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(14).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v0)
          })

          nock.ethGetTransactionReceipt(transaction.hash, {
            status: 1,
            transactionHash: transaction.hash,
            transactionIndex: '0x0d',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(14).toString('16')}`,
            contractAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            gasUsed: '0x16e360',
            cumulativeGasUsed: '0x16e360',
            logs: [],
          })
          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        })

        it('should watch the transaction', async done => {
          expect.assertions(1)
          web3Service.on('transaction.updated', () => {
            expect(web3Service._watchTransaction).toHaveBeenCalledWith(
              transaction.hash
            )
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })

        it('should emit a transaction.updated event with the right values', async done => {
          expect.assertions(5)
          web3Service.on('transaction.updated', (hash, update) => {
            expect(hash).toBe(transaction.hash)
            expect(update.status).toEqual('mined')
            expect(update.confirmations).toEqual(3) //17-14
            expect(update.blockNumber).toEqual(14)
            expect(update.type).toEqual('TRANSACTION_TYPE')
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction was mined', () => {
        const blockTransaction = {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x00',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        }

        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v0)
          })
        })

        it('should mark the transaction as failed if the transaction receipt status is false', async done => {
          expect.assertions(6)
          nock.ethGetTransactionReceipt(transaction.hash, {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x0',
          })
          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.confirmations).toEqual(15) //29-14
            expect(update.type).toEqual('TYPE')
            expect(update.blockNumber).toEqual(14)
            web3Service.once(
              'transaction.updated',
              (transactionHash, update) => {
                expect(transactionHash).toEqual(transaction.hash)
                expect(update.status).toBe('failed')
                done()
              }
            )
          })

          return await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', async done => {
          expect.assertions(6)
          const transactionReceipt = {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
          const previousAddress = web3Service.unlockContractAddress

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            version,
            transactionHash,
            contract,
            receipt
          ) => {
            expect(version).toBe(version)
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockV0.Unlock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            web3Service.unlockContractAddress = previousAddress
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockV0.Unlock,
              blockTransaction.input
            )
            done()
          }
          web3Service.unlockContractAddress = blockTransaction.to
          web3Service.unlockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v0)
          })

          await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Lock abi otherwise', async done => {
          expect.assertions(6)
          const transactionReceipt = {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            version,
            transactionHash,
            contract,
            receipt
          ) => {
            expect(version).toBe(v0)
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockV0.PublicLock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockV0.PublicLock,
              blockTransaction.input
            )
            done()
          }

          await web3Service.getTransaction(transaction.hash)
        })
      })
    })

    describe('v02', () => {
      describe('when the transaction was submitted', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, null)
          web3Service._watchTransaction = jest.fn()
        })

        it('should call _getSubmittedTransaction', async () => {
          expect.assertions(2)

          const defaultTransactionValues = {
            to: unlockAddress,
          }

          web3Service.unlockContractAbiVersion = jest.fn(() =>
            Promise.resolve(v02)
          )

          web3Service._getSubmittedTransaction = jest.fn(() =>
            Promise.resolve()
          )

          await web3Service.getTransaction(
            transaction.hash,
            defaultTransactionValues
          )
          expect(web3Service._getSubmittedTransaction).toHaveBeenCalledWith(
            v02,
            transaction.hash,
            29,
            defaultTransactionValues
          )
          expect(web3Service.unlockContractAbiVersion).toHaveBeenCalledWith()
        })
      })

      describe('when the transaction is pending/waiting to be mined', () => {
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        const blockTransaction = {
          hash: transaction.hash,
          nonce: '0x04',
          blockHash: 'null',
          blockNumber: null, // Not mined
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input,
        }

        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
        })

        it('should call _getPendingTransaction', async () => {
          expect.assertions(2)

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v02)
          })

          web3Service._getPendingTransaction = jest.fn(() => Promise.resolve())

          await web3Service.getTransaction(transaction.hash)
          expect(web3Service._getPendingTransaction).toHaveBeenCalledWith(
            v02,
            expect.objectContaining({
              hash: transaction.hash,
              input,
            })
          )
          expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
            blockTransaction.to
          )
        })
      })

      describe('when the transaction has been mined in the next block', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })

          nock.ethGetTransactionReceipt(transaction.hash, {
            status: 1,
            transactionHash: transaction.hash,
            transactionIndex: '0x0d',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            contractAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            gasUsed: '0x16e360',
            cumulativeGasUsed: '0x16e360',
            logs: [],
          })

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v02)
          })

          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        })

        it('should emit a transaction.updated event with 0 confirmations', async done => {
          expect.assertions(1)
          web3Service.on('transaction.updated', (hash, update) => {
            expect(update.confirmations).toEqual(0) // 0 > -1 [17-18]
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction has been mined but not fully confirmed', () => {
        beforeEach(() => {
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(14).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })

          nock.ethGetTransactionReceipt(transaction.hash, {
            status: 1,
            transactionHash: transaction.hash,
            transactionIndex: '0x0d',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            contractAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            gasUsed: '0x16e360',
            cumulativeGasUsed: '0x16e360',
            logs: [],
          })

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v02)
          })
          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        })

        it('should watch the transaction', async done => {
          expect.assertions(1)
          web3Service.on('transaction.updated', () => {
            expect(web3Service._watchTransaction).toHaveBeenCalledWith(
              transaction.hash
            )
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })

        it('should emit a transaction.updated event with the right values', async done => {
          expect.assertions(5)
          web3Service.on('transaction.updated', (hash, update) => {
            expect(hash).toBe(transaction.hash)
            expect(update.status).toEqual('mined')
            expect(update.confirmations).toEqual(3) //17-14
            expect(update.blockNumber).toEqual(14)
            expect(update.type).toEqual('TRANSACTION_TYPE')
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction was mined', () => {
        const blockTransaction = {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x00',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        }

        beforeEach(() => {
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v02)
          })
        })

        it('should mark the transaction as failed if the transaction receipt status is false', async done => {
          expect.assertions(6)
          nock.ethGetTransactionReceipt(transaction.hash, {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x0',
          })
          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.confirmations).toEqual(15) //29-14
            expect(update.type).toEqual('TYPE')
            expect(update.blockNumber).toEqual(14)
            web3Service.once(
              'transaction.updated',
              (transactionHash, update) => {
                expect(transactionHash).toEqual(transaction.hash)
                expect(update.status).toBe('failed')
                done()
              }
            )
          })

          return await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', async done => {
          expect.assertions(6)
          const transactionReceipt = {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
          const previousAddress = web3Service.unlockContractAddress

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            version,
            transactionHash,
            contract,
            receipt
          ) => {
            expect(version).toBe(version)
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockV02.Unlock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            web3Service.unlockContractAddress = previousAddress
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockV02.Unlock,
              blockTransaction.input
            )
            done()
          }
          web3Service.unlockContractAddress = blockTransaction.to
          web3Service.unlockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(v02)
          })

          await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Lock abi otherwise', async done => {
          expect.assertions(6)
          const transactionReceipt = {
            transactionIndex: '0x3',
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            version,
            transactionHash,
            contract,
            receipt
          ) => {
            expect(version).toBe(v02)
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockV02.PublicLock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockV02.PublicLock,
              blockTransaction.input
            )
            done()
          }

          await web3Service.getTransaction(transaction.hash)
        })
      })
    })
  })

  describe('_getKeyByLockForOwner', () => {
    describe('v0', () => {
      it('should update the expiration date', async () => {
        expect.assertions(1)
        nock.ethCallAndYield(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          '0x000000000000000000000000000000000000000000000000000000005b58fa05'
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV0.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(1532557829)
      })

      // For some reason this test fails when running with others...
      it.skip('should handle missing key when the lock exists', async () => {
        expect.assertions(1)
        nock.ethCallAndFail(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          { message: 'VM Exception while processing transaction: revert' }
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV0.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(0)
      })
    })

    describe('v01', () => {
      it('should update the expiration date', async () => {
        expect.assertions(1)
        nock.ethCallAndYield(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          '0x000000000000000000000000000000000000000000000000000000005b58fa05'
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(1532557829)
      })

      // For some reason this test fails when running with others...
      it.skip('should handle missing key when the lock exists', async () => {
        expect.assertions(1)
        nock.ethCallAndFail(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          { message: 'VM Exception while processing transaction: revert' }
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(0)
      })
    })

    describe('v02', () => {
      it('should update the expiration date', async () => {
        expect.assertions(1)
        nock.ethCallAndYield(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          '0x000000000000000000000000000000000000000000000000000000005b58fa05'
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(1532557829)
      })

      // For some reason this test fails when running with others...
      it.skip('should handle missing key when the lock exists', async () => {
        expect.assertions(1)
        nock.ethCallAndFail(
          '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          lockAddress,
          { message: 'VM Exception while processing transaction: revert' }
        )

        const lockContract = new web3Service.web3.eth.Contract(
          UnlockV01.PublicLock.abi,
          lockAddress
        )

        let expiration = await web3Service._getKeyByLockForOwner(
          lockContract,
          account
        )
        expect(expiration).toBe(0)
      })
    })

    it('should yield the expiration date for the user key on the lock', async () => {
      expect.assertions(2)
      const contract = {
        methods: {
          keyExpirationTimestampFor: jest.fn(() => {
            return {
              call: jest.fn(() => {
                return Promise.resolve('123')
              }),
            }
          }),
        },
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(123)
      expect(contract.methods.keyExpirationTimestampFor).toHaveBeenCalledWith(
        account
      )
    })

    it('should return 0 if the value returned by the contract is 3963877391197344453575983046348115674221700746820753546331534351508065746944', async () => {
      expect.assertions(2)
      const contract = {
        methods: {
          keyExpirationTimestampFor: jest.fn(() => {
            return {
              call: jest.fn(() => {
                return Promise.resolve(
                  '3963877391197344453575983046348115674221700746820753546331534351508065746944'
                )
              }),
            }
          }),
        },
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.methods.keyExpirationTimestampFor).toHaveBeenCalledWith(
        account
      )
    })

    it('should return 0 if there was an exception', async () => {
      expect.assertions(2)
      const contract = {
        methods: {
          keyExpirationTimestampFor: jest.fn(() => {
            return {
              call: jest.fn(() => {
                return Promise.reject('Error')
              }),
            }
          }),
        },
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.methods.keyExpirationTimestampFor).toHaveBeenCalledWith(
        account
      )
    })
  })

  describe('getKeyByLockForOwner', () => {
    it('should trigger an event with the key', async () => {
      expect.assertions(4)
      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v0))
      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve(100)
        })
      })

      web3Service.on('key.updated', (keyId, update) => {
        expect(keyId).toBe([lockAddress, account].join('-'))
        expect(update.expiration).toBe(100)
        expect(update.lock).toBe(lockAddress)
        expect(update.owner).toBe(account)
      })
      await web3Service.getKeyByLockForOwner(lockAddress, account)
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

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

    // for each supported version, let's make sure it implements all methods
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificLockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
