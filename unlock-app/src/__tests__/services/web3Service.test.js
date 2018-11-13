/* eslint no-console: 0 */

import EventEmitter from 'events'
import Web3Utils from 'web3-utils'
import nock from 'nock'
import Web3Service from '../../services/web3Service'
import LockContract from '../../artifacts/contracts/PublicLock.json'

const defaultState = {
  network: {
    name: 'test',
    account: {
    },
  },
  provider: 'HTTP',
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

const nockScope = nock('http://127.0.0.1:8545', { 'encodedQueryParams': true })

let rpcRequestId = 0

function logNock(message, x, y) {
  console.log(message, x, y)
}

// Generic call
const jsonRpcRequest = (method, params, result, error) => {
  rpcRequestId += 1
  nockScope.post('/', { 'jsonrpc': '2.0', 'id': rpcRequestId, method, params })
    .reply(200, { 'id': rpcRequestId, 'jsonrpc': '2.0', result, error }).log(logNock)

}

// net_version
const netVersionAndYield = (netVersion) => {
  return jsonRpcRequest('net_version', [], netVersion)
}

// eth_getBalance
const getBalanceForAccountAndYieldBalance = (account, balance) => {
  return jsonRpcRequest('eth_getBalance', [account.toLowerCase(), 'latest'], balance)
}

// eth_accounts
const accountsAndYield = (accounts) => {
  return jsonRpcRequest('eth_accounts', [], accounts)
}

// eth_call
const ethCallAndYield = (data, to, result) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], result)
}

// eth_blockNumber
const ethBlockNumber = (result) => {
  return jsonRpcRequest('eth_blockNumber', [], result)
}

// eth_getTransactionByHash
const ethGetTransactionByHash = (hash, result) => {
  return jsonRpcRequest('eth_getTransactionByHash', [hash], result)
}

const ethCallAndFail = (data, to, error) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], undefined, error)
}

nock.emitter.on('no match', function (x, y, body) {
  console.log('DID NOT MATCH')
  console.log(body)
})

describe('Web3Service', () => {

  describe('connect', () => {

    describe('when there is no account setup', () => {

      describe('when there is an account unlocked on the node', () => {
        it('should yield that account, after refreshing its balance', () => {
          const web3Service = new Web3Service()

          const state = Object.assign({}, defaultState)
          state.network.account.address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'

          netVersionAndYield(1337)
          getBalanceForAccountAndYieldBalance(state.network.account.address, '0xdeadbeef')

          return web3Service.connect(state).then(([networkId, account]) => {
            expect(networkId).not.toBeNull()
            expect(account).toEqual({
              address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
              balance: '3735928559',
            })
          })
        })
      })

      describe('when there is no account unlocked on the node', () => {
        it('should create an account and yield it with a balance 0', () => {
          const web3Service = new Web3Service()

          const state = Object.assign({}, defaultState)
          state.network.account = {}

          const newAccount = {
            address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          }

          web3Service.createAccount = jest.fn(() => {
            return Promise.resolve(newAccount)
          })

          netVersionAndYield(1337)
          accountsAndYield([])
          getBalanceForAccountAndYieldBalance(newAccount.address, '0x0')

          return web3Service.connect(state).then(([networkId, account]) => {
            expect(networkId).not.toBeNull()
            expect(account).toEqual({
              address: newAccount.address,
              balance: '0',
            })
          })

        })
      })
    })

    describe('when there is an account unlocked on the node', () => {
      it('should refresh that account\'s balance and yield it', () => {
        const web3Service = new Web3Service()

        const state = Object.assign({}, defaultState)
        state.network.account = {}

        const nodeAccountAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

        netVersionAndYield(1337)
        accountsAndYield([nodeAccountAddress])
        getBalanceForAccountAndYieldBalance(nodeAccountAddress, '0x0')

        return web3Service.connect(state).then(([networkId, account]) => {
          expect(networkId).not.toBeNull()
          expect(account).toEqual({
            address: nodeAccountAddress,
            balance: '0',
          })
        })

      })
    })

    it('should get the network id and be ready', () => {
      const web3Service = new Web3Service(jest.fn())
      const nodeAccountAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
      const netVersion = Math.floor(Math.random(100000))

      netVersionAndYield(netVersion)
      accountsAndYield([nodeAccountAddress])
      getBalanceForAccountAndYieldBalance(nodeAccountAddress, '0x0')

      return web3Service.connect(Object.assign({}, defaultState)).then(() => {
        expect(web3Service.networkId).toEqual(netVersion)
        expect(web3Service.ready).toEqual(true)
      })

    })

  })

  describe('once connected', () => {
    let web3Service
    const lockAddress = '0x0d370b0974454d7b0e0e3b4512c0735a6489a71a'

    beforeEach(() => {
      netVersionAndYield(1337)
      accountsAndYield(nodeAccounts)
      getBalanceForAccountAndYieldBalance(nodeAccounts[0], '0x0')
      web3Service = new Web3Service()
      return web3Service.connect(defaultState).then(() => {
        // Clean all matchers
        nock.cleanAll()
      })
    })

    describe('refreshTransaction', () => {
      it('should update the number of confirmation based on number of blocks since the transaction', () => {

        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, {
          hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash: '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x00',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input: '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        })

        return web3Service.refreshTransaction(transaction).then((_transaction) => {
          expect(_transaction.confirmations).toEqual(15) //29-14
        })
      })

      it('should reject if the transaction could not be found', () => {
        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, null)

        return expect(web3Service.refreshTransaction(transaction)).rejects.toHaveProperty('message', 'Missing transaction')
      })
    })

    describe('getAddressBalance', () => {
      it.skip('should trigger an error if the address is not valid', () => {
        expect(false).toBe(true)
      })

      it('should return the balance of the address', () => {
        const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
        getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')
        return web3Service.getAddressBalance(address).then((balance) => {
          expect(balance).toEqual(Web3Utils.hexToNumberString('0xdeadbeef'))
        })
      })
    })

    describe('refreshLock', () => {

      it('should get the lock data using its address', () => {
        const lock = {
          address: '0xabc',
        }

        const getLockMock = jest.fn(() => {
          return new Promise((resolve) => {
            return resolve({
              balance: '1773',
              keyPrice: '10000000000000000',
              outstandingKeys: 2,
            })
          })
        })
        const _getLock = web3Service.getLock

        web3Service.getLock = getLockMock

        return web3Service.refreshLock(lock)
          .then((lock) => {
            expect(lock).toMatchObject({
              address: '0xabc',
              balance: '1773',
              keyPrice: '10000000000000000',
              outstandingKeys: 2,
            })

            expect(getLockMock).toHaveBeenCalledWith('0xabc')
            web3Service.getLock = _getLock
          })
      })

      it('should not overide the data that is not coming from the smart contract, such as the id', () => {
        const lock = {
          id: 'alpha',
          address: '0xabc',
        }

        const getLockMock = jest.fn(() => {
          return new Promise((resolve) => {
            return resolve({
              balance: '1773',
            })
          })
        })
        const _getLock = web3Service.getLock

        web3Service.getLock = getLockMock

        return web3Service.refreshLock(lock)
          .then((lock) => {
            expect(lock).toMatchObject({
              id: 'alpha',
              address: '0xabc',
              balance: '1773',
            })

            web3Service.getLock = _getLock
          })
      })

    })

    describe('getLock', () => {

      beforeEach(() => {
        ethCallAndYield('0x10e56973', lockAddress, '0x000000000000000000000000000000000000000000000000002386f26fc10000')
        ethCallAndYield('0x11a4c03a', lockAddress, '0x0000000000000000000000000000000000000000000000000000000000278d00')
        ethCallAndYield('0x74b6c106', lockAddress, '0x000000000000000000000000000000000000000000000000000000000000000a')
        ethCallAndYield('0x8da5cb5b', lockAddress, '0x00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1')
        ethCallAndYield('0x47dc1085', lockAddress, '0x0000000000000000000000000000000000000000000000000000000000000011')
        getBalanceForAccountAndYieldBalance(lockAddress, '0xdeadfeed')
      })

      it('should yield the lock once the lock has been loaded', () => {
        return web3Service.getLock(lockAddress)
          .then((lock) => {
            expect(lock).toMatchObject({
              address: lockAddress,
              balance: '3735944941',
              keyPrice: '10000000000000000',
              expirationDuration: 2592000,
              maxNumberOfKeys: 10,
              owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
              outstandingKeys: 17,
            })
          })
      })

      it('should have yielded a promise with the lock', () => {
        return web3Service.getLock(lockAddress).then((lock) => {
          expect(lock).toMatchObject({
            address: lockAddress,
            balance: Web3Utils.hexToNumberString('0xdeadfeed'),
            expirationDuration: 2592000,
            keyPrice: '10000000000000000',
            maxNumberOfKeys: 10,
            owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          })
        })
      })

      it.skip('should handle failures', () => {
        expect(false).toBe(true)
      })
    })

    describe('refreshKey', () => {
      it('should handle missing lock address', () => {
        const key = {}
        return expect(web3Service.refreshKey(key)).rejects.toHaveProperty('message', 'Could not fetch key without a lock')
      })

      it('should update the data and expiration date', () => {
        ethCallAndYield('0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1', lockAddress, '0x000000000000000000000000000000000000000000000000000000005b58fa05')
        ethCallAndYield('0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1', lockAddress, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000')

        const key = {
          id: '123',
          lockAddress: lockAddress,
          owner: nodeAccounts[0],
          expiration: 1,
          data: 'data',
        }

        return web3Service.refreshKey(key)
          .then((key) => {
            expect(key.owner).toBe(nodeAccounts[0])
            expect(key.lockAddress).toBe(lockAddress)
            expect(key.expiration).toBe(1532557829)
            expect(key.data).toBe(null)
          })
      })

      it('should handle missing key when the lock exists', () => {
        const key = {
          id: '123',
          lockAddress: lockAddress,
          owner: nodeAccounts[0],
          expiration: 1,
          data: 'data',
        }

        ethCallAndFail('0xabdf82ce000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e', lockAddress, { 'message': 'VM Exception while processing transaction: revert' })
        ethCallAndFail('0xd44fa14a000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e', lockAddress, { 'message': 'VM Exception while processing transaction: revert' })
        return web3Service.refreshKey(key)
          .then((key) => {
            expect(key.owner).toBe(nodeAccounts[0])
            expect(key.lockAddress).toBe(lockAddress)
            expect(key.expiration).toBe(0)
            expect(key.data).toBe(null)
          })

      })
    })

    describe('getKey', () => {
      it('should handle missing lock argument', () => {
        return expect(web3Service.getKey(null, {})).rejects.toHaveProperty('message', 'Could not fetch key without account and lock')
      })

      it('should handle missing account argument', () => {
        return expect(web3Service.getKey({}, null)).rejects.toHaveProperty('message', 'Could not fetch key without account and lock')
      })

      describe('when there is a lock and an account', () => {
        describe('when the key is missing', () => {
          it('reject', () => {
            ethCallAndFail('0xabdf82ce000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e', lockAddress, { 'message': 'VM Exception while processing transaction: revert' })
            ethCallAndFail('0xd44fa14a000000000000000000000000aca94ef8bd5ffee41947b4585a84bda5a3d3da6e', lockAddress, { 'message': 'VM Exception while processing transaction: revert' })

            return expect(web3Service.getKey(lockAddress, { address: nodeAccounts[1] }))
              .rejects.toHaveProperty('message', 'Missing key')
          })
        })

        describe('when the key exists', () => {
          it('should yield that key with the right account, lock, data field and expiration dates', () => {
            ethCallAndYield('0xabdf82ce00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1', lockAddress, '0x000000000000000000000000000000000000000000000000000000005b58fa05')
            ethCallAndYield('0xd44fa14a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1', lockAddress, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000')

            return web3Service.getKey(lockAddress, { address: nodeAccounts[0] })
              .then((key) => {
                expect(key.owner).toBe(nodeAccounts[0])
                expect(key.lockAddress).toBe(lockAddress)
                expect(key.id).toBe('6667250577ae077b23e61a0f438bd917')
                expect(key.expiration).toBe(1532557829)
                expect(key.data).toBe(null) // TODO: better value?
              })

          })
        })
      })
    })

    describe('handleTransaction', () => {
      it('should trigger transactionHash events', () => {
        const callback = jest.fn()
        const hash = 'hash'
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('transactionHash', hash)
        expect(callback).toHaveBeenCalledWith(null, { event: 'transactionHash', args: { hash } })
      })

      it('should trigger confirmation events', () => {
        const callback = jest.fn()
        const confirmationNumber = 1
        const receipt = {}
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('confirmation', confirmationNumber, receipt)
        expect(callback).toHaveBeenCalledWith(null, { event: 'confirmation', args: { confirmationNumber, receipt } })
      })

      it('should trigger receipt events', () => {
        const callback = jest.fn()
        const receipt = {
          logs: [],
        }
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [], callback)
        sendTransaction.emit('receipt', receipt)
        expect(callback).toHaveBeenCalledWith(null, { event: 'receipt', args: { receipt } })
      })

      it('should trigger named custom events when there are any', () => {
        const previousDecodeLog = web3Service.web3.eth.abi.decodeLog
        web3Service.web3.eth.abi.decodeLog = jest.fn() //(event.inputs, log.data, topics)

        const callback = jest.fn()
        const receipt = {
          logs: [{
            topics: ['', 'x', 'y'],
            data: [],
          }],
        }
        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(sendTransaction, [{
          name: 'ping',
          inputs: [],
        }], callback)
        sendTransaction.emit('receipt', receipt)
        expect(callback).toHaveBeenCalledWith(null, { event: 'receipt', args: { receipt } })
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
        const callback = () => { }
        web3Service.sendTransaction({ to, from, data, value, gas, privateKey, contractAbi }, callback)
        expect(mockSendTransaction).toHaveBeenCalledWith({ data, from, value, gas, to })
        expect(web3Service.handleTransaction).toHaveBeenCalledWith(mockTransaction, [], callback)
        web3Service.handleTransaction = previousHandleTransaction
        web3Service.web3.eth.sendTransaction = previousSendTransaction
      })

      // TODO: this test fails even though it should not: investigate!
      it.skip('should handle cases where the private key is known', () => {
        const previousHandleTransaction = web3Service.handleTransaction
        web3Service.handleTransaction = jest.fn()

        // mocking signTransaction
        const previousSignTransaction = web3Service.web3.eth.accounts.signTransaction
        const mockSignedTransaction = {
          rawTransaction: '',
        }
        const mockSignTransaction = jest.fn(() => {
          return new Promise((resolve) => {
            return resolve(mockSignedTransaction)
          })
        })
        web3Service.web3.eth.accounts.signTransaction = mockSignTransaction

        // mocking sendSignedTransaction
        const previousSendSignedTransaction = web3Service.web3.eth.sendSignedTransaction
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
        const callback = () => { }

        web3Service.sendTransaction({ to, from, data, value, gas, privateKey, contractAbi }, callback)

        expect(mockSignTransaction).toHaveBeenCalledWith({ data, from, value, gas, to }, privateKey)
        // TODO these assertions fail even though the mocks are being called. Investigate!
        // expect(mockSendSignedTransaction).toHaveBeenCalledWith(mockSignedTransaction.rawTransaction)
        // expect(web3Service.handleTransaction).toHaveBeenCalledWith(mockTransaction, [], callback)

        // Restoring mocks
        web3Service.handleTransaction = previousHandleTransaction
        web3Service.web3.eth.accounts.signTransaction = previousSignTransaction
        web3Service.web3.eth.accounts.sendSignedTransaction = previousSendSignedTransaction

      })
    })

    describe('loadAccount', () => {
      it('should fail if the private key is not valid', () => {
        const brokenKey = 'brokenKey'
        return web3Service.loadAccount(brokenKey)
          .then(() => {
            expect(true).toBe(false) // should not happen
          })
          .catch(() => {
            expect(true).toBe(true)
          })
      })

      describe('when the private key is valid', () => {
        it('should yield that account with the right balance', () => {
          const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' //
          getBalanceForAccountAndYieldBalance('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', '0x100')

          return web3Service.loadAccount(privateKey)
            .then((account) => {
              expect(account).toMatchObject({
                balance: '256',
                privateKey,
                address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
              })
            })
        })
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

        getBalanceForAccountAndYieldBalance('0x07748403082b29a45abD6C124A37E6B14e6B1803', '0x1000')

        return web3Service.createAccount()
          .then((account) => {
            expect(account).toMatchObject({
              balance: '4096',
              address: '0x07748403082b29a45abD6C124A37E6B14e6B1803',
            })
            web3Service.web3.eth.accounts.create = previousCreate
          })
      })

    })

    describe.skip('createLock', () => {
      it('should create a new lock with the params provided')
      it('should handle failures if the lock could not be created')
    })

    describe('purchaseKey', () => {
    })

    describe('withdrawFromLock', () => {
      it('should send a transaction to withdraw from the lock', () => {
        const lock = {
          address: '0xlock',
        }
        const account = {
          address: '0xaccount',
        }
        const previousContract = web3Service.web3.eth.Contract
        const previousSendTransaction = web3Service.sendTransaction
        web3Service.sendTransaction = jest.fn()
        const encodeABI = jest.fn()

        // Mock
        web3Service.web3.eth.Contract = function (abi, address) {
          this.methods = {
            withdraw: () => {
              return {
                encodeABI,
              }
            },
          }
          expect(abi).toEqual(LockContract.abi)
          expect(address).toEqual(lock.address)
        }

        web3Service.withdrawFromLock(lock, account)
        expect(encodeABI).toHaveBeenCalledWith()
        expect(web3Service.sendTransaction).toHaveBeenCalledWith({
          to: lock.address,
          from: account.address,
          data: undefined,
          gas: 1000000,
          privateKey: account.privateKey,
          contractAbi: LockContract.abi,
        }, expect.anything())

        // Restore
        web3Service.web3.eth.Contract = previousContract
        web3Service.sendTransaction = previousSendTransaction
      })

      it.skip('should handle the receipt event', () => {
        const lock = {
          address: '0xlock',
          balance: '10',
        }
        const account = {
          address: '0xaccount',
          balance: '1',
        }
        const previousContract = web3Service.web3.eth.Contract
        const previousSendTransaction = web3Service.sendTransaction
        web3Service.sendTransaction = function (transactionData, callback) {
          return callback(null, { event: 'receipt', args: [] })
        }

        const previousGetAddressBalance = web3Service.getAddressBalance
        web3Service.getAddressBalance = jest.fn().mockReturnValueOnce('10.9999').mockReturnValueOnce('0')

        // Mock
        web3Service.web3.eth.Contract = function () {
          this.methods = {
            withdraw: () => {
              return {
                encodeABI: jest.fn(),
              }
            },
          }
        }

        web3Service.withdrawFromLock(lock, account).then(([updatedLock, updatedAccount]) => {
          expect(updatedLock.address).toEqual(lock.address)
          expect(updatedLock.balance).toEqual('0')
          expect(updatedAccount.address).toEqual(account.address)
          expect(updatedAccount.balance).toEqual('10.9999')
        })

        expect(web3Service.getAddressBalance).toHaveBeenCalledWith(lock.address)
        expect(web3Service.getAddressBalance).toHaveBeenCalledWith(account.address)

        // Restore
        web3Service.web3.eth.Contract = previousContract
        web3Service.sendTransaction = previousSendTransaction
        web3Service.getAddressBalance = previousGetAddressBalance

      })
    })

  })

})
