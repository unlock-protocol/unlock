import { ethers, utils as ethersUtils } from 'ethers'
import http from 'http'

import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import utils from '../utils'
import erc20 from '../erc20'

import v0 from '../v0'
import v1 from '../v1'
import v2 from '../v2'
import v3 from '../v3'
import v4 from '../v4'
import v5 from '../v5'
import v6 from '../v6'
import v7 from '../v7'

const supportedVersions = [v0, v1, v2, v3, v4, v5, v6, v7]

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
  async function nockBeforeEach({ endpoint = readOnlyProvider, network } = {}) {
    nock.cleanAll()
    // Ethers will only get the network id if none is passed
    if (!network) {
      nock.netVersionAndYield(1)
    }
    web3Service = new Web3Service({
      readOnlyProvider: endpoint,
      unlockAddress,
      blockTime,
      requiredConfirmations,
      network,
    })
    return nock.resolveWhenAllNocksUsed()
  }

  describe('setup', () => {
    it('should set up a JsonRpcProvider for a string endpoint', async () => {
      expect.assertions(1)

      await nockBeforeEach({})

      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('should set up a JsonRpcProvider for a string endpoint with a network', async () => {
      expect.assertions(2)

      await nockBeforeEach({ network: 1337 })
      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
      expect(web3Service.provider._network.chainId).toEqual(1337)
    })

    it('should set up a Web3Provider for a web3 provider endpoint', async () => {
      expect.assertions(1)
      // Endpoint is a web3 provider
      const endpoint = {
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
            let responseString = ''

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
      }
      await nockBeforeEach({ endpoint })
      expect(web3Service.provider).toBeInstanceOf(ethers.providers.Web3Provider)
    })
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      const addressBalance = await web3Service.getAddressBalance(address)
      expect(addressBalance).toEqual(expectedBalance)
    })

    it('should emit an error on error', async done => {
      expect.assertions(1)
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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

      const addressBalance = await web3Service.refreshAccountBalance(account)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('generateLockAddress', () => {
    describe('when deployed a v5 lock', () => {
      it('generates the correct address from the template contract', async () => {
        expect.assertions(1)
        await nockBeforeEach({})

        const owner = '0x123'
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return {
            version: 'v5',
          }
        })
        const unlockContact = {
          publicLockAddress: jest.fn(() => {
            return Promise.resolve('0xFA7001A0310B5E69B7b95B72aeBaA66C72E084bf')
          }),
        }
        web3Service.getUnlockContract = jest.fn(() => {
          return Promise.resolve(unlockContact)
        })

        expect(
          await web3Service.generateLockAddress(owner, {
            name: 'My create2 Lock',
          })
        ).toBe('0xC37f72615fb8DAD1ecB055c5DEb2c7d786D8f1f5')
      })
    })

    describe('_create2Address', () => {
      it('should compute the correct address', async () => {
        expect.assertions(1)
        await nockBeforeEach({})
        const unlockAddress = '0xBe6ed9A686D288f23C721697e828480E13d138F2'
        const templateAddress = '0x842207a6a95A0455415db073352d18eB54C728a8'
        const account = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        const lockSalt = '1d24dcf6d1c86a947c0e9563'
        expect(
          web3Service._create2Address(
            unlockAddress,
            templateAddress,
            account,
            lockSalt
          )
        ).toEqual('0x1c3c3E32878905490eDDFa7c98C47E6EBb003541')
      })
    })

    describe('when deploying an older lock', () => {
      // TODO: remove this once upgrade to v5 is done
      it('generates the correct address from nonce and contract address', async () => {
        expect.assertions(3)
        await nockBeforeEach({})
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return {
            version: 'v4',
          }
        })
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})

      const Contract = {
        contractName: 'WhoDat',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')
      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for unknown Unlock method', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const Contract = {
        contractName: 'Unlock',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')

      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for invalid data', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})
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
      await nockBeforeEach({})
      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v0))
      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve(100)
        })
      })

      const lock = await web3Service.getKeyByLockForOwner(lockAddress, account)
      expect(lock).toEqual({
        expiration: 100,
        lock: '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e',
        owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      })
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        await nockBeforeEach({})
        const args = []
        const result = {}
        const version = {
          [method](_args) {
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
