import { ethers, utils as ethersUtils } from 'ethers'
import http from 'http'

import * as UnlockV0 from 'unlock-abi-0'
import * as UnlockV01 from 'unlock-abi-0-1'
import * as UnlockV02 from 'unlock-abi-0-2'

import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import TransactionTypes from '../transactionTypes'
import utils from '../utils.ethers'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

import { KEY_ID } from '../constants'

const supportedVersions = [v0, v01, v02]

const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e'

const nock = new NockHelper(
  readOnlyProvider,
  false /** debug */,
  true /** ethers */
)
let web3Service

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

  describe('ethers_setup', () => {
    it('should set up a JsonRpcProvider for a string end point', async () => {
      expect.assertions(1)

      await nockBeforeEach()

      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('should set up a Web3Provider for a web3 provider end point', async () => {
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

      let addressBalance = await web3Service.ethers_getAddressBalance(address)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('inputsHandlers', () => {
    describe('createLock', () => {
      it('should emit lock.updated with correctly typed values', async done => {
        expect.assertions(2)
        await nockBeforeEach()
        const params = {
          _expirationDuration: '7',
          _maxNumberOfKeys: '5',
          _keyPrice: '5',
        }
        web3Service.ethers_generateLockAddress = jest.fn()
        web3Service.on('lock.updated', (newLockAddress, update) => {
          expect(update.expirationDuration).toBe(7)
          expect(update.maxNumberOfKeys).toBe(5)
          done()
        })

        await web3Service.ethers_inputsHandlers.createLock(
          '0x123',
          '0x456',
          params
        )
      })

      it('createLock', async () => {
        expect.assertions(4)
        await nockBeforeEach()
        let resolveLockUpdater
        let resolveTransactionUpdater
        const fakeLockAddress = '0x123'
        const fakeParams = {
          _keyPrice: '100000000000000000',
          _expirationDuration: '123',
          _maxNumberOfKeys: '-1',
        }
        const fakeHash = '0x12345'

        const lockUpdater = new Promise(resolve => {
          resolveLockUpdater = resolve
        })
        const transactionUpdater = new Promise(resolve => {
          resolveTransactionUpdater = resolve
        })
        web3Service.ethers_generateLockAddress = () =>
          Promise.resolve(fakeLockAddress)

        web3Service.once('lock.updated', (lockAddress, params) => {
          expect(lockAddress).toBe(fakeLockAddress)
          expect(params).toEqual({
            transaction: fakeHash,
            address: fakeLockAddress,
            expirationDuration: 123,
            keyPrice: '0.1',
            maxNumberOfKeys: -1,
            outstandingKeys: 0,
            balance: '0',
          })
          resolveLockUpdater()
        })

        web3Service.once('transaction.updated', (transactionHash, params) => {
          expect(transactionHash).toBe(fakeHash)
          expect(params).toEqual({
            lock: fakeLockAddress,
          })
          resolveTransactionUpdater()
        })

        web3Service.ethers_inputsHandlers.createLock(
          fakeHash,
          web3Service.unlockContractAddress,
          fakeParams
        )
        await Promise.all([lockUpdater, transactionUpdater])
      })
    })

    it('purchaseFor', async () => {
      expect.assertions(4)
      await nockBeforeEach()
      let resolveKeySaver
      let resolveTransactionUpdater
      const owner = '0x9876'
      const fakeParams = {
        _recipient: owner,
      }
      const fakeContractAddress = '0xabc'
      const fakeHash = '0x12345'

      const keySaver = new Promise(resolve => {
        resolveKeySaver = resolve
      })
      const transactionUpdater = new Promise(resolve => {
        resolveTransactionUpdater = resolve
      })

      web3Service.once('transaction.updated', (transactionHash, params) => {
        expect(transactionHash).toBe(fakeHash)
        expect(params).toEqual({
          key: KEY_ID(fakeContractAddress, owner),
          lock: fakeContractAddress,
        })
        resolveTransactionUpdater()
      })

      web3Service.once('key.saved', (id, params) => {
        expect(id).toBe(KEY_ID(fakeContractAddress, owner))
        expect(params).toEqual({
          owner,
          lock: fakeContractAddress,
        })
        resolveKeySaver()
      })

      web3Service.ethers_inputsHandlers.purchaseFor(
        fakeHash,
        fakeContractAddress,
        fakeParams
      )
      await Promise.all([keySaver, transactionUpdater])
    })
  })

  describe('_getTransactionType', () => {
    function getEncoder(abi, method) {
      const contractInterface = new ethersUtils.Interface(abi)
      return contractInterface.functions[method].encode.bind(
        contractInterface.functions[method]
      )
    }

    it('should compute the method signature to compare it with the inputs', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const data =
        '0xf6e4641f00000000000000000000000033ab07df7f09e793ddd1e9a25b079989a557119a'
      const Contract = {
        contractName: 'PublicLock',
        abi: [
          {
            constant: false,
            inputs: [{ name: '_recipient', type: 'address' }],
            name: 'purchaseFor',
            outputs: [],
            payable: true,
            stateMutability: 'payable',
            type: 'function',
          },
        ],
      }
      expect(web3Service._ethers_getTransactionType(Contract, data)).toBe(
        'KEY_PURCHASE'
      )
    })

    describe.each([['v0', UnlockV0], ['v01', UnlockV01], ['v02', UnlockV02]])(
      '%s',
      (version, UnlockVersion) => {
        it('should return null if there is no matching method', async () => {
          expect.assertions(1)
          await nockBeforeEach()
          const data = 'notarealmethod'
          expect(
            web3Service._ethers_getTransactionType(UnlockVersion.Unlock, data)
          ).toBe(null)
        })

        it('should return the right transaction type on lock creation', async () => {
          expect.assertions(1)
          await nockBeforeEach()
          let data
          if (version !== 'v0') {
            const currencyAddress = ethers.constants.AddressZero // Token address (ERC20 support). null is for Eth
            data = getEncoder(UnlockVersion.Unlock.abi, 'createLock')([
              '1000',
              currencyAddress,
              '1000000000',
              '1',
            ])
          } else {
            data = getEncoder(UnlockVersion.Unlock.abi, 'createLock')([
              '1000',
              '1000000000',
              '1',
            ])
          }
          expect(
            web3Service._ethers_getTransactionType(UnlockVersion.Unlock, data)
          ).toBe(TransactionTypes.LOCK_CREATION)
        })

        it('should return the right transaction type on key purchase', async () => {
          expect.assertions(1)
          await nockBeforeEach()
          let data
          if (version !== 'v0') {
            data = getEncoder(UnlockVersion.PublicLock.abi, 'purchaseFor')([
              account,
            ])
          } else {
            data = getEncoder(UnlockVersion.PublicLock.abi, 'purchaseFor')([
              account,
              utils.utf8ToHex(''),
            ])
          }
          expect(
            web3Service._ethers_getTransactionType(
              UnlockVersion.PublicLock,
              data
            )
          ).toBe(TransactionTypes.KEY_PURCHASE)
        })

        it('should return the right transaction type on withdrawals', async () => {
          expect.assertions(1)
          await nockBeforeEach()
          const data = getEncoder(UnlockVersion.PublicLock.abi, 'withdraw')([])
          expect(
            web3Service._ethers_getTransactionType(
              UnlockVersion.PublicLock,
              data
            )
          ).toBe(TransactionTypes.WITHDRAWAL)
        })
      }
    )
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
      const expiration = await web3Service._ethers_getKeyByLockForOwner(
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
      const expiration = await web3Service._ethers_getKeyByLockForOwner(
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
      const expiration = await web3Service._ethers_getKeyByLockForOwner(
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
      web3Service.ethers_lockContractAbiVersion = jest.fn(() =>
        Promise.resolve(v0)
      )
      web3Service._ethers_getKeyByLockForOwner = jest.fn(() => {
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
      await web3Service.ethers_getKeyByLockForOwner(lockAddress, account)
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [`ethers_${method}`]: function(_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.ethers_lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[`ethers_${method}`](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificLockMethods.forEach(method => {
          expect(version[`ethers_${method}`]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
