import { ethers, utils as ethersUtils } from 'ethers'
import http from 'http'

import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import utils from '../utils'
import erc20 from '../erc20'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'
import v10 from '../v10'
import v11 from '../v11'

const supportedVersions = [v0, v01, v02, v10, v11]

const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e'

const nock = new NockHelper(readOnlyProvider, false /** debug */)
let web3Service

jest.mock('../erc20.js', () => {
  return {
    getErc20Decimals: jest.fn(() => Promise.resolve(18)),
    getErc20BalanceForAddress: jest.fn(() => Promise.resolve('0x0')),
  }
})

describe('Web3Service', () => {
  async function nockBeforeEach(endpoint = readOnlyProvider) {
    nock.cleanAll()
    nock.netVersionAndYield(1)
    web3Service = new Web3Service({
      readOnlyProvider: endpoint,
      unlockAddress,
      blockTime,
      requiredConfirmations,
      useEthers: true,
    })
    return nock.resolveWhenAllNocksUsed()
  }

  describe('setup', () => {
    it('should set up a JsonRpcProvider for a string end point', async () => {
      expect.assertions(1)

      await nockBeforeEach()

      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('should set up a Web3Provider for a web3 provider endpoint', async () => {
      expect.assertions(1)

      await nockBeforeEach({
        send(params, callback) {
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
      expect(web3Service.provider).toBeInstanceOf(ethers.providers.Web3Provider)
    })
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      let addressBalance = await web3Service.getAddressBalance(address)
      expect(addressBalance).toEqual(expectedBalance)
    })

    it('should emit an error on error', async done => {
      expect.assertions(1)
      await nockBeforeEach()
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef', {
        code: 404,
      })

      web3Service.on('error', e => {
        expect(e).toBeInstanceOf(Error)
        done()
      })
      await web3Service.getAddressBalance(address)
    })
  })

  describe('refreshAccountBalance', () => {
    it("refreshes balance and emits 'account.updated'", async () => {
      expect.assertions(3)
      await nockBeforeEach()
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
      const account = {
        address,
        fromLocalStorage: true,
      }

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      web3Service.on('account.updated', (sentAccount, info) => {
        expect(sentAccount).toBe(account)
        expect(info).toEqual({
          balance: expectedBalance,
        })
      })

      web3Service.on('error', err => {
        throw err // this is the only way we will see test failures!
      })

      let addressBalance = await web3Service.refreshAccountBalance(account)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('_getPastTransactionsForContract', () => {
    it("should getPastEvents on the contract and emit 'transaction.new' for each event", async () => {
      expect.assertions(3)
      await nockBeforeEach()

      const logs = [
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
      web3Service.provider.getLogs = jest.fn(() => {
        return Promise.resolve(logs)
      })

      const filter = { a: 'b' }

      web3Service.once('transaction.new', transactionHash => {
        expect(transactionHash).toEqual(
          '0x8a7c22fe9bcb5ee44c06410c584139f96a2f5cff529866bbed615986100eb6bd'
        )
        expect(web3Service.provider.getLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            fromBlock: 0,
            toBlock: 'latest',
            a: 'b',
          })
        )
      })

      const ret = await web3Service._getPastTransactionsForContract(filter)
      expect(ret).toEqual(logs)
    })
  })

  describe('generateLockAddress', () => {
    it('generates the correct address from nonce and contract address', async () => {
      expect.assertions(3)
      await nockBeforeEach()

      nock.getTransactionCount(unlockAddress.toLowerCase(), 0)
      expect(await web3Service.generateLockAddress()).toBe(
        '0x0e518e6FD65557Ad4B289bF37786C0c0CE2A5DBE'
      )
      nock.getTransactionCount(unlockAddress.toLowerCase(), 1)
      expect(await web3Service.generateLockAddress()).toBe(
        '0xe564352cbD6a8c09feeD8EE62e1672EC6794B83a'
      )
      nock.getTransactionCount(unlockAddress.toLowerCase(), 2)
      expect(await web3Service.generateLockAddress()).toBe(
        '0xd3F4Df04bBE21E12e706eCc2b2A3bDEf0327d2bD'
      )
    })
  })

  describe('_watchTransaction', () => {
    let saveTimeout
    beforeEach(() => {
      saveTimeout = global.setTimeout
    })
    afterEach(() => {
      jest.clearAllMocks()
      jest.resetAllMocks()
      jest.restoreAllMocks()
      global.setTimeout = saveTimeout
    })

    it('calls setTimeout with a function that calls getTransaction', async () => {
      expect.assertions(2)
      nockBeforeEach()
      global.setTimeout = jest.fn()

      web3Service.getTransaction = jest.fn()

      web3Service._watchTransaction('hash')

      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        web3Service.blockTime / 2
      )
      setTimeout.mock.calls[0][0]()
      expect(web3Service.getTransaction).toHaveBeenCalledWith('hash')
    })
  })

  describe('_getTransactionType', () => {
    function getEncoder(abi, method) {
      const contractInterface = new ethersUtils.Interface(abi)
      return contractInterface.functions[method].encode.bind(
        contractInterface.functions[method]
      )
    }

    it('should return null for unknown contracts', async () => {
      expect.assertions(1)
      await nockBeforeEach()

      const Contract = {
        contractName: 'WhoDat',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')
      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for unknown Unlock method', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const Contract = {
        contractName: 'Unlock',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')

      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for invalid data', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const Contract = {
        contractName: 'Unlock',
        abi: ['hi() uint256'],
      }

      expect(
        web3Service._getTransactionType(Contract, 'this will not go over well')
      ).toBe(null)
    })

    it('should return null for unknown PublicLock method', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const Contract = {
        contractName: 'PublicLock',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')

      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })
  })

  describe('_getKeyByLockForOwner (non-version specific tests)', () => {
    it('should yield the expiration date for the user key on the lock', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.resolve('123')
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(123)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })

    it('should return 0 if the value returned by the contract is 3963877391197344453575983046348115674221700746820753546331534351508065746944', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.resolve(
            '3963877391197344453575983046348115674221700746820753546331534351508065746944'
          )
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })

    it('should return 0 if there was an exception', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.reject('Error')
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })
  })

  describe('getKeyByLockForOwner', () => {
    it('should trigger an event with the key', async () => {
      expect.assertions(4)
      await nockBeforeEach()
      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v0))
      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve(100)
        })
      })

      web3Service.on('key.updated', (keyId, update) => {
        expect(keyId).toBe([lockAddress, account].join('-'))
        expect(update.expiration).toBe(100)
        expect(update.lock).toBe(lockAddress)
        expect(update.owner).toBe(account)
      })
      await web3Service.getKeyByLockForOwner(lockAddress, account)
    })

    it("should return the lock's details", async () => {
      expect.assertions(1)
      await nockBeforeEach()
      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v0))
      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve(100)
        })
      })

      let lock = await web3Service.getKeyByLockForOwner(lockAddress, account)
      expect(lock).toEqual({
        expiration: 100,
        lock: '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e',
        owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      })
    })
  })

  describe('_emitKeyOwners', () => {
    it('resolves the promises and emits keys.page', async done => {
      expect.assertions(3)
      await nockBeforeEach()

      const keyPromises = [Promise.resolve(null), Promise.resolve('key')]

      web3Service.on('keys.page', (lock, page, keys) => {
        expect(lock).toBe(lockAddress)
        expect(page).toBe(2)
        expect(keys).toEqual(['key'])
        done()
      })

      web3Service._emitKeyOwners(lockAddress, 2, keyPromises)
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        await nockBeforeEach()
        const args = []
        const result = {}
        const version = {
          [method]: function(_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificLockMethods.forEach(method => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })

  describe('recoverAccountFromSignedData', () => {
    it('returns the signing address', async () => {
      expect.hasAssertions()

      const data = 'hello world'
      const account = '0x14791697260E4c9A71f18484C9f997B308e59325'
      const signature =
        '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
        '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
        '1c'

      const returnedAddress = await web3Service.recoverAccountFromSignedData(
        data,
        signature
      )

      expect(returnedAddress).toBe(account)
    })
  })

  describe('getTokenBalance', () => {
    it('should yield the token balance based on the decimals number', async () => {
      expect.assertions(3)

      erc20.getErc20BalanceForAddress = jest.fn(() => {
        return Promise.resolve('36042555786755496657')
      })
      erc20.getErc20Decimals = jest.fn(() => {
        return Promise.resolve(7)
      })
      const user = '0x123'
      const erc20Contract = '0xabc'
      const balance = await web3Service.getTokenBalance(erc20Contract, user)

      expect(balance).toBe('3604255578675.5496657')
      expect(erc20.getErc20BalanceForAddress).toHaveBeenCalledWith(
        erc20Contract,
        user,
        web3Service.provider
      )
      expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
        erc20Contract,
        web3Service.provider
      )
    })
  })
})
