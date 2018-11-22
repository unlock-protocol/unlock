/* eslint no-console: 0 */

import EventEmitter from 'events'
import Web3Utils from 'web3-utils'
import nock from 'nock'
import Web3Service from '../../services/web3Service'
import UnlockContract from '../../artifacts/contracts/Unlock.json'

const defaultState = {
  network: {
    name: 'test',
  },
  provider: 'HTTP',
  account: {},
}

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

const debug = false // set to true to see more logging statements

function logNock(message, x, y) {
  if (debug) {
    console.log(message, x, y)
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

// net_version
const netVersionAndYield = netVersion => {
  return jsonRpcRequest('net_version', [], netVersion)
}

// eth_getBalance
const getBalanceForAccountAndYieldBalance = (account, balance) => {
  return jsonRpcRequest(
    'eth_getBalance',
    [account.toLowerCase(), 'latest'],
    balance
  )
}

// eth_accounts
const accountsAndYield = accounts => {
  return jsonRpcRequest('eth_accounts', [], accounts)
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

const ethCallAndFail = (data, to, error) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], undefined, error)
}

nock.emitter.on('no match', function(x, y, body) {
  if (debug) {
    console.log('DID NOT MATCH')
    console.log(body)
  }
})

describe('Web3Service', () => {
  describe('connect', () => {
    it('should get the network id and be ready', done => {
      expect.assertions(3)

      const web3Service = new Web3Service()
      expect(web3Service.ready).toBe(false)

      const netVersion = Math.floor(Math.random() * 100000)
      netVersionAndYield(netVersion)

      UnlockContract.networks = {
        [netVersion]: {
          events: {},
          links: {},
          address: '0x3f313221a2af33fd8a430891291370632cb471bf',
          transactionHash:
            '0x8545541749873b42c96e1699c2e62f0f4062ca57f3398270423c1089232ef7dd',
        },
      }
      web3Service.on('network.changed', networkId => {
        expect(networkId).toEqual(netVersion)
        expect(web3Service.ready).toEqual(true)
        return done()
      })

      web3Service.connect(Object.assign({}, defaultState))
    })

    it.skip('should emit an error event when the smart contract has not been deployed', done => {
      expect.assertions(2)

      const web3Service = new Web3Service()
      expect(web3Service.ready).toBe(false)
      UnlockContract.networks = {}

      const netVersion = Math.floor(Math.random() * 100000)
      netVersionAndYield(netVersion)

      expect(web3Service.ready).toBe(false)
      web3Service.on('error', error => {
        expect(error.message).toBe('Provider does not exist')
        done()
      })

      web3Service.connect(Object.assign({}, defaultState))
    })

    it('should silently ignore requests to connect again to the same provider', done => {
      expect.assertions(1)
      const web3Service = new Web3Service()

      web3Service.once('error', error => {
        expect(error.message).toBe('Provider does not exist')

        web3Service.once('error', () => {
          // This should not trigger
          expect(false).toBe(true)
        })

        setTimeout(done, 1000) // wait 1 second

        // connect again
        web3Service.connect({ provider: 'CLOUD' })
      })
      web3Service.connect({ provider: 'CLOUD' })
    })

    it('should emit an error event when the provider is not available', done => {
      expect.assertions(2)
      const web3Service = new Web3Service()

      expect(web3Service.ready).toBe(false)
      web3Service.on('error', error => {
        expect(error.message).toBe('Provider does not exist')
        done()
      })
      web3Service.connect({ provider: 'CLOUD' })
    })
  })

  describe('once connected', () => {
    let web3Service
    const lockAddress = '0x0d370b0974454d7b0e0e3b4512c0735a6489a71a'
    const netVersion = Math.floor(Math.random() * 100000)

    beforeEach(done => {
      netVersionAndYield(netVersion)
      web3Service = new Web3Service()

      UnlockContract.networks = {
        [netVersion]: {
          events: {},
          links: {},
          address: '0x3f313221a2af33fd8a430891291370632cb471bf',
          transactionHash:
            '0x8545541749873b42c96e1699c2e62f0f4062ca57f3398270423c1089232ef7dd',
        },
      }

      web3Service.on('network.changed', () => {
        nock.cleanAll()
        done()
      })

      return web3Service.connect(defaultState)
    })

    describe('refreshOrGetAccount', () => {
      describe('when no account was passed but the node has an unlocked account', () => {
        it('should load a local account with the right balance', done => {
          expect.assertions(1)
          const unlockAccountsOnNode = [
            '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          ]

          accountsAndYield(unlockAccountsOnNode)
          getBalanceForAccountAndYieldBalance(
            unlockAccountsOnNode[0],
            '0xdeadbeef'
          )

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              balance: '3735928559',
            })
            done()
          })

          web3Service.refreshOrGetAccount()
        })
      })

      describe('when no account was passed and the node has no unlocked account', () => {
        it('should create an account and yield 0 as its balance', done => {
          expect.assertions(1)
          const newAccount = {
            address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          }

          web3Service.createAccount = jest.fn(() => {
            return Promise.resolve(newAccount)
          })

          accountsAndYield([])
          getBalanceForAccountAndYieldBalance(newAccount.address, '0x0')

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
              balance: '0',
            })
            done()
          })

          return web3Service.refreshOrGetAccount()
        })
      })

      describe('when an account was passed', () => {
        it('should load the balance for that account', done => {
          expect.assertions(1)
          const account = {
            address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            balance: '123',
          }
          getBalanceForAccountAndYieldBalance(account.address, '0xdeadbeef')

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              balance: '3735928559',
            })
            done()
          })

          return web3Service.refreshOrGetAccount(account)
        })
      })
    })

    describe('getTransaction', () => {
      it('should update the number of confirmation based on number of blocks since the transaction', done => {
        expect.assertions(1)
        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x00',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        })

        web3Service.on('transaction.updated', (transaction, update) => {
          expect(update.confirmations).toEqual(15) //29-14
          done()
        })

        return web3Service.getTransaction(transaction)
      })

      it('should trigger and error if the transaction could not be found', done => {
        expect.assertions(1)

        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, null)

        web3Service.on('error', error => {
          expect(error.message).toEqual('Missing transaction')
          done()
        })

        return web3Service.getTransaction(transaction)
      })
    })

    describe('getAddressBalance', () => {
      it('should return the balance of the address', () => {
        expect.assertions(1)
        const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
        getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')
        return web3Service.getAddressBalance(address).then(balance => {
          expect(balance).toEqual(Web3Utils.hexToNumberString('0xdeadbeef'))
        })
      })
    })

    describe('getLock', () => {
      beforeEach(() => {
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
      })

      it('should trigger an event when it has been loaded woth an updated balance', done => {
        expect.assertions(2)

        web3Service.on('lock.updated', (lock, update) => {
          expect(lock).toMatchObject({
            address: lockAddress,
          })
          expect(update).toMatchObject({
            balance: '3735944941',
            keyPrice: '10000000000000000',
            expirationDuration: 2592000,
            maxNumberOfKeys: 10,
            owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
            outstandingKeys: 17,
          })
          done()
        })

        return web3Service.getLock({ address: lockAddress })
      })
    })

    describe('getKey', () => {
      it('should handle missing lock address', done => {
        expect.assertions(1)
        web3Service.on('key.updated', (key, update) => {
          expect(update).toMatchObject({ data: null, expiration: 0 })
          done()
        })
        web3Service.getKey({})
      })

      it('should update the data and expiration date', done => {
        expect.assertions(4)
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

        web3Service.on('key.updated', (key, update) => {
          expect(key.owner).toBe(nodeAccounts[0])
          expect(key.lockAddress).toBe(lockAddress)
          expect(update.expiration).toBe(1532557829)
          expect(update.data).toBe(null)
          done()
        })

        const key = {
          id: '123',
          lockAddress: lockAddress,
          owner: nodeAccounts[0],
          expiration: 1,
          data: 'data',
        }

        return web3Service.getKey(key)
      })

      it('should handle missing key when the lock exists', done => {
        expect.assertions(4)

        web3Service.on('key.updated', (key, update) => {
          expect(key.owner).toBe(nodeAccounts[0])
          expect(key.lockAddress).toBe(lockAddress)
          expect(update.expiration).toBe(0)
          expect(update.data).toBe(null)
          done()
        })

        const key = {
          id: '123',
          lockAddress: lockAddress,
          owner: nodeAccounts[0],
          expiration: 1,
          data: 'data',
        }

        ethCallAndFail(
          '0xabdf82ce000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e',
          lockAddress,
          { message: 'VM Exception while processing transaction: revert' }
        )
        ethCallAndFail(
          '0xd44fa14a000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e',
          lockAddress,
          { message: 'VM Exception while processing transaction: revert' }
        )
        return web3Service.getKey(key)
      })
    })

    describe('handleTransaction', () => {
      it('should trigger transactionHash events', () => {
        const callback = jest.fn()
        const hash = 'hash'
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('transactionHash', hash)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'transactionHash',
          args: { hash },
        })
      })

      it('should trigger confirmation events', () => {
        const callback = jest.fn()
        const confirmationNumber = 1
        const receipt = {}
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('confirmation', confirmationNumber, receipt)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'confirmation',
          args: { confirmationNumber, receipt },
        })
      })

      it('should trigger receipt events', () => {
        const callback = jest.fn()
        const receipt = {
          logs: [],
        }
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('receipt', receipt)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'receipt',
          args: { receipt },
        })
      })

      it('should trigger named custom events when there are any', () => {
        const previousDecodeLog = web3Service.web3.eth.abi.decodeLog
        web3Service.web3.eth.abi.decodeLog = jest.fn() //(event.inputs, log.data, topics)

        const callback = jest.fn()
        const receipt = {
          logs: [
            {
              topics: ['', 'x', 'y'],
              data: [],
            },
          ],
        }
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(
          sendTransaction,
          [
            {
              name: 'ping',
              inputs: [],
            },
          ],
          callback
        )
        sendTransaction.emit('receipt', receipt)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'receipt',
          args: { receipt },
        })
        expect(callback).toHaveBeenCalledWith(null, { event: 'ping', args: {} })

        web3Service.web3.eth.abi.decodeLog = previousDecodeLog
      })
    })

    describe('sendTransaction', () => {
      it('should handle cases where the private key is not known and using an extrenal provider', () => {
        const previousHandleTransaction = web3Service.handleTransaction
        web3Service.handleTransaction = jest.fn()

        const previousSendTransaction = web3Service.web3.eth.sendTransaction
        const mockSendTransaction = jest.fn()
        const mockTransaction = {}
        mockSendTransaction.mockReturnValue(mockTransaction)
        web3Service.web3.eth.sendTransaction = mockSendTransaction

        const to = ''
        const from = '0x'
        const data = ''
        const value = ''
        const gas = ''
        const privateKey = null
        const contractAbi = []
        const callback = () => {}
        web3Service.sendTransaction(
          { to, from, data, value, gas, privateKey, contractAbi },
          callback
        )
        expect(mockSendTransaction).toHaveBeenCalledWith({
          data,
          from,
          value,
          gas,
          to,
        })
        expect(web3Service.handleTransaction).toHaveBeenCalledWith(
          mockTransaction,
          [],
          callback
        )
        web3Service.handleTransaction = previousHandleTransaction
        web3Service.web3.eth.sendTransaction = previousSendTransaction
      })

      // TODO: this test fails even though it should not: investigate!
      it.skip('should handle cases where the private key is known', () => {
        const previousHandleTransaction = web3Service.handleTransaction
        web3Service.handleTransaction = jest.fn()

        // mocking signTransaction
        const previousSignTransaction =
          web3Service.web3.eth.accounts.signTransaction
        const mockSignedTransaction = {
          rawTransaction: '',
        }
        const mockSignTransaction = jest.fn(() => {
          return new Promise(resolve => {
            return resolve(mockSignedTransaction)
          })
        })
        web3Service.web3.eth.accounts.signTransaction = mockSignTransaction

        // mocking sendSignedTransaction
        const previousSendSignedTransaction =
          web3Service.web3.eth.sendSignedTransaction
        const mockSendSignedTransaction = jest.fn()
        const mockTransaction = {}
        mockSendSignedTransaction.mockReturnValue(mockTransaction)
        web3Service.web3.eth.sendSignedTransaction = mockSendSignedTransaction

        const to = ''
        const from = '0x'
        const data = ''
        const value = ''
        const gas = ''
        const privateKey = '0x123'
        const contractAbi = []
        const callback = () => {}

        web3Service.sendTransaction(
          { to, from, data, value, gas, privateKey, contractAbi },
          callback
        )

        expect(mockSignTransaction).toHaveBeenCalledWith(
          { data, from, value, gas, to },
          privateKey
        )
        // TODO these assertions fail even though the mocks are being called. Investigate!
        // expect(mockSendSignedTransaction).toHaveBeenCalledWith(mockSignedTransaction.rawTransaction)
        // expect(web3Service.handleTransaction).toHaveBeenCalledWith(mockTransaction, [], callback)

        // Restoring mocks
        web3Service.handleTransaction = previousHandleTransaction
        web3Service.web3.eth.accounts.signTransaction = previousSignTransaction
        web3Service.web3.eth.accounts.sendSignedTransaction = previousSendSignedTransaction
      })
    })

    describe('createAccount', () => {
      it('should yield a new account with a balance of 0', () => {
        // mock web3's create
        const mock = jest.fn()
        mock.mockReturnValue({
          address: '0x07748403082b29a45abD6C124A37E6B14e6B1803',
        })
        const previousCreate = web3Service.web3.eth.accounts.create
        web3Service.web3.eth.accounts.create = mock

        getBalanceForAccountAndYieldBalance(
          '0x07748403082b29a45abD6C124A37E6B14e6B1803',
          '0x1000'
        )

        return web3Service.createAccount().then(account => {
          expect(account).toMatchObject({
            balance: '4096',
            address: '0x07748403082b29a45abD6C124A37E6B14e6B1803',
          })
          web3Service.web3.eth.accounts.create = previousCreate
        })
      })
    })

    describe('createLock', () => {
      let lock
      let owner

      beforeEach(() => {
        lock = {
          id: '0xadd',
          expirationDuration: 86400, // 1 day
          keyPrice: '100000000000000000', // 0.1 Eth
          maxNumberOfKeys: 100,
        }
        owner = {
          address: '0xdeadfeed',
        }
        web3Service.unlockContractAddress =
          '0x3ca206264762caf81a8f0a843bbb850987b41e16'
      })

      it('should handle errors when the transaction could not be processed', done => {
        expect.assertions(2)

        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(new Error('Failed to create lock'))
        })

        web3Service.on('error', error => {
          expect(error).toMatchObject({ message: 'Failed to create lock' })
          done()
        })

        web3Service.createLock(lock, owner)
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          {
            to: expect.any(String),
            from: owner.address,
            data: expect.any(String), // encoded createLock data
            gas: 2000000,
            contractAbi: expect.any(Array), // abi...
          },
          expect.any(Function)
        )
      })

      it('should emit a new transaction once it has been submitted', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('transaction.new', transaction => {
          expect(transaction).toMatchObject({
            confirmations: 0,
            createdAt: expect.any(Number),
            hash: '0x123',
            lock: '0xadd',
            status: 'submitted',
          })
          done()
        })

        web3Service.createLock(lock, owner)
      })

      it('should attach the transaction to the lock and emit lock.updated', done => {
        expect.assertions(2)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('lock.updated', (lock, update) => {
          expect(lock).toMatchObject({
            id: '0xadd',
            expirationDuration: 86400, // 1 day
            keyPrice: '100000000000000000', // 0.1 Eth
            maxNumberOfKeys: 100,
          })
          expect(update).toMatchObject({
            transaction: '0x123',
          })
          done()
        })

        web3Service.createLock(lock, owner)
      })

      it('should emit transaction.updated for each confirmation', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, {
            event: 'confirmation',
            args: { confirmationNumber: 3 },
          })
        })

        web3Service.on('transaction.updated', (transaction, update) => {
          expect(update).toMatchObject({
            confirmations: 3,
            status: 'mined',
          })
          done()
        })

        web3Service.createLock(lock, owner)
      })

      it('should emit lock.saved once the NewLock event has been received', done => {
        expect.assertions(2)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, {
            event: 'NewLock',
            args: { newLockAddress: '0xlock' },
          })
        })
        web3Service.getLock = jest.fn()

        web3Service.on('lock.saved', (lock, address) => {
          expect(lock).toMatchObject({
            id: '0xadd',
            expirationDuration: 86400, // 1 day
            keyPrice: '100000000000000000', // 0.1 Eth
            maxNumberOfKeys: 100,
          })
          expect(address).toBe('0xlock')
          done()
        })

        web3Service.createLock(lock, owner)
      })
    })

    describe('purchaseKey', () => {
      let key
      let lock
      let owner

      beforeEach(() => {
        lock = {
          id: 'lock',
          address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
          expirationDuration: 86400, // 1 day
          keyPrice: '100000000000000000', // 0.1 Eth
          maxNumberOfKeys: 100,
        }
        owner = {
          address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
        }
        key = {
          id: 'abc',
          lockAddress: lock.address,
          owner: owner.address,
        }
      })

      it('should handle errors when the transaction could not be processed', done => {
        expect.assertions(2)

        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(new Error('Failed to purchase key'), {})
        })

        web3Service.on('error', error => {
          expect(error).toMatchObject({ message: 'Failed to purchase key' })
          done()
        })

        web3Service.purchaseKey(key, owner, lock)
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          {
            to: expect.any(String),
            from: owner.address,
            data: expect.any(String), // encoded purchaseKey data
            gas: 1000000,
            value: lock.keyPrice,
            contractAbi: expect.any(Array), // abi...
          },
          expect.any(Function)
        )
      })

      it('should emit a new transaction once it has been submitted', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('transaction.new', transaction => {
          expect(transaction).toMatchObject({
            confirmations: 0,
            createdAt: expect.any(Number),
            hash: '0x123',
            key: key.id,
            lock: lock.id,
            account: owner.address,
            status: 'submitted',
          })
          done()
        })

        web3Service.purchaseKey(key, owner, lock)
      })

      it('should attach the transaction to the key and emit key.updated', done => {
        expect.assertions(2)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('key.updated', (key, update) => {
          expect(key).toMatchObject({
            id: 'abc',
            lockAddress: lock.address,
            owner: owner.address,
          })
          expect(update).toMatchObject({
            transaction: '0x123',
          })
          done()
        })

        web3Service.purchaseKey(key, owner, lock)
      })

      it('should emit transaction.updated for each confirmation', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, {
            event: 'confirmation',
            args: { confirmationNumber: 3 },
          })
        })

        web3Service.on('transaction.updated', (transaction, update) => {
          expect(update).toMatchObject({
            confirmations: 3,
            status: 'mined',
          })
          done()
        })

        web3Service.purchaseKey(key, owner, lock)
      })

      it('should emit key.saved once the Transfer event has been received', done => {
        expect.assertions(2)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, { event: 'Transfer', args: {} })
        })
        web3Service.getKey = jest.fn()

        web3Service.on('key.saved', key => {
          expect(key).toMatchObject({
            id: 'abc',
            lockAddress: lock.address,
            owner: owner.address,
          })
          expect(web3Service.getKey).toHaveBeenCalledWith(key)
          done()
        })

        web3Service.purchaseKey(key, owner, lock)
      })
    })

    describe('withdrawFromLock', () => {
      let lock
      let account

      beforeEach(() => {
        lock = {
          id: 'lock',
          address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
          expirationDuration: 86400, // 1 day
          keyPrice: '100000000000000000', // 0.1 Eth
          maxNumberOfKeys: 100,
        }
        account = {
          address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
        }
      })

      it('should handle errors when the transaction could not be processed', done => {
        expect.assertions(2)

        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(new Error('Failed to withdraw from lock'), {})
        })

        web3Service.on('error', error => {
          expect(error).toMatchObject({
            message: 'Failed to withdraw from lock',
          })
          done()
        })

        web3Service.withdrawFromLock(lock, account)
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          {
            to: expect.any(String),
            from: account.address,
            data: expect.any(String), // encoded purchaseKey data
            gas: 1000000,
            contractAbi: expect.any(Array), // abi...
          },
          expect.any(Function)
        )
      })

      it('should emit a new transaction once it has been submitted', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('transaction.new', transaction => {
          expect(transaction).toMatchObject({
            confirmations: 0,
            createdAt: expect.any(Number),
            hash: '0x123',
            lock: lock.id,
            status: 'submitted',
          })
          done()
        })

        web3Service.withdrawFromLock(lock, account)
      })

      it('should emit transaction.updated for each confirmation', done => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, {
            event: 'confirmation',
            args: { confirmationNumber: 3 },
          })
        })

        web3Service.on('transaction.updated', (transaction, update) => {
          expect(update).toMatchObject({
            confirmations: 3,
            status: 'mined',
          })
          done()
        })

        web3Service.withdrawFromLock(lock, account)
      })

      it('should getLock when the receipt event has been received', () => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((args, cb) => {
          cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
          return cb(null, { event: 'receipt', args: {} })
        })
        web3Service.getLock = jest.fn()

        web3Service.withdrawFromLock(lock, account)
        expect(web3Service.getLock).toHaveBeenCalledWith(lock)
      })
    })
  })
})
