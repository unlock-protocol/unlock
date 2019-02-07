/* eslint no-console: 0 */

import EventEmitter from 'events'
import nock from 'nock'
import Web3Utils from 'web3-utils'
import UnlockContract from '../../artifacts/contracts/Unlock.json'
import LockContract from '../../artifacts/contracts/PublicLock.json'
import configure from '../../config'
import {
  NOT_ENABLED_IN_PROVIDER,
  MISSING_PROVIDER,
  NON_DEPLOYED_CONTRACT,
  FAILED_TO_CREATE_LOCK,
  FAILED_TO_PURCHASE_KEY,
  FAILED_TO_UPDATE_KEY_PRICE,
  FAILED_TO_WITHDRAW_FROM_LOCK,
} from '../../errors'
import { POLLING_INTERVAL } from '../../constants'

jest.mock('../../utils/promises')
const WalletService = require('../../services/walletService').default

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

// eth_accounts
const accountsAndYield = accounts => {
  return jsonRpcRequest('eth_accounts', [], accounts)
}

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

let walletService
let config
let providers

describe('WalletService', () => {
  let delay
  beforeEach(() => {
    delay = require('../../utils/promises').delayPromise
    nock.cleanAll()
    config = configure()
    providers = config.providers
    // the second argument is designed to stop the polling loop in the majority of tests
    walletService = new WalletService(config, false)
  })
  describe('pollAccount', () => {
    it('constructor calls timeout with pollAccount when ready', () => {
      walletService = new WalletService(config)
      expect.assertions(2)
      walletService.checkForAccountChange = jest.fn(() =>
        Promise.resolve('account')
      )

      walletService.emit('ready')
      expect(walletService.ready).toBe(true)
      expect(delay).toHaveBeenCalledWith(POLLING_INTERVAL)
    })

    it('pollAccount calls checkForAccountChange and timeout', async () => {
      const isServer = false
      walletService.account = 'old account'

      walletService.checkForAccountChange = jest.fn(() =>
        Promise.resolve('thank u, next')
      )

      await walletService.pollForAccountChange(isServer, false)

      expect(delay).toHaveBeenCalledWith(POLLING_INTERVAL)
      expect(walletService.checkForAccountChange).toHaveBeenCalledWith(
        'old account'
      )

      expect(walletService.account).toBe('thank u, next')
    })
    it('pollAccount does not run on the server', async () => {
      const isServer = true
      walletService.account = 'old account'

      walletService.checkForAccountChange = jest.fn(() =>
        Promise.resolve('thank u, next')
      )

      await walletService.pollForAccountChange(isServer, false)

      expect(walletService.checkForAccountChange).not.toHaveBeenCalled()

      expect(walletService.account).toBe('old account')
    })
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
      walletService.on('network.changed', networkId => {
        expect(networkId).toEqual(netVersion)
        return done()
      })

      walletService.connect('HTTP')
    })

    it('should trigger an error if the provider is not set', done => {
      expect.assertions(1)

      walletService.on('error', error => {
        expect(error.message).toEqual(MISSING_PROVIDER)
        return done()
      })

      walletService.connect('AnotherProvider')
    })

    it('should emit an error event when the smart contract has not been deployed on this network', done => {
      expect.assertions(3)

      expect(walletService.ready).toBe(false)
      UnlockContract.networks = {}

      const netVersion = Math.floor(Math.random() * 100000)
      netVersionAndYield(netVersion)

      expect(walletService.ready).toBe(false)
      walletService.on('error', error => {
        expect(error.message).toBe(NON_DEPLOYED_CONTRACT)
        done()
      })

      walletService.connect('HTTP')
    })

    it('should silently ignore requests to connect again to the same provider', done => {
      expect.assertions(1)

      walletService.once('error', error => {
        expect(error.message).toBe(MISSING_PROVIDER)

        walletService.once('error', () => {
          // This should not trigger
          expect(false).toBe(true)
        })

        setTimeout(done, 1000) // wait 1 second

        // connect again
        walletService.connect('CLOUD')
      })
      walletService.connect('CLOUD')
    })

    it('should call enable on a provider that supplies it', done => {
      expect.assertions(3)

      expect(walletService.ready).toBe(false)
      UnlockContract.networks = {}

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
      const enable = (providers.HTTP.enable = jest.fn(() => Promise.resolve()))

      expect(walletService.ready).toBe(false)
      walletService.once('network.changed', () => {
        expect(enable).toHaveBeenCalled()
        done()
      })

      walletService.connect('HTTP')
    })

    it('should fail while if a user rejects access', done => {
      expect.assertions(4)

      expect(walletService.ready).toBe(false)
      UnlockContract.networks = {}

      const enable = (providers.HTTP.enable = jest.fn(() => Promise.reject()))

      expect(walletService.ready).toBe(false)
      walletService.once('error', error => {
        expect(enable).toHaveBeenCalled()
        expect(error.message).toBe(NOT_ENABLED_IN_PROVIDER)
        done()
      })

      walletService.connect('HTTP')
    })
  })

  describe('once connected', () => {
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

      walletService.on('network.changed', () => {
        done()
      })
      return walletService.connect('HTTP')
    })

    describe('checkForAccountChange', () => {
      it('should emit account.changed if the account does not match the local account', async () => {
        expect.assertions(1)
        const unlockAccountsOnNode = [
          '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        ]

        accountsAndYield(unlockAccountsOnNode)

        walletService.emit = jest.fn()

        await walletService.checkForAccountChange('prior')

        expect(walletService.emit).toHaveBeenCalledWith(
          'account.changed',
          '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )
      })

      it('should not emit account.changed if the account does match the local account', async () => {
        expect.assertions(1)
        const unlockAccountsOnNode = [
          '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        ]

        accountsAndYield(unlockAccountsOnNode)

        walletService.emit = jest.fn()

        await walletService.checkForAccountChange(
          '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )

        expect(walletService.emit).not.toHaveBeenCalled()
      })
    })
    describe('getAccount', () => {
      describe('when no account was passed but the node has an unlocked account', () => {
        it('should load a local account and emit the ready event', done => {
          expect.assertions(2)
          const unlockAccountsOnNode = [
            '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          ]

          accountsAndYield(unlockAccountsOnNode)

          walletService.once('ready', () => {
            expect(walletService.ready).toBe(true)
            done()
          })

          walletService.on('account.changed', address => {
            expect(address).toEqual(
              '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' // checksum-ed address
            )
          })

          walletService.getAccount()
        })
      })

      describe('when no account was passed and the node has no unlocked account', () => {
        it('should create an account and emit the ready event', done => {
          expect.assertions(2)
          const newAccount = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

          walletService._createAccount = jest.fn(() => {
            return Promise.resolve(newAccount)
          })

          accountsAndYield([])

          walletService.once('ready', () => {
            expect(walletService.ready).toBe(true)
            done()
          })

          walletService.on('account.changed', account => {
            expect(account).toBe('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')
          })

          return walletService.getAccount()
        })
      })
    })

    describe('sendTransaction', () => {
      const to = ''
      const from = '0x'
      const data = ''
      const value = ''
      const gas = ''
      const privateKey = null
      const contract = {
        abi: [],
      }
      const mockSendTransaction = jest.fn()
      let mockTransaction

      beforeEach(() => {
        mockTransaction = new EventEmitter()
        mockSendTransaction.mockReturnValue(mockTransaction)
        walletService.web3.eth.sendTransaction = mockSendTransaction
      })

      it('should handle cases where the transaction is sent via a provider', () => {
        expect.assertions(1)

        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          () => {}
        )

        expect(mockSendTransaction).toHaveBeenCalledWith({
          data,
          from,
          value,
          gas,
          to,
        })
      })

      it('should trigger the transaction.pending event', done => {
        expect.assertions(1)
        walletService.on('transaction.pending', () => {
          expect(true).toBe(true)
          done()
        })
        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          () => {}
        )
      })

      it('should trigger the transaction.new event', done => {
        expect.assertions(3)
        const transactionHash = '0x123'

        walletService.on('transaction.new', (hash, sender, recipient) => {
          expect(hash).toEqual(transactionHash)
          expect(sender).toEqual(from)
          expect(recipient).toEqual(to)
          done()
        })

        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          () => {}
        )

        mockTransaction.emit('transactionHash', transactionHash)
      })

      it('should callback with the hash', done => {
        expect.assertions(1)
        const transactionHash = '0x123'
        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          (error, hash) => {
            expect(hash).toEqual(transactionHash)
            done()
          }
        )

        mockTransaction.emit('transactionHash', transactionHash)
      })

      it('should callback with error if there was any', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          error => {
            expect(error).toBe(error)
            done()
          }
        )

        mockTransaction.emit('error', error)
      })
    })

    describe('_createAccount', () => {
      it('should yield a new account', () => {
        expect.assertions(1)
        const address = '0x07748403082b29a45abD6C124A37E6B14e6B1803'
        // mock web3's create
        const mock = jest.fn()
        mock.mockReturnValue({
          address,
        })
        const previousCreate = walletService.web3.eth.accounts.create
        walletService.web3.eth.accounts.create = mock

        return walletService._createAccount().then(account => {
          expect(account).toEqual(address)
          walletService.web3.eth.accounts.create = previousCreate
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
          keyPrice: '0.1', // 0.1 Eth
          maxNumberOfKeys: 100,
        }
        owner = '0xdeadfeed'
        walletService.unlockContractAddress =
          '0x3ca206264762caf81a8f0a843bbb850987b41e16'
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(6)
        const data = '' // mock abi data for createLock

        walletService._sendTransaction = jest.fn()

        const unlockMockContract = {
          methods: {
            createLock: jest.fn(() => {
              return unlockMockContract.methods
            }),
            encodeABI: jest.fn(() => {
              return data
            }),
          },
        }

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(UnlockContract.abi)
            expect(address).toBe(walletService.unlockContractAddress)
            this.methods = {
              createLock: (duration, price, numberOfKeys) => {
                expect(duration).toEqual(lock.expirationDuration)
                expect(price).toEqual('100000000000000000') // Web3Utils.toWei(lock.keyPrice, 'ether')
                expect(numberOfKeys).toEqual(100)
                return this
              },
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = ContractClass

        walletService.createLock(lock, owner)

        expect(walletService._sendTransaction).toHaveBeenCalledWith(
          {
            to: walletService.unlockContractAddress,
            from: owner,
            data,
            gas: 2000000,
            contract: UnlockContract,
          },
          expect.any(Function)
        )
      })

      it('should emit lock.updated with the transaction', done => {
        expect.assertions(2)
        const hash = '0x1213'

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(null, hash)
        })

        walletService.on('lock.updated', (lockAddress, update) => {
          expect(lockAddress).toBe(lock.address)
          expect(update).toEqual({
            transaction: hash,
          })
          done()
        })

        walletService.createLock(lock, owner)
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_CREATE_LOCK)
          done()
        })

        walletService.createLock(lock, owner)
      })
    })

    describe('purchaseKey', () => {
      let keyPrice
      let lock
      let owner
      let account
      let data

      beforeEach(() => {
        lock = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
        owner = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
        keyPrice = '100000000'
        account = '0xdeadbeef'
        data = 'key data'
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(5)
        const data = '' // mock abi data for purchaseKey

        walletService._sendTransaction = jest.fn()

        const unlockMockContract = {
          methods: {
            purchaseFor: jest.fn(() => {
              return unlockMockContract.methods
            }),
            encodeABI: jest.fn(() => {
              return data
            }),
          },
        }

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(LockContract.abi)
            expect(address).toBe(lock)
            this.methods = {
              purchaseFor: (customer, data) => {
                expect(customer).toEqual(owner)
                expect(data).toEqual('0x') // Web3Utils.utf8ToHex(data || '')
                return this
              },
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = ContractClass

        walletService.purchaseKey(lock, owner, keyPrice, account, data)

        expect(walletService._sendTransaction).toHaveBeenCalledWith(
          {
            to: lock,
            from: account,
            data,
            gas: 1000000,
            contract: LockContract,
            value: '100000000000000000000000000', // Web3Utils.toWei(keyPrice, 'ether')
          },
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_PURCHASE_KEY)
          done()
        })

        walletService.purchaseKey(lock, owner, keyPrice, account, data)
      })
    })

    describe('updateKeyPrice', () => {
      let lock
      let account
      let price

      beforeEach(() => {
        lock = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
        account = '0xdeadbeef'
        price = '100000000'
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(4)
        const data = '' // mock abi data for purchaseKey

        walletService._sendTransaction = jest.fn()

        const unlockMockContract = {
          methods: {
            updateKeyPrice: jest.fn(() => {
              return unlockMockContract.methods
            }),
            encodeABI: jest.fn(() => {
              return data
            }),
          },
        }

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(LockContract.abi)
            expect(address).toBe(lock)
            this.methods = {
              updateKeyPrice: newPrice => {
                expect(newPrice).toEqual(Web3Utils.toWei(price, 'ether'))
                return this
              },
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = ContractClass

        walletService.updateKeyPrice(lock, account, price)

        expect(walletService._sendTransaction).toHaveBeenCalledWith(
          {
            to: lock,
            from: account,
            data,
            gas: 1000000,
            contract: LockContract,
          },
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_UPDATE_KEY_PRICE)
          done()
        })

        walletService.updateKeyPrice(lock, account, price)
      })
    })

    describe('signData', () => {
      const account = '0x123'
      const data = 'please sign me'

      it('should call first eth.personal.sign', done => {
        expect.assertions(4)
        walletService.web3.eth.personal.sign = jest.fn(
          (dataToSign, signer, callback) => {
            expect(dataToSign).toEqual(data)
            expect(signer).toEqual(account)
            return callback(null /* error */, 'signature')
          }
        )
        walletService.signData(account, data, (error, signature) => {
          expect(walletService.web3.eth.personal.sign).toHaveBeenCalled()
          expect(signature).toEqual('signature')
          done()
        })
      })

      it('should call web3.eth.sign if eth.personal.sign fails', done => {
        expect.assertions(7)

        walletService.web3.eth.personal.sign = jest.fn(
          (dataToSign, signer, callback) => {
            expect(dataToSign).toEqual(data)
            expect(signer).toEqual(account)
            const error = {}
            return callback(error, null /* signature */)
          }
        )

        walletService.web3.eth.sign = jest.fn(
          (dataToSign, signer, callback) => {
            expect(dataToSign).toEqual(data)
            expect(signer).toEqual(account)
            return callback(null /* error */, 'signature')
          }
        )

        walletService.signData(account, data, (error, signature) => {
          expect(walletService.web3.eth.personal.sign).toHaveBeenCalled()
          expect(walletService.web3.eth.sign).toHaveBeenCalled()
          expect(signature).toEqual('signature')
          done()
        })
      })

      it('should call web3.eth.sign if eth.personal.sign throws', done => {
        expect.assertions(7)

        walletService.web3.eth.personal.sign = jest.fn((dataToSign, signer) => {
          expect(dataToSign).toEqual(data)
          expect(signer).toEqual(account)
          throw new Error()
        })

        walletService.web3.eth.sign = jest.fn(
          (dataToSign, signer, callback) => {
            expect(dataToSign).toEqual(data)
            expect(signer).toEqual(account)
            return callback(null /* error */, 'signature')
          }
        )

        walletService.signData(account, data, (error, signature) => {
          expect(walletService.web3.eth.personal.sign).toHaveBeenCalled()
          expect(walletService.web3.eth.sign).toHaveBeenCalled()
          expect(signature).toEqual('signature')
          done()
        })
      })
    })

    describe('withdrawFromLock', () => {
      let lock
      let account

      beforeEach(() => {
        lock = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
        account = '0xdeadbeef'
      })

      it('should invoke sendTransaction with the right params', () => {
        expect.assertions(3)
        const data = '' // mock abi data for purchaseKey

        walletService._sendTransaction = jest.fn()

        const unlockMockContract = {
          methods: {
            withdrawFromLock: jest.fn(() => {
              return unlockMockContract.methods
            }),
            encodeABI: jest.fn(() => {
              return data
            }),
          },
        }

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(LockContract.abi)
            expect(address).toBe(lock)
            this.methods = {
              withdraw: () => {
                return this
              },
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = ContractClass

        walletService.withdrawFromLock(lock, account)

        expect(walletService._sendTransaction).toHaveBeenCalledWith(
          {
            to: lock,
            from: account,
            data,
            gas: 1000000,
            contract: LockContract,
          },
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
          done()
        })

        walletService.withdrawFromLock(lock, account)
      })
    })
  })
})
