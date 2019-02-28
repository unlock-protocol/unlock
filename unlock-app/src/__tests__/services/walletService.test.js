/* eslint no-console: 0 */

import EventEmitter from 'events'
import nock from 'nock'
import Web3Utils from 'web3-utils'
/* eslint-disable import/no-unresolved */
import UnlockContract from '../../artifacts/contracts/Unlock.json'
import LockContract from '../../artifacts/contracts/PublicLock.json'
/* eslint-enable import/no-unresolved */
import configure from '../../config'
import WalletService from '../../services/walletService'
import {
  NOT_ENABLED_IN_PROVIDER,
  MISSING_PROVIDER,
  NON_DEPLOYED_CONTRACT,
  FAILED_TO_CREATE_LOCK,
  FAILED_TO_PURCHASE_KEY,
  FAILED_TO_UPDATE_KEY_PRICE,
  FAILED_TO_WITHDRAW_FROM_LOCK,
} from '../../errors'

jest.mock('../../utils/promises')

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
  beforeEach(() => {
    nock.cleanAll()
    config = configure()
    providers = config.providers
    walletService = new WalletService(config)
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

    describe('smart contract has not been deployed on this network', () => {
      it('should not emit an error event when we have a contract address from config', done => {
        expect.assertions(3)
        config.unlockAddress = '0x1234567890123456789012345678901234567890'
        const walletService2 = new WalletService(config)

        expect(walletService2.ready).toBe(false)

        const netVersion = Math.floor(Math.random() * 100000)
        netVersionAndYield(netVersion)

        expect(walletService2.ready).toBe(false)

        expect(walletService2.unlockContractAddress).toBe(
          '0x1234567890123456789012345678901234567890'
        )

        walletService2.on('error', error => {
          expect(error).toBe('should not error')
          done()
        })
        walletService2.on('network.changed', () => {
          done()
        })

        walletService2.connect('HTTP')
      })

      it('should emit an error event when there is no config-provided contract address', done => {
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

    describe('getAccount', () => {
      describe('when the node has an unlocked account', () => {
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

      describe('when the node has no unlocked account', () => {
        it('should create an account and emit the ready event', done => {
          expect.assertions(2)
          const newAccount = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

          walletService.web3.eth.accounts.create = jest.fn(() => {
            return Promise.resolve({
              address: newAccount,
            })
          })

          accountsAndYield([])

          walletService.once('ready', () => {
            expect(walletService.ready).toBe(true)
            done()
          })

          walletService.on('account.changed', account => {
            expect(account).toBe('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')
          })

          return walletService.getAccount(true)
        })
      })

      describe('when the node has no unlocked account and when preventing from creating one', () => {
        it('should fail and mark the walletService is not ready', async () => {
          expect.assertions(1)
          walletService.ready = true
          accountsAndYield([])
          await walletService.getAccount(false)
          expect(walletService.ready).toBe(false)
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
        expect.assertions(4)
        const transactionHash = '0x123'

        walletService.on(
          'transaction.new',
          (hash, sender, recipient, input) => {
            expect(hash).toEqual(transactionHash)
            expect(sender).toEqual(from)
            expect(recipient).toEqual(to)
            expect(input).toEqual(data)
            done()
          }
        )

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
            gas: 2500000,
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

    describe('partialWithdrawFromLock', () => {
      let lock
      let account

      beforeEach(() => {
        lock = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
        account = '0xdeadbeef'
      })

      it('should invoke sendTransaction with the right params', done => {
        expect.assertions(4)
        const data = '' // mock abi data for partialWithdraw
        const cb = (args, cb) => {
          expect(args).toEqual({
            to: lock,
            from: account,
            data,
            gas: 1000000,
            contract: LockContract,
          })
          expect(cb).toBeInstanceOf(Function)
          done()
        }
        walletService._sendTransaction = cb

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(LockContract.abi)
            expect(address).toBe(lock)
            this.methods = {
              partialWithdraw: () => {
                return this
              },
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = ContractClass

        walletService.partialWithdrawFromLock(lock, account, '3')
      })

      it('should emit an error if the transaction cannot be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
          done()
        })

        walletService.partialWithdrawFromLock(lock, account, '3')
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
