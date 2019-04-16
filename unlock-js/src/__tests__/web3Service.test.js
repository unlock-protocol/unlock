/* eslint no-console: 0 */

import Web3Utils from 'web3-utils'

import nock from 'nock'
import * as UnlockV0 from 'unlock-abi-0'

import Web3Service from '../web3Service'
import { KEY_ID } from '../constants'
import TransactionTypes from '../transactionTypes'

const nodeAccounts = [
  '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e',
]

const transaction = {
  status: 'mined',
  createdAt: new Date().getTime(),
  hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
}

const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

const nockScope = nock(readOnlyProvider, { encodedQueryParams: true })

let rpcRequestId = 0

let debug = false // set to true to see more logging statements

function logNock(...args) {
  if (debug) {
    console.log(...args)
  }
}

// Generic call
const jsonRpcRequest = (method, params, result, error) => {
  rpcRequestId += 1
  nockScope
    .post('/', { jsonrpc: '2.0', id: rpcRequestId, method, params })
    .reply(200, { id: rpcRequestId, jsonrpc: '2.0', result, error })
    .log(logNock)
}

// eth_getBalance
const getBalanceForAccountAndYieldBalance = (account, balance) => {
  return jsonRpcRequest(
    'eth_getBalance',
    [account.toLowerCase(), 'latest'],
    balance
  )
}

// eth_call
const ethCallAndYield = (data, to, result) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], result)
}

// eth_blockNumber
const ethBlockNumber = result => {
  return jsonRpcRequest('eth_blockNumber', [], result)
}

const ethCallAndFail = (data, to, error) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], undefined, error)
}

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

// This unlock address smart contract is fake
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

  const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

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

  describe('parseTransactionFromInput', () => {
    beforeEach(() => {
      web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
    })

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
      web3Service.parseTransactionFromInput(
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
        expect(web3Service.web3.eth.abi.decodeParameters).toHaveBeenCalledWith(
          method.inputs,
          input
        )
        expect(transactionHash).toEqual(transaction.hash)
        expect(contractAddress).toEqual(web3Service.unlockContractAddress)
        expect(args).toEqual(params)
        // Clean up!
        web3Service.web3.eth.abi.decodeParameters = decodeParams
        done()
      }

      web3Service.parseTransactionFromInput(
        transaction.hash,
        FakeContract,
        `${method.signature}${input}`,
        web3Service.unlockContractAddress
      )
    })

    describe('inputsHandlers', () => {
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
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      const balance = '0xdeadbeef'
      const inWei = Web3Utils.hexToNumberString(balance)
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
      getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      let addressBalance = await web3Service.getAddressBalance(address)
      expect(addressBalance).toEqual(Web3Utils.fromWei(inWei, 'ether'))
    })
  })

  describe('_getKeyByLockForOwner', () => {
    it('should update the data and expiration date', async () => {
      expect.assertions(2)
      ethCallAndYield(
        '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000000000005b58fa05'
      )
      ethCallAndYield(
        '0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
      )

      const lockContract = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        lockAddress
      )

      let [expiration, data] = await web3Service._getKeyByLockForOwner(
        lockContract,
        nodeAccounts[0]
      )
      expect(expiration).toBe(1532557829)
      expect(data).toBe(null)
    })

    it('should handle missing key when the lock exists', async () => {
      expect.assertions(2)

      ethCallAndFail(
        '0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        { message: 'VM Exception while processing transaction: revert' }
      )
      ethCallAndFail(
        '0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        lockAddress,
        { message: 'VM Exception while processing transaction: revert' }
      )

      const lockContract = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        lockAddress
      )

      let [expiration, data] = await web3Service._getKeyByLockForOwner(
        lockContract,
        nodeAccounts[0]
      )
      expect(expiration).toBe(0)
      expect(data).toBe(null)
    })
  })

  describe('getTransactionType', () => {
    it('should return null if there is no matching method', () => {
      expect.assertions(1)
      const data = 'notarealmethod'
      expect(web3Service.getTransactionType(UnlockV0.Unlock, data)).toBe(null)
    })

    it('should return the right transaction type on lock creation', () => {
      expect.assertions(1)
      const unlock = new web3Service.web3.eth.Contract(UnlockV0.Unlock.abi, '')
      const data = unlock.methods
        .createLock('1000', '1000000000', '1')
        .encodeABI()
      expect(web3Service.getTransactionType(UnlockV0.Unlock, data)).toBe(
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
        .purchaseFor(nodeAccounts[0], Web3Utils.utf8ToHex(''))
        .encodeABI()
      expect(web3Service.getTransactionType(UnlockV0.PublicLock, data)).toBe(
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
      expect(web3Service.getTransactionType(UnlockV0.PublicLock, data)).toBe(
        TransactionTypes.WITHDRAWAL
      )
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
      web3Service._watchTransaction('0x')
      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        blockTime / 2
      )
    })
    it('should trigger getTransaction when the timeout expires', () => {
      expect.assertions(1)
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
})
