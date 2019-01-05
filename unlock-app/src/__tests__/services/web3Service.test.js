/* eslint no-console: 0 */

import EventEmitter from 'events'
import Web3Utils from 'web3-utils'
import nock from 'nock'
import Web3Service from '../../services/web3Service'
import UnlockContract from '../../artifacts/contracts/Unlock.json'
import LockContract from '../../artifacts/contracts/PublicLock.json'
import configure from '../../config'
import { TRANSACTION_TYPES } from '../../constants'

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

// eth_getTransactionReceipt
const ethGetTransactionReceipt = (hash, result) => {
  return jsonRpcRequest('eth_getTransactionReceipt', [hash], result)
}

const ethCallAndFail = (data, to, error) => {
  return jsonRpcRequest('eth_call', [{ data, to }, 'latest'], undefined, error)
}

const ethGetLogs = (fromBlock, toBlock, topics, address, result) => {
  return jsonRpcRequest(
    'eth_getLogs',
    [{ fromBlock, toBlock, topics, address }],
    result
  )
}

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

let web3Service

describe('Web3Service', () => {
  beforeEach(() => {
    nock.cleanAll()

    web3Service = new Web3Service()
  })

  describe('connect', () => {
    it('should get the network id', done => {
      expect.assertions(1)

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
        return done()
      })

      web3Service.connect(Object.assign({}, defaultState))
    })

    it('should emit an error event when the smart contract has not been deployed on this network', done => {
      expect.assertions(3)

      expect(web3Service.ready).toBe(false)
      UnlockContract.networks = {}

      const netVersion = Math.floor(Math.random() * 100000)
      netVersionAndYield(netVersion)

      expect(web3Service.ready).toBe(false)
      web3Service.on('error', error => {
        expect(error.message).toBe(
          `Unlock is not deployed on network ${netVersion}`
        )
        done()
      })

      web3Service.connect(Object.assign({}, defaultState))
    })

    it('should silently ignore requests to connect again to the same provider', done => {
      expect.assertions(1)

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

      expect(web3Service.ready).toBe(false)
      web3Service.on('error', error => {
        expect(error.message).toBe('Provider does not exist')
        done()
      })
      web3Service.connect({ provider: 'CLOUD' })
    })
  })

  describe('request enabling access to account', () => {
    const netVersion = Math.floor(Math.random() * 100000)
    let enable

    beforeEach(done => {
      const { providers } = configure()
      nock.cleanAll()

      enable = providers.HTTP.enable = jest.fn(() => Promise.resolve())
      web3Service = new Web3Service(providers)
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

      web3Service.once('network.changed', () => {
        done()
      })

      return web3Service.connect(Object.assign({}, defaultState))
    })

    it('should call enable on a provider that supplies it', () => {
      expect(enable).toHaveBeenCalled()
    })
  })

  describe('fail while enabling access to account', () => {
    const netVersion = Math.floor(Math.random() * 100000)
    let enable, error

    beforeEach(done => {
      const { providers } = configure()
      nock.cleanAll()

      enable = providers.HTTP.enable = jest.fn(() => Promise.reject())
      error = false

      web3Service = new Web3Service(providers)
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

      web3Service.once('error', e => {
        error = e
      })
      web3Service.on('network.changed', () => {
        done()
      })

      return web3Service.connect(Object.assign({}, defaultState))
    })

    it('should error if a user rejects access', () => {
      expect(enable).toHaveBeenCalled()
      expect(error.message).toBe(
        'User canceled access to ethereum wallet, cannot continue'
      )
    })
  })

  describe('once connected', () => {
    const lockAddress = '0x0d370b0974454d7b0e0e3b4512c0735a6489a71a'
    const netVersion = Math.floor(Math.random() * 100000)

    beforeEach(done => {
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

      web3Service.on('network.changed', () => {
        done()
      })
      return web3Service.connect(Object.assign({}, defaultState))
    })

    describe('refreshOrGetAccount', () => {
      describe('when no account was passed but the node has an unlocked account', () => {
        it('should load a local account with the right balance', done => {
          expect.assertions(2)
          const unlockAccountsOnNode = [
            '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          ]

          accountsAndYield(unlockAccountsOnNode)
          getBalanceForAccountAndYieldBalance(
            unlockAccountsOnNode[0],
            '0xdeadbeef'
          )

          web3Service.once('ready', () => {
            expect(web3Service.ready).toBe(true)
            done()
          })

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              balance: '3735928559',
            })
          })

          web3Service.refreshOrGetAccount()
        })
      })

      describe('when no account was passed and the node has no unlocked account', () => {
        it('should create an account and yield 0 as its balance', done => {
          expect.assertions(2)
          const newAccount = {
            address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          }

          web3Service.createAccount = jest.fn(() => {
            return Promise.resolve(newAccount)
          })

          accountsAndYield([])
          getBalanceForAccountAndYieldBalance(newAccount.address, '0x0')

          web3Service.once('ready', () => {
            expect(web3Service.ready).toBe(true)
            done()
          })

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
              balance: '0',
            })
          })

          return web3Service.refreshOrGetAccount()
        })
      })

      describe('when an account was passed', () => {
        it('should load the balance for that account', done => {
          expect.assertions(2)
          const account = {
            address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            balance: '123',
          }
          getBalanceForAccountAndYieldBalance(account.address, '0xdeadbeef')

          web3Service.once('ready', () => {
            expect(web3Service.ready).toBe(true)
            done()
          })

          web3Service.on('account.changed', account => {
            expect(account).toEqual({
              address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              balance: '3735928559',
            })
          })

          return web3Service.refreshOrGetAccount(account)
        })
      })
    })

    describe('getPastUnlockTransactionsForUser', () => {
      it('should getPastEvents for the Unlock contract', done => {
        expect.assertions(1)
        const events = [
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
        ]

        const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
        ethGetLogs(
          '0x0',
          'latest',
          [
            '0x01017ed19df0c7f8acc436147b234b09664a9fb4797b4fa3fb9e599c2eb67be7', // NewLock
            `0x000000000000000000000000${userAddress.substring(2)}`,
            null,
          ],
          '0x3f313221a2af33fd8a430891291370632cb471bf',
          events
        )

        web3Service.once('transaction.new', transaction => {
          expect(transaction.hash).toEqual(
            '0x8a7c22fe9bcb5ee44c06410c584139f96a2f5cff529866bbed615986100eb6bd'
          )
          done()
        })

        web3Service.getTransaction = jest.fn()
        web3Service.getPastUnlockTransactionsForUser(
          Web3Utils.toChecksumAddress(userAddress)
        )
      })
    })

    describe('getTransaction', () => {
      it('should update the number of confirmation based on number of blocks since the transaction', done => {
        expect.assertions(2)
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

        ethGetTransactionReceipt(transaction.hash, {
          status: '0x0',
        })

        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.once('transaction.updated', (transaction, update) => {
          expect(update.confirmations).toEqual(15) //29-14
          expect(update.type).toEqual('TYPE') //29-14
          done()
        })

        return web3Service.getTransaction(transaction)
      })

      it('should trigger and error if the transaction could not be found', done => {
        expect.assertions(1)

        ethBlockNumber(`0x${(29).toString('16')}`)
        ethGetTransactionByHash(transaction.hash, null)

        web3Service.once('error', error => {
          expect(error.message).toEqual('Missing transaction')
          done()
        })

        return web3Service.getTransaction(transaction)
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
          expect.assertions(3)
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

          web3Service.once('transaction.updated', (transaction, update) => {
            expect(update.confirmations).toEqual(15) //29-14
            expect(update.type).toEqual('TYPE')
            web3Service.once('transaction.updated', (transaction, update) => {
              expect(update.status).toBe('failed')
              done()
            })
          })

          return web3Service.getTransaction(transaction)
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
            transactionToUpdate,
            abi,
            receipt
          ) => {
            expect(transactionToUpdate.hash).toEqual(transaction.hash)
            expect(abi).toEqual(UnlockContract.abi)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            web3Service.unlockContractAddress = previousAddress
            expect(web3Service.getTransactionType).toHaveBeenCalledWith(
              UnlockContract.abi,
              blockTransaction.input
            )
            done()
          }
          web3Service.unlockContractAddress = blockTransaction.to
          web3Service.getTransaction(transaction)
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
            transactionToUpdate,
            abi,
            receipt
          ) => {
            expect(transactionToUpdate.hash).toEqual(transaction.hash)
            expect(abi).toEqual(LockContract.abi)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            expect(web3Service.getTransactionType).toHaveBeenCalledWith(
              LockContract.abi,
              blockTransaction.input
            )
            done()
          }

          web3Service.getTransaction(transaction)
        })
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

        web3Service.on('lock.updated', (address, update) => {
          expect(address).toBe(lockAddress)
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
        expect(web3Service.getTransactionType(UnlockContract.abi, data)).toBe(
          TRANSACTION_TYPES.LOCK_CREATION
        )
      })

      it('should return the right transaction type on key purchase', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(LockContract.abi, '')
        const data = lock.methods
          .purchaseFor(nodeAccounts[0], Web3Utils.utf8ToHex(''))
          .encodeABI()
        expect(web3Service.getTransactionType(LockContract.abi, data)).toBe(
          TRANSACTION_TYPES.KEY_PURCHASE
        )
      })

      it('should return the right transaction type on withdrawals', () => {
        expect.assertions(1)
        const lock = new web3Service.web3.eth.Contract(LockContract.abi, '')
        const data = lock.methods.withdraw().encodeABI()
        expect(web3Service.getTransactionType(LockContract.abi, data)).toBe(
          TRANSACTION_TYPES.WITHDRAW
        )
      })
    })

    describe('handleTransaction', () => {
      it('should trigger transactionHash events and trigger a transaction.new event', done => {
        expect.assertions(2)

        const callback = jest.fn()
        const hash = 'hash'
        const sendTransaction = new EventEmitter()
        const transaction = {}

        web3Service.on('transaction.new', newTransaction => {
          expect(newTransaction.hash).toBe(hash)
          done()
        })

        web3Service.handleTransaction(
          transaction,
          sendTransaction,
          [],
          callback
        )
        sendTransaction.emit('transactionHash', hash)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'transactionHash',
          args: { hash },
        })
      })

      it('should trigger confirmation events and trigger a transaction.updated event', done => {
        expect.assertions(3)

        const callback = jest.fn()
        const confirmationNumber = 1
        const receipt = {}
        const sendTransaction = new EventEmitter()
        const transaction = {
          hash: '0x456',
        }

        web3Service.on('transaction.updated', (updatedTransaction, update) => {
          expect(updatedTransaction).toBe(transaction)
          expect(update.confirmations).toBe(1)
          expect(update.status).toBe('mined')
          done()
        })

        web3Service.handleTransaction(
          transaction,
          sendTransaction,
          [],
          callback
        )
        sendTransaction.emit('confirmation', confirmationNumber, receipt)
      })

      it('should trigger receipt events and invoke parseTransactionLogsFromReceipt', () => {
        expect.assertions(2)

        const callback = jest.fn()
        web3Service.parseTransactionLogsFromReceipt = jest.fn()
        const transaction = {}
        const receipt = {
          logs: [],
        }

        const sendTransaction = new EventEmitter()
        web3Service.handleTransaction(
          transaction,
          sendTransaction,
          [],
          callback
        )
        sendTransaction.emit('receipt', receipt)
        expect(callback).toHaveBeenCalledWith(null, {
          event: 'receipt',
          args: { receipt },
        })
        expect(
          web3Service.parseTransactionLogsFromReceipt
        ).toHaveBeenCalledWith(transaction, [], receipt)
      })

      it('should handle errors', done => {
        expect.assertions(1)
        const callback = jest.fn()
        const transaction = {
          hash: '0x456',
        }
        const sendTransaction = new EventEmitter()
        const error = 'There was a problem'

        web3Service.on('error', error => {
          expect(error).toBe('There was a problem')
          done()
        })

        web3Service.handleTransaction(
          transaction,
          sendTransaction,
          [],
          callback
        )
        sendTransaction.emit('error', error)
      })
    })

    describe('sendTransaction', () => {
      it('should handle cases where the transaction is sent via a provider', () => {
        expect.assertions(4)

        web3Service.handleTransaction = jest.fn()

        const mockSendTransaction = jest.fn()
        const mockTransaction = {}
        mockSendTransaction.mockReturnValue(mockTransaction)
        web3Service.web3.eth.sendTransaction = mockSendTransaction
        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        const transaction = {}
        const to = ''
        const from = '0x'
        const data = ''
        const value = ''
        const gas = ''
        const privateKey = null
        const contractAbi = []
        const callback = () => {}
        web3Service.sendTransaction(
          transaction,
          { to, from, data, value, gas, privateKey, contractAbi },
          callback
        )
        expect(web3Service.getTransactionType).toHaveBeenCalledWith(
          contractAbi,
          data
        )
        expect(transaction.type).toBe('TYPE')
        expect(mockSendTransaction).toHaveBeenCalledWith({
          data,
          from,
          value,
          gas,
          to,
        })
        expect(web3Service.handleTransaction).toHaveBeenCalledWith(
          transaction,
          mockTransaction,
          [],
          callback
        )
      })
    })

    describe('createAccount', () => {
      it('should yield a new account with a balance of 0', () => {
        expect.assertions(1)

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
          address: '0xadd',
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

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(1)

        web3Service.sendTransaction = jest.fn()

        web3Service.createLock(lock, owner)
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'pending',
            confirmations: 0,
            createdAt: expect.any(Number),
            lock: lock.address,
          }),
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
        expect.assertions(2)
        web3Service.sendTransaction = jest.fn((transaction, args, cb) => {
          return cb(null, {
            event: 'transactionHash',
            args: { hash: '0x123' },
          })
        })

        web3Service.on('lock.updated', (addressOfLockToUpdate, params) => {
          expect(addressOfLockToUpdate).toBe(lock.address)
          expect(params.transaction).toBe('0x123')
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
          lock: lock.address,
          owner: owner.address,
        }
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(1)

        web3Service.sendTransaction = jest.fn((transaction, args, cb) => {
          return cb(new Error('Failed to purchase key'), {})
        })

        web3Service.getKeyByLockForOwner = jest.fn()

        const keyData = ''

        web3Service.purchaseKey(
          lock.address,
          owner.address,
          lock.keyPrice,
          owner,
          keyData
        )
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'pending',
            confirmations: 0,
            createdAt: expect.any(Number),
            lock: lock.address,
            key: [lock.address, owner.address].join('-'),
            owner: owner.address,
          }),
          {
            to: key.lock,
            from: owner.address,
            data: expect.any(String), // encoded purchaseKey data
            gas: 1000000,
            value: lock.keyPrice,
            contractAbi: expect.any(Array), // abi...
          },
          expect.any(Function)
        )
      })

      it('should emit key.updated when the transaction has has been computed', done => {
        expect.assertions(4)

        web3Service.sendTransaction = jest.fn((transaction, args, cb) => {
          return cb(null, { event: 'transactionHash', args: { hash: '0x123' } })
        })

        web3Service.on('key.updated', (keyId, key) => {
          expect(keyId).toBe([lock.address, owner.address].join('-'))
          expect(key.transaction).toBe('0x123')
          expect(key.lock).toBe(lock.address)
          expect(key.owner).toBe(owner.address)
          done()
        })
        const keyData = ''

        web3Service.purchaseKey(
          lock.address,
          owner.address,
          lock.keyPrice,
          owner,
          keyData
        )
      })
    })

    describe('withdrawFromLock', () => {
      let lock
      let account

      beforeEach(() => {
        lock = {
          address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
          expirationDuration: 86400, // 1 day
          keyPrice: '100000000000000000', // 0.1 Eth
          maxNumberOfKeys: 100,
        }
        account = {
          address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
        }
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(1)

        web3Service.sendTransaction = jest.fn()

        web3Service.withdrawFromLock(lock, account)
        expect(web3Service.sendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'pending',
            confirmations: 0,
            createdAt: expect.any(Number),
            lock: lock.address,
            account: account.address,
          }),
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

      it('should getLock when the receipt event has been received', () => {
        expect.assertions(1)
        web3Service.sendTransaction = jest.fn((transaction, args, cb) => {
          return cb(null, { event: 'receipt', args: {} })
        })
        web3Service.getLock = jest.fn()

        web3Service.withdrawFromLock(lock, account)
        expect(web3Service.getLock).toHaveBeenCalledWith(lock.address)
      })
    })

    describe('emitContractEvent', () => {
      it('should handle NewLock and emit lock.saved', done => {
        expect.assertions(3)
        const transaction = {
          hash: '0x123',
          lock: '0x456',
        }
        web3Service.once('lock.saved', (lock, address) => {
          expect(lock.transaction).toBe(transaction.hash)
          expect(lock.address).toBe(transaction.lock)
          expect(address).toBe(address)
          done()
        })
        const params = {
          newLockAddress: ' 0x789',
        }
        web3Service.emitContractEvent(transaction, 'NewLock', params)
      })
      it('should handle Transfer and emit key.save', done => {
        expect.assertions(1)
        const transaction = {
          hash: '0x123',
          lock: '0x456',
          owner: '0x789',
        }
        const params = {}

        web3Service.once('key.saved', keyId => {
          expect(keyId).toBe('0x456-0x789')
          done()
        })

        web3Service.emitContractEvent(transaction, 'Transfer', params)
      })
    })

    describe('getKeysForLockOnPage', () => {
      it('should get as many owners as there are per page, starting at the right index', done => {
        expect.assertions(3)

        web3Service._getKeyByLockForOwner = jest.fn(() => {
          return new Promise(resolve => {
            return resolve([100, 'hello'])
          })
        })

        const onPage = 3
        const byPage = 5
        for (let i = 0; i < byPage; i++) {
          const start = onPage * byPage + i
          ethCallAndYield(
            `0x025e7c27${start.toString(16).padStart(64, '0')}`,
            lockAddress,
            '0x000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
          )
        }

        web3Service.on('keys.page', (lock, page, keys) => {
          expect(lockAddress).toEqual(lock)
          expect(page).toEqual(onPage)
          expect(keys.length).toEqual(byPage)
          done()
        })

        web3Service.getKeysForLockOnPage(lockAddress, onPage, byPage)
      })
    })
  })
})
