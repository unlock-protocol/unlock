import { ethers } from 'ethers'
import http from 'http'
import NockHelper from './helpers/nockHelper'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'
import v10 from '../v10'
import v11 from '../v11'

import utils from '../utils'
import WalletService from '../walletService'
import { GAS_AMOUNTS } from '../constants'
import UnlockProvider from '../unlockProvider'

const encryptedPrivateKey = {
  version: 3,
  id: 'edbe0942-593b-4027-8688-07b7d3ec56c5',
  address: '0272742cbe9b4d4c81cffe8dfc0c33b5fb8893e5',
  crypto: {
    ciphertext:
      '6f2a3ed499a2962cc48e6f7f0a90a0c817c83024cc4878f624ad251fccd0b706',
    cipherparams: { iv: '69f031944591eed34c4d4f5841d283b0' },
    cipher: 'aes-128-ctr',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      salt: '5ac866336768f9613a505acd18dab463f4d10152ffefba5772125f5807539c36',
      n: 8192,
      r: 8,
      p: 1,
    },
    mac: 'cc8efad3b534336ecffc0dbf6f51fd558301873d322edc6cbc1c9398ee0953ec',
  },
}

const password = 'guest'

const supportedVersions = [v0, v01, v02, v10, v11]

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService

let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
describe('WalletService (ethers)', () => {
  function resetTests() {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
  }
  const netVersion = Math.floor(Math.random() * 100000)
  async function resetTestsAndConnect(provider = endpoint) {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
    nock.netVersionAndYield(netVersion)

    await walletService.connect(provider)
    await nock.resolveWhenAllNocksUsed()
  }

  describe('gasAmountConstants', () => {
    it('returns GAS_AMOUNTS', () => {
      expect.assertions(1)

      expect(WalletService.gasAmountConstants()).toBe(GAS_AMOUNTS)
    })
  })

  describe('connect', () => {
    beforeEach(() => {
      resetTests()
    })

    it('properly connects to the ethers jsonRpcProvider', async () => {
      expect.assertions(1)

      await resetTestsAndConnect()
      expect(walletService.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('properly connects to the unlock provider', async () => {
      expect.assertions(1)
      await resetTestsAndConnect(
        new UnlockProvider({ readOnlyProvider: endpoint })
      )
      expect(walletService.provider.isUnlock).toBeTruthy()
    })

    it('properly connects to the ethers Web3Provider', async () => {
      expect.assertions(1)

      await resetTestsAndConnect({
        sendAsync(params, callback) {
          const data = JSON.stringify(params)
          const options = {
            host: '127.0.0.1',
            port: 8545,
            method: 'POST',
            path: '/',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length,
            },
          }
          const req = http.request(options, res => {
            var responseString = ''

            res.on('data', data => {
              responseString += data
              // save all the data from response
            })
            res.on('end', () => {
              callback(null, JSON.parse(responseString))
              // print to console when response ends
            })
          })
          req.write(JSON.stringify(params))
          req.end()
        }, // a web3 provider must have sendAsync as a minimum
      })
      expect(walletService.provider).toBeInstanceOf(
        ethers.providers.Web3Provider
      )
    })
  })

  describe('once connected', () => {
    describe('isUnlockContractDeployed', () => {
      it('should yield true if the opCode is not 0x', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()
        nock.ethGetCodeAndYield(unlockAddress, '0xdeadbeef')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(true)
          done()
        })
      })

      it('should yield false if the opCode is 0x', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()
        nock.ethGetCodeAndYield(unlockAddress, '0x')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(false)
          done()
        })
      })

      it('should yield an error if we could not retrieve the opCode', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()
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
      describe('when using UnlockProvider', () => {
        let provider
        beforeAll(async () => {
          provider = new UnlockProvider({ readOnlyProvider: endpoint })
          await resetTestsAndConnect(provider)
          await provider.connect({
            key: encryptedPrivateKey,
            password,
            emailAddress: 'geoff@bitconnect.gov',
          })
        })

        it('should emit an account, email, and ready event', done => {
          expect.assertions(3)
          walletService.once('ready', () => {
            expect(walletService.ready).toBe(true)
            done()
          })

          walletService.on('account.changed', address => {
            expect(address).toEqual(
              '0x0272742CbE9b4D4C81cFFE8dFC0c33B5fb8893E5'
            )
          })

          walletService.on('account.updated', update => {
            expect(update.emailAddress).toEqual('geoff@bitconnect.gov')
          })

          walletService.getAccount()
        })
      })

      describe('when the node has an unlocked account', () => {
        it('should load a local account and emit the ready event', async done => {
          expect.assertions(2)
          await resetTestsAndConnect()
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

          walletService.on('account.updated', () => {
            // This event should not be emitted
            expect(false).toBeTruthy()
          })

          walletService.getAccount()
        })
      })

      describe('when the node has no unlocked account', () => {
        it('should leave the service in a non-ready state', async () => {
          expect.assertions(1)
          await resetTestsAndConnect()

          // this test checks to make sure we create a new account if the node
          // returns no accounts, and so the accountsAndYield call must return []
          nock.accountsAndYield([])

          walletService.getAccount()
          expect(walletService.ready).toBe(false)
        })
      })
    })

    describe('_handleMethodCall', () => {
      const transaction = {
        hash: 'hash',
        from: 'from',
        to: 'to',
        data: 'data',
      }
      const inBetweenTransaction = {
        hash: 'hash',
        from: 'from',
        to: 'to',
        data: 'data',
        wait: () => Promise.resolve(transaction),
      }

      it('emits transaction.pending with transaction type', async () => {
        expect.assertions(1)

        await resetTestsAndConnect()
        walletService.on('transaction.pending', transactionType => {
          expect(transactionType).toBe('transactionType')
        })

        await walletService._handleMethodCall(
          Promise.resolve(inBetweenTransaction),
          'transactionType'
        )
      })

      it('retrieves transaction hash from the method call', async () => {
        expect.assertions(1)

        await resetTestsAndConnect()
        let myResolve
        const myPromise = new Promise(resolve => {
          myResolve = jest.fn(resolve)
          myResolve(inBetweenTransaction)
        })

        await walletService._handleMethodCall(myPromise, 'transactionType')

        expect(myResolve).toHaveBeenCalled()
      })

      it('emits transaction.new with the transaction information', async () => {
        expect.assertions(6)

        await resetTestsAndConnect()
        walletService.on(
          'transaction.new',
          (hash, from, to, data, transactionType, status) => {
            expect(hash).toBe(transaction.hash)
            expect(from).toBe(transaction.from)
            expect(to).toBe(transaction.to)
            expect(data).toBe(transaction.data)
            expect(transactionType).toBe('transactionType')
            expect(status).toBe('submitted')
          }
        )

        await walletService._handleMethodCall(
          Promise.resolve(inBetweenTransaction),
          'transactionType'
        )
      })

      it('throws on failure', async () => {
        expect.assertions(1)
        await resetTestsAndConnect()

        const oops = new Error('failed for some reason')

        try {
          await walletService._handleMethodCall(
            Promise.reject(oops),
            'transactionType'
          )
        } catch (e) {
          expect(e).toBe(oops)
        }
      })
    })

    describe('signData', () => {
      let data = 'please sign me'
      let metamask
      async function metamaskBeforeEach() {
        nock.netVersionAndYield(0)
        metamask = new ethers.providers.JsonRpcProvider(endpoint)
        // jerry-rig a fake web3 metamask provider
        metamask.sendAsync = (stuffToSend, cb) => {
          return ethers.utils
            .fetchJson(metamask.connection, JSON.stringify(stuffToSend))
            .then(thing => {
              cb(null, thing)
              return thing
            })
        }
        metamask.isMetaMask = true
        await nock.resolveWhenAllNocksUsed()
      }

      it('should use eth_signTypedData_v3 and stringify for Metamask wallets', async done => {
        expect.assertions(2)
        const hash =
          '0xdc8727bb847aebb19e4b2efa955b9b2c59192fd4656b6fe64bd61c09d8edb6d1'
        const returned = Buffer.from(hash).toString('base64')

        await metamaskBeforeEach()
        await resetTestsAndConnect(metamask)
        data = []
        // eth_signTypedData_v3 expects the data to be a JSON string
        nock.ethSignTypedDatav3AndYield(
          unlockAddress,
          JSON.stringify(data),
          hash
        )

        await walletService.signData(unlockAddress, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          done()
        })
      })

      it('should use eth_signTypedData and stringify the data for non-MetaMask wallets', async done => {
        expect.assertions(2)
        const hash =
          '0xdc8727bb847aebb19e4b2efa955b9b2c59192fd4656b6fe64bd61c09d8edb6d1'
        const returned = Buffer.from(hash).toString('base64')

        await resetTestsAndConnect()
        data = []
        nock.ethSignTypedDataAndYield(unlockAddress, data, hash)

        await walletService.signData(unlockAddress, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          done()
        })
      })

      it('should yield an error if there was a network error', async done => {
        expect.assertions(1)
        const hash =
          '0xdc8727bb847aebb19e4b2efa955b9b2c59192fd4656b6fe64bd61c09d8edb6d1'
        const error = { code: 404, message: 'oops' }

        await resetTestsAndConnect()
        data = []
        nock.ethSignTypedDataAndYield(unlockAddress, data, hash, error)

        await walletService.signData(unlockAddress, data, error => {
          expect(error).toBeInstanceOf(Error)
          done()
        })
      })
    })

    describe('signDataPersonal', () => {
      it('dispatches the request to personally sign the data for non-http providers', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()
        const data = 'data to be signed'
        const account = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'
        const hash = utils.utf8ToHex('data to be signed')
        const returned = Buffer.from('stuff').toString('base64')
        walletService.web3Provider = true // trigger the call to personalSign

        nock.accountsAndYield([account])
        nock.personalSignAndYield(hash, account, 'stuff')

        walletService.signDataPersonal(account, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          done()
        })
      })

      it('calls eth_sign for http providers', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()
        const data = 'data to be signed'
        const account = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'
        const hash = utils.utf8ToHex('data to be signed')
        const returned = Buffer.from('stuff').toString('base64')

        nock.accountsAndYield([account])
        nock.ethSignAndYield(hash, account, 'stuff')

        walletService.signDataPersonal(account, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          done()
        })
      })

      it('calls the callback with any error', async done => {
        expect.assertions(2)
        await resetTestsAndConnect()

        const data = 'data to be signed'
        const account = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'
        const hash = utils.utf8ToHex('data to be signed')
        const error = { code: 404, message: 'oops' }

        nock.accountsAndYield([account])
        nock.personalSignAndYield(hash, account, 'stuff', error)

        walletService.signDataPersonal(account, data, (error, result) => {
          expect(result).toBeNull()
          expect(error).toBeInstanceOf(Error)
          done()
        })
      })
    })
  })

  describe('versions', () => {
    const versionSpecificUnlockMethods = ['createLock']

    it.each(versionSpecificUnlockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        await resetTestsAndConnect()
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
      'purchaseKey',
      'withdrawFromLock',
      'updateKeyPrice',
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
