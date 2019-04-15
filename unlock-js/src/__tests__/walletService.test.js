/* eslint no-console: 0 */
import Web3 from 'web3'
import EventEmitter from 'events'
import nock from 'nock'
import Web3Utils from 'web3-utils'
import * as UnlockV0 from 'unlock-abi-0'

import WalletService from '../walletService'
import { GAS_AMOUNTS } from '../constants'
import Errors from '../errors'

import TransactionTypes from '../transactionTypes'

const { FAILED_TO_UPDATE_KEY_PRICE, FAILED_TO_WITHDRAW_FROM_LOCK } = Errors

const endpoint = 'http://127.0.0.1:8545'
const nockScope = nock(endpoint, { encodedQueryParams: true })
const provider = new Web3.providers.HttpProvider(endpoint)

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

// eth_getCode
const ethGetCodeAndYield = (address, opCode) => {
  return jsonRpcRequest(
    'eth_getCode',
    [address.toLowerCase(), 'latest'],
    opCode
  )
}

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

let walletService

let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
describe('WalletService', () => {
  beforeEach(() => {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
    // Tests for v0!
    walletService.opCodeForAddress[unlockAddress] =
      UnlockV0.Unlock.deployedBytecode
  })

  describe('connect', () => {
    it('should get the network id', done => {
      expect.assertions(1)

      const netVersion = Math.floor(Math.random() * 100000)
      netVersionAndYield(netVersion)

      UnlockV0.Unlock.networks = {
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

      walletService.connect(provider)
    })
  })

  describe('once connected', () => {
    const netVersion = Math.floor(Math.random() * 100000)

    beforeEach(done => {
      netVersionAndYield(netVersion)

      UnlockV0.Unlock.networks = {
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
      return walletService.connect(provider)
    })

    describe('isUnlockContractDeployed', () => {
      it('should yield true if the opCode is not 0x', done => {
        expect.assertions(2)
        ethGetCodeAndYield(unlockAddress, '0xdeadbeef')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(true)
          done()
        })
      })

      it('should yield false if the opCode is 0x', done => {
        expect.assertions(2)
        ethGetCodeAndYield(unlockAddress, '0x')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(false)
          done()
        })
      })

      it('should yield an error if we could not retrieve the opCode', done => {
        expect.assertions(2)
        const err = new Error('getCode failed')
        walletService.web3.eth.getCode = jest.fn(() => {
          throw err
        })
        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(err)
          expect(isDeployed).toBe(undefined)
          done()
        })
      })
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
          'type',
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
        walletService.on('transaction.pending', type => {
          expect(type).toBe('type')
          done()
        })
        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          'type',
          () => {}
        )
      })

      it('should trigger the transaction.new event', done => {
        expect.assertions(6)
        const transactionHash = '0x123'

        walletService.on(
          'transaction.new',
          (hash, sender, recipient, input, type, status) => {
            expect(hash).toEqual(transactionHash)
            expect(sender).toEqual(from)
            expect(recipient).toEqual(to)
            expect(input).toEqual(data)
            expect(type).toEqual('type')
            expect(status).toEqual('submitted')
            done()
          }
        )

        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          'type',
          () => {}
        )

        mockTransaction.emit('transactionHash', transactionHash)
      })

      it('should callback with the hash', done => {
        expect.assertions(1)
        const transactionHash = '0x123'
        walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          'type',
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
          'type',
          error => {
            expect(error).toBe(error)
            done()
          }
        )

        mockTransaction.emit('error', error)
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

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV0.PublicLock.abi)
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
            gas: GAS_AMOUNTS.updateKeyPrice,
            contract: UnlockV0.PublicLock,
          },
          TransactionTypes.UPDATE_KEY_PRICE,
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, type, cb) => {
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
      let data = 'please sign me'

      describe('if the provider is metamask', () => {
        it('should use eth_signTypedData_v3 and stringify the data', done => {
          expect.assertions(2)
          data = []
          const mockProvider = {
            isMetaMask: true,
            send: jest.fn((args, cb) => {
              expect(args.method).toBe('eth_signTypedData_v3')
              expect(args.params[1]).toBe(JSON.stringify(data))
              return cb(null, { result: '' })
            }),
          }
          walletService.web3.currentProvider = mockProvider
          walletService.signData(account, data, () => {
            done()
          })
        })
      })

      it('should send the the method to the provider with the right params and yield the signature when it is not metamask (legacy/opaque signing)', done => {
        expect.assertions(5)
        const result = 'RESULT'
        const mockProvider = {
          send: jest.fn((args, cb) => {
            expect(args.method).toBe('eth_signTypedData')
            expect(args.params[0]).toBe(account)
            expect(args.params[1]).toBe(data)
            expect(args.from).toBe(account)
            return cb(null, {
              result,
            })
          }),
        }
        walletService.web3.currentProvider = mockProvider

        walletService.signData(account, data, (error, signature) => {
          expect(signature).toBe(Buffer.from(result).toString('base64'))
          done()
        })
      })

      it('should yield an error if there was a network error', done => {
        expect.assertions(1)
        const networkError = new Error('network')

        const mockProvider = {
          send: jest.fn((args, cb) => {
            return cb(networkError, null)
          }),
        }
        walletService.web3.currentProvider = mockProvider

        walletService.signData(account, data, error => {
          expect(error).toBe(networkError)
          done()
        })
      })

      it('should yield an error if there was a signature error', done => {
        expect.assertions(1)
        const signatureError = new Error('signature')

        const mockProvider = {
          send: jest.fn((args, cb) => {
            return cb(null, { error: signatureError })
          }),
        }
        walletService.web3.currentProvider = mockProvider

        walletService.signData(account, data, error => {
          expect(error).toBe(signatureError)
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
        expect.assertions(3)
        const data = '' // mock abi data for partialWithdraw

        walletService._sendTransaction = jest.fn(() => {
          done()
        })

        const MockContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV0.PublicLock.abi)
            expect(address).toBe(lock)
            this.methods = {
              partialWithdraw: () => this,
            }
            this.encodeABI = jest.fn(() => data)
          }
        }

        walletService.web3.eth.Contract = MockContractClass

        walletService.partialWithdrawFromLock(lock, account, '3', () => {
          done()
        })

        expect(walletService._sendTransaction).toHaveBeenCalledWith(
          {
            to: lock,
            from: account,
            data,
            gas: GAS_AMOUNTS.partialWithdrawFromLock,
            contract: UnlockV0.PublicLock,
          },
          TransactionTypes.WITHDRAWAL,
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction cannot be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, type, cb) => {
          return cb(error)
        })

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
          done()
        })

        walletService.partialWithdrawFromLock(lock, account, '3', () => {})
      })

      it('should not emit an error when `error` is falsy', done => {
        expect.assertions(1)
        const error = undefined

        walletService._sendTransaction = jest.fn((args, type, cb) => {
          return cb(error)
        })

        walletService.emit = jest.fn()

        walletService.partialWithdrawFromLock(lock, account, '3', () => {
          expect(walletService.emit).not.toHaveBeenCalled()
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

        const ContractClass = class {
          constructor(abi, address) {
            expect(abi).toBe(UnlockV0.PublicLock.abi)
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
            gas: GAS_AMOUNTS.withdrawFromLock,
            contract: UnlockV0.PublicLock,
          },
          TransactionTypes.WITHDRAWAL,
          expect.any(Function)
        )
      })

      it('should emit an error if the transaction could not be sent', done => {
        expect.assertions(1)
        const error = {}

        walletService._sendTransaction = jest.fn((args, type, cb) => {
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
