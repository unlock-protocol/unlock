import { ethers } from 'ethers'
import http from 'http'
import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import utils from '../utils'
import erc20 from '../erc20'

import v4 from '../v4'
import v6 from '../v6'
import v7 from '../v7'
import v8 from '../v8'

const supportedVersions = [v4, v6, v7, v8]

const readOnlyProvider = 'http://127.0.0.1:8545'
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'

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

    it('should emit an error on error', async (done) => {
      expect.assertions(1)
      await nockBeforeEach({})
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef', {
        code: 404,
      })

      web3Service.on('error', (e) => {
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

      web3Service.on('error', (err) => {
        throw err // this is the only way we will see test failures!
      })

      const addressBalance = await web3Service.refreshAccountBalance(account)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('generateLockAddress', () => {
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

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
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
      (version) => {
        expect.assertions(1)
        versionSpecificLockMethods.forEach((method) => {
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
