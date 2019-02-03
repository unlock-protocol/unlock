/* eslint no-console: 0 */

import Web3Utils from 'web3-utils'
import nock from 'nock'
import Web3Service from '../../services/web3Service'
import UnlockContract from '../../artifacts/contracts/Unlock.json'
import LockContract from '../../artifacts/contracts/PublicLock.json'
import configure from '../../config'
import { TRANSACTION_TYPES } from '../../constants'

const nodeAccounts = [
  '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e',
]

const transaction = {
  status: 'mined',
  createdAt: new Date().getTime(),
  hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
}

const nockScope = nock('http://127.0.0.1:8545', { encodedQueryParams: true })

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

// eth_getTransactionByHash
const ethGetTransactionByHash = (hash, result) => {
  return jsonRpcRequest('eth_getTransactionByHash', [hash], result)
}

// eth_getTransactionReceipt
const ethGetTransactionReceipt = (hash, result) => {
  return jsonRpcRequest('eth_getTransactionReceipt', [hash], result)
}

const ethCallAndFail = (data, to, error) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], undefined, error)
}

const pad64 = data => {
  return `${data.toString().padStart(64, '0')}`
}

const abiPaddedString = parameters => parameters.map(pad64).join('')

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

// This unlock address smart contract is fake
const unlockSmartContractAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

let web3Service

const { blockTime } = configure()

describe('Web3Service', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service(unlockSmartContractAddress)
  })

  const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

  describe('getPastLockTransactions', () => {
    it('should getPastEvents for the Lock contract', () => {
      expect.assertions(3)
      const lockAddress = '0x123'
      class MockContract {
        constructor(abi, address) {
          expect(abi).toBe(LockContract.abi)
          expect(address).toEqual(lockAddress)
        }
      }

      web3Service.web3.eth.Contract = MockContract

      web3Service._getPastTransactionsForContract = jest.fn()

      web3Service.getPastLockTransactions(lockAddress)
      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
        expect.any(MockContract),
        'allevents'
      )
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

  describe('getPastLockCreationsTransactionsForUser', () => {
    it('should getPastEvents for the Unlock contract', () => {
      expect.assertions(3)

      class MockContract {
        constructor(abi, address) {
          expect(abi).toBe(UnlockContract.abi)
          expect(address).toEqual(web3Service.unlockContractAddress)
        }
      }

      web3Service.web3.eth.Contract = MockContract

      const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      web3Service._getPastTransactionsForContract = jest.fn()

      web3Service.getPastLockCreationsTransactionsForUser(userAddress)
      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
        expect.any(MockContract),
        'NewLock',
        {
          lockOwner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        }
      )
    })
  })

  describe('getTransaction', () => {
    describe('when the transaction was submitted', () => {
      beforeEach(() => {
        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, null)
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

        web3Service.getTransaction(transaction.hash)
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
        web3Service.getTransaction(transaction.hash)
      })
    })

    describe('when the transaction is pending/waiting to be mined', () => {
      beforeEach(() => {
        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash: 'null',
          blockNumber: null, // Not mined
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        })

        web3Service._watchTransaction = jest.fn()
        web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(5)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('pending')
          expect(update.confirmations).toEqual(0)
          expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
          expect(update.type).toEqual('TRANSACTION_TYPE')
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })
    })

    describe('when the transaction has been mined but not fully confirmed', () => {
      beforeEach(() => {
        ethBlockNumber(`0x${(17).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, {
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
        web3Service.web3.eth.getTransactionReceipt = jest.fn(
          () => new Promise(() => {})
        )
        web3Service._watchTransaction = jest.fn()
        web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(5)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('mined')
          expect(update.confirmations).toEqual(3) //17-14
          expect(update.blockNumber).toEqual(14)
          expect(update.type).toEqual('TRANSACTION_TYPE')
          done()
        })

        web3Service.getTransaction(transaction.hash)
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
        ethBlockNumber(`0x${(29).toString('16')}`)

        ethGetTransactionByHash(transaction.hash, blockTransaction)
      })

      it('should mark the transaction as failed if the transaction receipt status is false', done => {
        expect.assertions(6)
        ethGetTransactionReceipt(transaction.hash, {
          transactionIndex: '0x3',
          blockHash:
            '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
          blockNumber: '0x158',
          gasUsed: '0x2ea84',
          cumulativeGasUsed: '0x3a525',
          logs: [],
          status: '0x0',
        })
        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.once('transaction.updated', (transactionHash, update) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(update.confirmations).toEqual(15) //29-14
          expect(update.type).toEqual('TYPE')
          expect(update.blockNumber).toEqual(14)
          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.status).toBe('failed')
            done()
          })
        })

        return web3Service.getTransaction(transaction.hash)
      })

      it('should parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', done => {
        expect.assertions(5)
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
        ethGetTransactionReceipt(transaction.hash, transactionReceipt)
        const previousAddress = web3Service.unlockContractAddress

        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.parseTransactionLogsFromReceipt = (
          transactionHash,
          contract,
          receipt
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contract).toEqual(UnlockContract)
          expect(receipt.blockNumber).toEqual(344)
          expect(receipt.logs).toEqual([])
          web3Service.unlockContractAddress = previousAddress
          expect(web3Service.getTransactionType).toHaveBeenCalledWith(
            UnlockContract,
            blockTransaction.input
          )
          done()
        }
        web3Service.unlockContractAddress = blockTransaction.to
        web3Service.getTransaction(transaction.hash)
      })

      it('should parseTransactionLogsFromReceipt with the Lock abi otherwise', done => {
        expect.assertions(5)
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
        ethGetTransactionReceipt(transaction.hash, transactionReceipt)

        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.parseTransactionLogsFromReceipt = (
          transactionHash,
          contract,
          receipt
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contract).toEqual(LockContract)
          expect(receipt.blockNumber).toEqual(344)
          expect(receipt.logs).toEqual([])
          expect(web3Service.getTransactionType).toHaveBeenCalledWith(
            LockContract,
            blockTransaction.input
          )
          done()
        }

        web3Service.getTransaction(transaction.hash)
      })
    })
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', () => {
      expect.assertions(1)
      const balance = '0xdeadbeef'
      const inWei = Web3Utils.hexToNumberString(balance)
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
      getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')
      return web3Service.getAddressBalance(address).then(balance => {
        expect(balance).toEqual(Web3Utils.fromWei(inWei, 'ether'))
      })
    })
  })

  describe('getLock', () => {
    it('should trigger an event when it has been loaded woth an updated balance', done => {
      expect.assertions(2)

      ethCallAndYield(
        '0x10e56973',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000002386f26fc10000'
      )
      ethCallAndYield(
        '0x11a4c03a',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000278d00'
      )
      ethCallAndYield(
        '0x74b6c106',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000000000000000000a'
      )
      ethCallAndYield(
        '0x8da5cb5b',
        lockAddress,
        '0x00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1'
      )
      ethCallAndYield(
        '0x47dc1085',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000011'
      )
      getBalanceForAccountAndYieldBalance(lockAddress, '0xdeadfeed')
      ethBlockNumber(`0x${(1337).toString('16')}`)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          balance: Web3Utils.fromWei('3735944941', 'ether'),
          keyPrice: Web3Utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          outstandingKeys: 17,
          asOf: 1337,
        })
        done()
      })

      return web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an unlimited number of keys', done => {
      expect.assertions(2)
      ethCallAndYield(
        '0x10e56973',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000002386f26fc10000'
      )
      ethCallAndYield(
        '0x11a4c03a',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000278d00'
      )
      ethCallAndYield(
        '0x74b6c106',
        lockAddress,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
      ethCallAndYield(
        '0x8da5cb5b',
        lockAddress,
        '0x00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1'
      )
      ethCallAndYield(
        '0x47dc1085',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000011'
      )
      getBalanceForAccountAndYieldBalance(lockAddress, '0xdeadfeed')
      ethBlockNumber(`0x${(1337).toString('16')}`)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          maxNumberOfKeys: -1,
        })
        done()
      })

      return web3Service.getLock(lockAddress)
    })
  })

  describe('_getKeyByLockForOwner', () => {
    it('should update the data and expiration date', () => {
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
        LockContract.abi,
        lockAddress
      )

      return web3Service
        ._getKeyByLockForOwner(lockContract, nodeAccounts[0])
        .then(([expiration, data]) => {
          expect(expiration).toBe(1532557829)
          expect(data).toBe(null)
        })
    })

    it('should handle missing key when the lock exists', () => {
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
        LockContract.abi,
        lockAddress
      )

      return web3Service
        ._getKeyByLockForOwner(lockContract, nodeAccounts[0])
        .then(([expiration, data]) => {
          expect(expiration).toBe(0)
          expect(data).toBe(null)
        })
    })
  })

  describe('getKeyByLockForOwner', () => {
    it('should trigger an event with the key', done => {
      expect.assertions(5)

      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve([100, 'hello'])
        })
      })

      web3Service.on('key.updated', (keyId, update) => {
        expect(keyId).toBe([lockAddress, nodeAccounts[0]].join('-'))
        expect(update.expiration).toBe(100)
        expect(update.data).toBe('hello')
        expect(update.lock).toBe(lockAddress)
        expect(update.owner).toBe(nodeAccounts[0])
        done()
      })
      web3Service.getKeyByLockForOwner(lockAddress, nodeAccounts[0])
    })
  })

  describe('getTransactionType', () => {
    it('should return the right transaction type on lock creation', () => {
      expect.assertions(1)
      const unlock = new web3Service.web3.eth.Contract(UnlockContract.abi, '')
      const data = unlock.methods
        .createLock('1000', '1000000000', '1')
        .encodeABI()
      expect(web3Service.getTransactionType(UnlockContract, data)).toBe(
        TRANSACTION_TYPES.LOCK_CREATION
      )
    })

    it('should return the right transaction type on key purchase', () => {
      expect.assertions(1)
      const lock = new web3Service.web3.eth.Contract(LockContract.abi, '')
      const data = lock.methods
        .purchaseFor(nodeAccounts[0], Web3Utils.utf8ToHex(''))
        .encodeABI()
      expect(web3Service.getTransactionType(LockContract, data)).toBe(
        TRANSACTION_TYPES.KEY_PURCHASE
      )
    })

    it('should return the right transaction type on withdrawals', () => {
      expect.assertions(1)
      const lock = new web3Service.web3.eth.Contract(LockContract.abi, '')
      const data = lock.methods.withdraw().encodeABI()
      expect(web3Service.getTransactionType(LockContract, data)).toBe(
        TRANSACTION_TYPES.WITHDRAWAL
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

  describe('getKeysForLockOnPage', () => {
    it('should get as many owners as there are per page, starting at the right index', done => {
      const onPage = 0
      const byPage = 5
      const keyHolder = [
        '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        '0xC66Ef2E0D0eDCce723b3fdd4307db6c5F0Dda1b8',
      ]

      expect.assertions(9)

      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve([100, 'hello'])
        })
      })

      ethCallAndYield(
        `0x10803b72${abiPaddedString([onPage, byPage])}`,
        lockAddress,
        `0x${abiPaddedString(['20', '2', keyHolder[0], keyHolder[1]])}`
      )

      web3Service.getKeysForLockOnPage(lockAddress, onPage, byPage)

      web3Service.on('keys.page', (lock, page, keys) => {
        expect(lockAddress).toEqual(lock)
        expect(page).toEqual(onPage)
        expect(keys.length).toEqual(2)
        expect(keys[0].id).toEqual(`${lockAddress}-${keyHolder[0]}`)
        expect(keys[0].owner).toEqual(keyHolder[0])
        expect(keys[0].lock).toEqual(lockAddress)
        expect(keys[0].expiration).toEqual(100)
        expect(keys[0].data).toEqual('hello')
        expect(keys[1].owner).toEqual(keyHolder[1])
        done()
      })
    })

    describe('when the on contract method does not exist', () => {
      it('should use the iterative method of providing keyholder', done => {
        const onPage = 0
        const byPage = 2

        for (let i = 0; i < byPage; i++) {
          const start = onPage * byPage + i
          ethCallAndYield(
            `0x025e7c27${start.toString(16).padStart(64, 0)}`,
            lockAddress,
            '0x'
          )
        }

        jest
          .spyOn(web3Service, '_genKeyOwnersFromLockContract')
          .mockImplementation(() => {
            return Promise.resolve([])
          })
        jest.spyOn(web3Service, '_genKeyOwnersFromLockContractIterative')

        web3Service.getKeysForLockOnPage(lockAddress, onPage, byPage)

        web3Service.on('keys.page', (lock, page) => {
          expect(lockAddress).toEqual(lock)
          expect(page).toEqual(onPage)
          expect(
            web3Service._genKeyOwnersFromLockContractIterative
          ).toHaveBeenCalledTimes(1)
          done()
        })
      })
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
})
