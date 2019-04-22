/* eslint no-console: 0 */
import Web3 from 'web3'
import EventEmitter from 'events'
import NockHelper from './helpers/nockHelper'

import WalletService from '../walletService'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, false /** debug */)

let walletService

let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
describe('WalletService', () => {
  beforeEach(() => {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
  })

  describe('connect', () => {
    it('should get the network id', done => {
      expect.assertions(1)

      const netVersion = Math.floor(Math.random() * 100000)
      nock.netVersionAndYield(netVersion)

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
      nock.netVersionAndYield(netVersion)

      walletService.on('network.changed', () => {
        done()
      })
      return walletService.connect(provider)
    })

    describe('isUnlockContractDeployed', () => {
      it('should yield true if the opCode is not 0x', done => {
        expect.assertions(2)
        nock.ethGetCodeAndYield(unlockAddress, '0xdeadbeef')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(true)
          done()
        })
      })

      it('should yield false if the opCode is 0x', done => {
        expect.assertions(2)
        nock.ethGetCodeAndYield(unlockAddress, '0x')

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

          nock.accountsAndYield(unlockAccountsOnNode)

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

          nock.accountsAndYield([])

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
          nock.accountsAndYield([])
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
  })

  describe('versions', () => {
    const versionSpecificLockMethods = [
      'updateKeyPrice',
      'purchaseKey',
      'partialWithdrawFromLock',
      'withdrawFromLock',
    ]

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [method]: function(_args) {
            // Needs to be a function because it is bound to walletService
            expect(this).toBe(walletService)
            expect(_args).toBe(...args)
            return result
          },
        }
        walletService.lockContractAbiVersion = jest.fn(() => version)
        const r = await walletService[method](...args)
        expect(r).toBe(result)
      }
    )

    const versionSpecificUnlockMethods = ['createLock']

    it.each(versionSpecificUnlockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [method]: function(_args) {
            // Needs to be a function because it is bound to walletService
            expect(this).toBe(walletService)
            expect(_args).toBe(...args)
            return result
          },
        }
        walletService.unlockContractAbiVersion = jest.fn(() => version)
        const r = await walletService[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    const supportedVersions = [v0, v01, v02]
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
