import { ethers } from 'ethers'
import http from 'http'
import NockHelper from './helpers/nockHelper'

import v4 from '../v4'
import v6 from '../v6'
import v7 from '../v7'
import v8 from '../v8'

import utils from '../utils'
import WalletService from '../walletService'
import { GAS_AMOUNTS } from '../constants'

const supportedVersions = [v4, v6, v7, v8]

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService

const unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
describe('WalletService (ethers)', () => {
  function resetTests() {
    nock.cleanAll()
    walletService = new WalletService()
    walletService.setUnlockAddress(unlockAddress)
  }
  const netVersion = Math.floor(Math.random() * 100000)
  async function resetTestsAndConnect(provider = endpoint) {
    nock.cleanAll()
    walletService = new WalletService()
    walletService.setUnlockAddress(unlockAddress)
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

    afterEach(() => {
      resetTests()
    })

    it('properly connects to the ethers jsonRpcProvider', async () => {
      expect.assertions(1)

      await resetTestsAndConnect()
      expect(walletService.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
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
          const req = http.request(options, (res) => {
            let responseString = ''

            res.on('data', (data) => {
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

    it('properly connect to the unlock provider without a signer supplied', async () => {
      expect.assertions(2)

      const signer = {}
      const provider = {
        isUnlock: true,
        getSigner: () => signer,
        getNetwork: () => Promise.resolve({ chainId: 1337 }),
      }
      await walletService.connect(provider)

      expect(walletService.provider).toBe(provider)
      expect(walletService.signer).toBe(signer)
    })

    it('properly connect to the unlock provider with a signer', async () => {
      expect.assertions(2)

      const signer = {}
      const provider = {
        isUnlock: true,
        getSigner: () => {
          'signer'
        },
        getNetwork: () => Promise.resolve({ chainId: 1337 }),
      }
      await walletService.connect(provider, signer)

      expect(walletService.provider).toBe(provider)
      expect(walletService.signer).toBe(signer)
    })
  })

  describe('once connected', () => {
    beforeEach(() => {
      resetTests()
    })

    describe('isUnlockContractDeployed', () => {
      it('should yield true if the opCode is not 0x', async (done) => {
        expect.assertions(2)
        await resetTestsAndConnect()
        nock.ethGetCodeAndYield(unlockAddress, '0xdeadbeef')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(true)
          done()
        })
      })

      it('should yield false if the opCode is 0x', async (done) => {
        expect.assertions(2)
        await resetTestsAndConnect()
        nock.ethGetCodeAndYield(unlockAddress, '0x')

        walletService.isUnlockContractDeployed((error, isDeployed) => {
          expect(error).toBe(null)
          expect(isDeployed).toBe(false)
          done()
        })
      })

      it('should yield an error if we could not retrieve the opCode', async (done) => {
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
      describe('when the node has an unlocked account', () => {
        it('should load a local account and emit the ready event', async (done) => {
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

          walletService.on('account.changed', (address) => {
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
        walletService.on('transaction.pending', (transactionType) => {
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
        const myPromise = new Promise((resolve) => {
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
            .then((thing) => {
              cb(null, thing)
              return thing
            })
        }
        await nock.resolveWhenAllNocksUsed()
      }

      it('should use unformattedSignTypedData', async (done) => {
        expect.assertions(3)
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

        walletService.unformattedSignTypedData = jest.fn(() =>
          Promise.resolve(hash)
        )

        await walletService.signData(unlockAddress, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          expect(walletService.unformattedSignTypedData).toHaveBeenCalledWith(
            unlockAddress,
            []
          )
          done()
        })
      })

      it('should use eth_signTypedData and stringify the data for non-MetaMask wallets', async (done) => {
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

      it('should yield an error if there was a network error', async (done) => {
        expect.assertions(1)
        const hash =
          '0xdc8727bb847aebb19e4b2efa955b9b2c59192fd4656b6fe64bd61c09d8edb6d1'
        const error = { code: 404, message: 'oops' }

        await resetTestsAndConnect()
        data = []
        nock.ethSignTypedDataAndYield(unlockAddress, data, hash, error)

        await walletService.signData(unlockAddress, data, (error) => {
          expect(error).toBeInstanceOf(Error)
          done()
        })
      })
    })

    describe('signDataPersonal', () => {
      it('dispatches the request to personally sign the data for non-http providers', async (done) => {
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

      it('dispatches the request to personally sign the data for the unlock-provider', async (done) => {
        expect.assertions(2)
        await resetTestsAndConnect()
        const data = 'data to be signed'
        const account = '0xd4bb4b501ac12f35db35d60c845c8625b5f28fd1'
        const hash = utils.utf8ToHex('data to be signed')
        const returned = Buffer.from('stuff').toString('base64')
        walletService.provider.isUnlock = true

        nock.accountsAndYield([account])
        nock.personalSignAndYield(hash, account, 'stuff')

        walletService.signDataPersonal(account, data, (error, result) => {
          expect(error).toBeNull()
          expect(result).toBe(returned)
          done()
        })
      })

      it('calls eth_sign for http providers', async (done) => {
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

      it('calls the callback with any error', async (done) => {
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

    describe('unformattedSignTypedData', () => {
      const userAddress = '0x123'
      const data = { hello: 'world' }
      it('should try several method and return the result of the first one which succeeds', async () => {
        expect.assertions(2)
        const signature = 'signature'
        walletService.provider = {
          send: jest.fn((method) => {
            if (method === 'eth_signTypedData') {
              return Promise.reject(new Error())
            }
            return Promise.resolve(signature)
          }),
        }
        const result = await walletService.unformattedSignTypedData(
          userAddress,
          data
        )
        expect(walletService.provider.send).toHaveBeenCalledTimes(2)
        expect(result).toEqual(signature)
      })
      it('should fail if all methods fail', async () => {
        expect.assertions(5)
        walletService.provider = {
          send: jest.fn(() => {
            return Promise.reject(new Error())
          }),
        }
        try {
          await walletService.unformattedSignTypedData(userAddress, data)
        } catch (error) {
          expect(true).toBe(true) // This should have been called as unformattedSignTypedData fails
        }
        expect(walletService.provider.send).toHaveBeenCalledTimes(3)
        expect(walletService.provider.send).toHaveBeenNthCalledWith(
          1,
          'eth_signTypedData',
          ['0x123', { hello: 'world' }]
        )
        expect(walletService.provider.send).toHaveBeenNthCalledWith(
          2,
          'eth_signTypedData_v3',
          ['0x123', '{"hello":"world"}']
        )
        expect(walletService.provider.send).toHaveBeenNthCalledWith(
          3,
          'eth_signTypedData_v4',
          ['0x123', '{"hello":"world"}']
        )
      })
    })
  })

  describe('setKeyMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      await resetTestsAndConnect()
      window.fetch = jest.fn().mockResolvedValue({ status: 202 })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xlockAddress',
      keyId: '1',
      metadata: {
        color: 'blue',
        bestBandNamedAfterAPlace: 'Chicago',
      },
      locksmithHost: 'https://locksmith',
    }

    it('sends the request to the correct URL', async (done) => {
      expect.assertions(3)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toBe(true)
        done()
      }

      await walletService.setKeyMetadata(options, callback)

      expect(window.fetch).toHaveBeenCalledWith(
        'https://locksmith/api/key/0xlockAddress/1',
        {
          method: 'PUT',
          headers: {
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        }
      )
    })

    it('calls back with an error if something goes wrong', async (done) => {
      expect.assertions(0)

      window.fetch = jest.fn().mockResolvedValue({ status: 503 })
      const callback = (error) => {
        if (error) {
          done()
        }
      }

      await walletService.setKeyMetadata(options, callback)
    })
  })

  describe('setUserMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      await resetTestsAndConnect()
      window.fetch = jest.fn().mockResolvedValue({ status: 202 })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xlockAddress',
      userAddress: '0xuseraddress',
      metadata: {
        publicData: {},
        protectedData: {},
      },
      locksmithHost: 'https://locksmith',
    }

    it('sends the request to the correct URL', async (done) => {
      expect.assertions(3)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toBe(true)
        done()
      }

      await walletService.setUserMetadata(options, callback)

      expect(window.fetch).toHaveBeenCalledWith(
        'https://locksmith/api/key/0xlockAddress/user/0xuseraddress',
        {
          method: 'PUT',
          headers: {
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        }
      )
    })

    it('calls back with an error if something goes wrong', async (done) => {
      expect.assertions(0)

      window.fetch = jest.fn().mockResolvedValue({ status: 503 })
      const callback = (error) => {
        if (error) {
          done()
        }
      }

      await walletService.setUserMetadata(options, callback)
    })
  })

  describe('getKeyMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      await resetTestsAndConnect()
      window.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ metadata: 'value' }) })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xsomething',
      keyId: '1',
      locksmithHost: 'https://locksmith',
    }

    const expectedUrl = `${options.locksmithHost}/api/key/${options.lockAddress}/${options.keyId}`

    it('should callback with the json in the response on success', (done) => {
      expect.assertions(2)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toEqual({ metadata: 'value' })
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should callback with an error on error', (done) => {
      expect.assertions(2)

      window.fetch = jest.fn().mockRejectedValue('fail')

      const callback = (error, value) => {
        expect(value).toBeNull()
        expect(error).toEqual('fail')
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should not pass along a signature if getProtectedData is not specified', (done) => {
      expect.assertions(1)

      const callback = () => {
        expect(window.fetch).toHaveBeenCalledWith(expectedUrl, {
          method: 'GET',
          accept: 'json',
        })
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should pass along the signature if getProtectedData is specified', (done) => {
      expect.assertions(1)

      const callback = () => {
        expect(window.fetch).toHaveBeenCalledWith(expectedUrl, {
          method: 'GET',
          accept: 'json',
          Authorization: expect.any(String),
        })
        done()
      }

      walletService.getKeyMetadata(
        {
          ...options,
          getProtectedData: true,
        },
        callback
      )
    })
  })

  describe('versions', () => {
    const versionSpecificUnlockMethods = ['createLock']

    it.each(versionSpecificUnlockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        await resetTestsAndConnect()
        const args = []
        const result = {}
        const version = {
          [method](_args) {
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
      async (method) => {
        expect.assertions(3)
        const args = [
          {
            lockAddress: '0x123',
          },
        ]
        const result = {}
        const version = {
          [method](_args) {
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
      (version) => {
        expect.assertions(4)
        versionSpecificUnlockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
