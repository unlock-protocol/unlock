/* eslint no-console: 0 */
import Web3 from 'web3'
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

        nock.ethGetCodeAndYield(unlockAddress, '0x', err)
        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBeInstanceOf(Error)
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
        it('should leave the service in a non-ready state', () => {
          expect.assertions(1)

          // this test checks to make sure we create a new account if the node
          // returns no accounts, and so the accountsAndYield call must return []
          nock.accountsAndYield([])

          walletService.getAccount()
          expect(walletService.ready).toBe(false)
        })
      })
    })

    describe('sendTransaction', () => {
      const to = '0x0987654321098765432109876543210987654321'
      const from = '0x1234567890123456789012345678901234567890'
      const data = ''
      const value = ''
      const gas = '0x1234'
      const privateKey = null
      const contract = {
        abi: [],
      }
      const transaction = {
        status: 'mined',
        createdAt: new Date().getTime(),
        hash:
          '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
      }

      afterEach(() => {
        nock.ensureAllNocksUsed()
      })

      it('should handle cases where the transaction is sent via a provider', async () => {
        expect.assertions(0)

        nock.ethGasPriceAndYield('0x123')
        nock.ethSendTransactionAndYield(
          { to, from, data, value: '0x0', gas },
          '0x123',
          transaction.hash
        )
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

        await walletService._sendTransaction(
          { to, from, data, value, gas, privateKey, contract },
          'type',
          () => {}
        )

        // in the place of assertions, we explicitly verify that all of the JSON-RPC
        // calls were completed in the exact order specified above, and that all
        // of them were called, and nothing else
        nock.ensureAllNocksUsed()
      })

      describe('success', () => {
        beforeEach(() => {
          nock.ethGasPriceAndYield('0x123')
          nock.ethSendTransactionAndYield(
            { to, from, data, value: '0x0', gas },
            '0x123',
            transaction.hash
          )
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
        })

        it('should trigger the transaction.pending event', async () => {
          expect.assertions(1)
          walletService.on('transaction.pending', type => {
            expect(type).toBe('type')
          })
          await walletService._sendTransaction(
            { to, from, data, value, gas, privateKey, contract },
            'type',
            () => {}
          )
        })

        it('should trigger the transaction.new event', async () => {
          expect.assertions(6)

          walletService.on(
            'transaction.new',
            (hash, sender, recipient, input, type, status) => {
              expect(hash).toEqual(transaction.hash)
              expect(sender).toEqual(from)
              expect(recipient).toEqual(to)
              expect(input).toEqual(data)
              expect(type).toEqual('type')
              expect(status).toEqual('submitted')
            }
          )

          await walletService._sendTransaction(
            { to, from, data, value, gas, privateKey, contract },
            'type',
            () => {}
          )
        })

        it('should callback with the hash', async () => {
          expect.assertions(1)
          await walletService._sendTransaction(
            { to, from, data, value, gas, privateKey, contract },
            'type',
            (error, hash) => {
              expect(hash).toEqual(transaction.hash)
            }
          )
        })
      })

      describe('failure', () => {
        const error = new Error('oops')
        beforeEach(() => {
          nock.ethGasPriceAndYield('0x123')
          nock.ethSendTransactionAndYield(
            { to, from, data, value: '0x0', gas },
            '0x123',
            transaction.hash,
            error
          )
        })

        it('should callback with error if there was any', async () => {
          expect.assertions(2)

          try {
            await walletService._sendTransaction(
              { to, from, data, value, gas, privateKey, contract },
              'type',
              error => {
                expect(error).toBe(error)
              }
            )
          } catch (err) {
            expect(err).toBeInstanceOf(Error)
          }
        })
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

    describe('signDataPersonal', () => {
      it('dispatches the request to personally sign the data to the corresponding web3 method', done => {
        expect.assertions(1)
        let data = 'data to be signed'
        let account = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'

        walletService.web3.eth.sign = jest
          .fn()
          .mockReturnValueOnce('a signature')

        walletService.signDataPersonal(account, data, () => {
          expect(walletService.web3.eth.sign).toBeCalledWith(data, account)
          done()
        })
      })
    })

    describe('recoverAccountFromSignedData', () => {
      it('returns the signing address', async () => {
        expect.assertions(2)

        const data = 'hello world'
        const signature =
          '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
          '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
          '1c'

        walletService.web3.eth.personal.ecRecover = jest.fn(() => '0x123')
        const callback = jest.fn()

        await walletService.recoverAccountFromSignedData(
          data,
          signature,
          callback
        )

        expect(walletService.web3.eth.personal.ecRecover).toBeCalledWith(
          data,
          signature
        )

        expect(callback).toBeCalledWith(null, '0x123')
      })
    })
  })

  describe('versions', () => {
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

    const versionSpecificLockMethods = [
      'updateKeyPrice',
      'withdrawFromLock',
      'partialWithdrawFromLock',
      'purchaseKey',
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

    // for each supported version, let's make sure it implements all methods
    const supportedVersions = [v0, v01, v02]
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificUnlockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
        versionSpecificLockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
