import { ethers, utils as ethersUtils } from 'ethers'
import http from 'http'

import abis from '../abis'

import NockHelper from './helpers/nockHelper'
import bytecode from './helpers/bytecode'
import Web3Service from '../web3Service'
import TransactionTypes from '../transactionTypes'
import utils from '../utils'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'
import v10 from '../v10'

import { KEY_ID } from '../constants'

const supportedVersions = [v0, v01, v02, v10]

const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ed6a5bb0fda25eac3b5d03fa875cb60a4639d8e'
const checksumLockAddress = '0x5ED6a5BB0fDA25eaC3B5D03fa875cB60A4639d8E'

const transaction = {
  status: 'mined',
  createdAt: new Date().getTime(),
  hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
}

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

    describe.each([
      ['v0', abis.v0],
      ['v01', abis.v01],
      ['v02', abis.v02],
      ['v10', abis.v10],
    ])('%s', (version, UnlockVersion) => {
      it('should return the right transaction type on lock creation', async () => {
        expect.assertions(1)
        await nockBeforeEach()
        // TODO Since this test is version specific it does not belong here.
        // Removing it will make things easier/cleaner to handle in the future
        let data
        const currencyAddress = ethers.constants.AddressZero // Token address (ERC20 support). null is for Eth
        if (version === 'v0') {
          data = getEncoder(UnlockVersion.Unlock.abi, 'createLock')([
            '1000',
            '1000000000',
            '1',
          ])
        } else if (version === 'v10') {
          data = getEncoder(UnlockVersion.Unlock.abi, 'createLock')([
            '1000', // _expirationDuration
            currencyAddress, // _tokenAddress
            '1000000000', // _keyPrice
            '1', //_maxNumberOfKeys
            'Lock name', // _lockName
          ])
        } else {
          data = getEncoder(UnlockVersion.Unlock.abi, 'createLock')([
            '1000',
            currencyAddress,
            '1000000000',
            '1',
          ])
        }
        const type = web3Service._getTransactionType(UnlockVersion.Unlock, data)
        expect(type).toBe(TransactionTypes.LOCK_CREATION)
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
          web3Service._getTransactionType(UnlockVersion.PublicLock, data)
        ).toBe(TransactionTypes.KEY_PURCHASE)
      })

      it('should return the right transaction type on withdrawals', async () => {
        expect.assertions(1)
        await nockBeforeEach()
        const data = getEncoder(UnlockVersion.PublicLock.abi, 'withdraw')([])
        expect(
          web3Service._getTransactionType(UnlockVersion.PublicLock, data)
        ).toBe(TransactionTypes.WITHDRAWAL)
      })

      it('should return the right transaction type on key price updates', async () => {
        expect.assertions(1)
        await nockBeforeEach()
        const data = getEncoder(UnlockVersion.PublicLock.abi, 'updateKeyPrice')(
          [123]
        )
        expect(
          web3Service._getTransactionType(UnlockVersion.PublicLock, data)
        ).toBe(TransactionTypes.UPDATE_KEY_PRICE)
      })
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

  describe.each([
    ['v0', abis.v0, v0, 0],
    ['v01', abis.v01, v01, 1],
    ['v02', abis.v02, v02, 2],
    ['v10', abis.v10, v10, 3],
  ])('%s', (version, UnlockVersion, LockVersion, actualVersion) => {
    async function versionedNockBeforeEach(endpoint = readOnlyProvider) {
      nock.cleanAll()
      nock.netVersionAndYield(1)
      web3Service = new Web3Service({
        readOnlyProvider: endpoint,
        unlockAddress,
        blockTime,
        requiredConfirmations,
        useEthers: true,
      })
      web3Service._getPublicLockVersionFromContract = jest.fn(
        () => actualVersion
      )
      web3Service._getVersionFromContract = jest.fn(() => actualVersion)
      return nock.resolveWhenAllNocksUsed()
    }

    describe('inputsHandlers', () => {
      describe('createLock', () => {
        it('should emit lock.updated with correctly typed values', async done => {
          expect.assertions(2)
          await versionedNockBeforeEach()
          const params = {
            _expirationDuration: '7',
            _maxNumberOfKeys: '5',
            _keyPrice: '5',
          }
          web3Service.generateLockAddress = jest.fn()
          web3Service.on('lock.updated', (newLockAddress, update) => {
            expect(update.expirationDuration).toBe(7)
            expect(update.maxNumberOfKeys).toBe(5)
            done()
          })

          await web3Service.inputsHandlers.createLock('0x123', '0x456', params)
        })
      })

      it('purchaseFor', async () => {
        expect.assertions(4)
        await versionedNockBeforeEach()
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

        web3Service.inputsHandlers.purchaseFor(
          fakeHash,
          fakeContractAddress,
          fakeParams
        )
        await Promise.all([keySaver, transactionUpdater])
      })
    })

    describe('_parseTransactionLogsFromReceipt', () => {
      const encoder = ethers.utils.defaultAbiCoder

      describe('events', () => {
        it('handles the NewLock event from Unlock contract', async () => {
          expect.assertions(5)
          await versionedNockBeforeEach()
          const EventInfo = new ethers.utils.Interface(UnlockVersion.Unlock.abi)
          const receipt = {
            blockNumber: 123,
            logs: [
              {
                data: encoder.encode(
                  ['address', 'address'],
                  [unlockAddress, lockAddress]
                ),
                topics: [
                  EventInfo.events['NewLock(address,address)'].topic,
                  encoder.encode(['address'], [unlockAddress]),
                  encoder.encode(['address'], [lockAddress]),
                ],
              },
            ],
          }

          web3Service.on('transaction.updated', (tHash, lock) => {
            expect(tHash).toBe('hash')
            expect(lock).toEqual({
              lock: checksumLockAddress,
            })
          })
          web3Service.on('lock.updated', (lockAddress, lock) => {
            expect(lockAddress).toBe(checksumLockAddress)
            expect(lock).toEqual({
              asOf: 123,
              transaction: 'hash',
              address: checksumLockAddress,
            })
          })

          web3Service.getLock = jest.fn()
          web3Service._parseTransactionLogsFromReceipt(
            'hash',
            UnlockVersion.Unlock,
            receipt
          )
          expect(web3Service.getLock).toHaveBeenCalledWith(checksumLockAddress)
        })

        it('handles the PriceChanged event from PublicLock contract', async () => {
          expect.assertions(4)
          await versionedNockBeforeEach()
          const EventInfo = new ethers.utils.Interface(
            UnlockVersion.PublicLock.abi
          )
          const receipt = {
            blockNumber: 123,
            logs: [
              {
                address: lockAddress,
                data: encoder.encode(['uint256', 'uint256'], [1, 2]),
                topics: [
                  EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                  encoder.encode(['uint256'], [1]),
                  encoder.encode(['uint256'], [2]),
                ],
              },
            ],
          }

          web3Service.on('transaction.updated', (tHash, lock) => {
            expect(tHash).toBe('hash')
            expect(lock).toEqual({
              lock: lockAddress,
            })
          })
          web3Service.on('lock.updated', (address, lock) => {
            expect(address).toBe(lockAddress)
            expect(lock).toEqual({
              asOf: 123,
              keyPrice: '0.000000000000000002',
            })
          })

          web3Service._parseTransactionLogsFromReceipt(
            'hash',
            UnlockVersion.PublicLock,
            receipt
          )
        })

        it('handles the Transfer event from PublicLock contract', async () => {
          expect.assertions(4)
          await versionedNockBeforeEach()
          const EventInfo = new ethers.utils.Interface(
            UnlockVersion.PublicLock.abi
          )
          const receipt = {
            blockNumber: 123,
            logs: [
              {
                address: lockAddress,
                data: encoder.encode(['uint256', 'uint256'], [1, 2]),
                topics: [
                  EventInfo.events['Transfer(address,address,uint256)'].topic,
                  encoder.encode(['uint256'], [unlockAddress]),
                  encoder.encode(['uint256'], [lockAddress]),
                  encoder.encode(['uint256'], [2]),
                ],
              },
            ],
          }

          web3Service.on('transaction.updated', (tHash, lock) => {
            expect(tHash).toBe('hash')
            expect(lock).toEqual({
              key: KEY_ID(lockAddress, checksumLockAddress),
              lock: lockAddress,
            })
          })
          web3Service.on('key.saved', (id, key) => {
            expect(id).toBe(KEY_ID(lockAddress, checksumLockAddress))
            expect(key).toEqual({
              lock: lockAddress,
              owner: checksumLockAddress,
            })
          })

          web3Service._parseTransactionLogsFromReceipt(
            'hash',
            UnlockVersion.PublicLock,
            receipt
          )
        })

        it('handles the Withdrawal event from PublicLock contract', async () => {
          expect.assertions(2)
          await versionedNockBeforeEach()
          const EventInfo = new ethers.utils.Interface(
            UnlockVersion.PublicLock.abi
          )
          const receipt = {
            blockNumber: 123,
            logs: [
              {
                address: lockAddress,
                data: encoder.encode(
                  ['address', 'uint256'],
                  [unlockAddress, 2]
                ),
                topics: [
                  EventInfo.events['Withdrawal(address,uint256)'].topic,
                  encoder.encode(['address'], [unlockAddress]),
                  encoder.encode(['uint256'], [2]),
                ],
              },
            ],
          }

          web3Service.on('transaction.updated', (tHash, lock) => {
            expect(tHash).toBe('hash')
            expect(lock).toEqual({
              lock: lockAddress,
            })
          })

          web3Service._parseTransactionLogsFromReceipt(
            'hash',
            UnlockVersion.PublicLock,
            receipt
          )
        })
      })
    })

    describe('getPastLockCreationsTransactionsForUser', () => {
      it('should getPastEvents for the Unlock contract', async () => {
        expect.assertions(3)
        await versionedNockBeforeEach()

        const getUnlockContract = jest.spyOn(web3Service, 'getUnlockContract')

        const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
        web3Service._getPastTransactionsForContract = jest.fn(() => 'hi')

        const pastTransactions = await web3Service.getPastLockCreationsTransactionsForUser(
          userAddress
        )
        expect(getUnlockContract).toHaveBeenCalled()

        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            address: unlockAddress,
            topics: [
              '0x01017ed19df0c7f8acc436147b234b09664a9fb4797b4fa3fb9e599c2eb67be7',
              '0x000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            ],
          })
        )
        // ensure we return what is returned to us
        expect(pastTransactions).toBe('hi')
      })
    })

    describe('getPastLockTransactions', () => {
      it('should getPastEvents for the Lock contract', async () => {
        expect.assertions(2)
        await versionedNockBeforeEach()
        const lockAddress = '0x123'

        web3Service._getPastTransactionsForContract = jest.fn(() => 'hi')

        const pastTransactions = await web3Service.getPastLockTransactions(
          lockAddress
        )
        expect(
          web3Service._getPastTransactionsForContract
        ).toHaveBeenCalledWith(lockAddress)
        // ensure we return what we are given from _getPastTransactionsForContract
        expect(pastTransactions).toBe('hi')
      })
    })

    describe('_parseTransactionFromInput', () => {
      it('should emit transaction.updated with the transaction marked as pending', async done => {
        expect.assertions(2)
        await versionedNockBeforeEach()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toEqual(transaction.hash)
          expect(update).toEqual({
            status: 'pending',
            type: 'TRANSACTION_TYPE',
            confirmations: 0,
            blockNumber: Number.MAX_SAFE_INTEGER,
          })
          done()
        })
        web3Service._parseTransactionFromInput(
          LockVersion,
          transaction.hash,
          UnlockVersion.Unlock,
          input,
          web3Service.unlockContractAddress
        )
      })

      it('should call the handler if the transaction input can be parsed', async done => {
        expect.assertions(3)
        await versionedNockBeforeEach()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        const input =
          '0x8c952a42000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002686900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000057468657265000000000000000000000000000000000000000000000000000000'

        // Fake method
        const method = {
          signature: '0x8c952a42',
          name: 'myMethod',
        }

        // Fake abi
        const FakeContract = {
          abi: ['myMethod(string hi,string there)'],
        }

        // fake params
        const params = {
          hi: 'hi',
          there: 'there',
        }
        // keeping track of it so we can clean it up (web3 has a singleton class down below)

        // Creating a fake handler
        web3Service.inputsHandlers[method.name] = (
          transactionHash,
          contractAddress,
          args
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contractAddress).toEqual(web3Service.unlockContractAddress)
          expect(args).toEqual(params)
          done()
        }

        web3Service._parseTransactionFromInput(
          LockVersion,
          transaction.hash,
          FakeContract,
          input,
          web3Service.unlockContractAddress
        )
      })
    })

    describe('_getSubmittedTransaction', () => {
      const blockNumber = 29
      const defaults = null

      it('should watch the transaction', async done => {
        expect.assertions(1)
        await versionedNockBeforeEach()
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getSubmittedTransaction(
          LockVersion,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should emit a transaction.updated event with the right values', async done => {
        expect.assertions(4)
        await versionedNockBeforeEach()
        web3Service._watchTransaction = jest.fn()
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('submitted')
          expect(update.confirmations).toEqual(0)
          expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
          done()
        })
        web3Service._getSubmittedTransaction(
          LockVersion,
          transaction.hash,
          blockNumber,
          defaults
        )
      })

      it('should invoke parseTransactionFromInput if the defaults include an input value', async done => {
        expect.assertions(4)
        await versionedNockBeforeEach()
        web3Service._watchTransaction = jest.fn()

        const defaults = {
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        }

        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(LockVersion)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(defaults.input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getSubmittedTransaction(
          LockVersion,
          transaction.hash,
          blockNumber,
          defaults
        )
      })
    })

    describe('_getPendingTransaction', () => {
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

      const blockTransaction = {
        hash: transaction.hash,
        nonce: '0x04',
        blockHash: 'null',
        blockNumber: null, // Not mined
        from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
        value: '0x0',
        gas: '0x16e360',
        gasPrice: '0x04a817c800',
        data: input,
      }

      it('should watch the transaction', async done => {
        expect.assertions(1)
        await versionedNockBeforeEach()
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')

        web3Service._parseTransactionFromInput = jest.fn(() => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service._getPendingTransaction(LockVersion, blockTransaction)
      })

      it('should invoke parseTransactionFromInput', async done => {
        expect.assertions(4)
        await versionedNockBeforeEach()
        web3Service._watchTransaction = jest.fn()
        web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')

        web3Service._parseTransactionFromInput = jest.fn(
          (version, transactionHash, contract, transactionInput, address) => {
            expect(version).toEqual(LockVersion)
            expect(transactionHash).toEqual(transaction.hash)
            expect(transactionInput).toEqual(input)
            expect(address).toEqual(
              '0xcfeb869f69431e42cdb54a4f4f105c19c080a601'
            )
            done()
          }
        )

        web3Service._getPendingTransaction(LockVersion, blockTransaction)
      })
    })

    describe('getTransaction', () => {
      describe('when the transaction was submitted', () => {
        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, null)
          nock.ethGetCodeAndYield(unlockAddress, bytecode[version].Unlock)
          // this is the call to unlockVersion() with params []
          nock.ethCallAndYield('0x4220bd46', unlockAddress, actualVersion)
        }

        it('should call _getSubmittedTransaction', async () => {
          expect.assertions(2)
          await versionedNockBeforeEach()
          web3Service._watchTransaction = jest.fn()

          testsSetup()
          const defaultTransactionValues = {
            to: unlockAddress,
          }

          web3Service.unlockContractAbiVersion = jest.fn(() =>
            Promise.resolve(LockVersion)
          )

          web3Service._getSubmittedTransaction = jest.fn(() =>
            Promise.resolve()
          )

          await web3Service.getTransaction(
            transaction.hash,
            defaultTransactionValues
          )
          expect(web3Service._getSubmittedTransaction).toHaveBeenCalledWith(
            LockVersion,
            transaction.hash,
            29,
            defaultTransactionValues
          )
          expect(web3Service.unlockContractAbiVersion).toHaveBeenCalledWith()
        })
      })

      describe('when the transaction is submitted and the user has refreshed the page', () => {
        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, null)
          nock.ethGetCodeAndYield(unlockAddress, bytecode[version].Unlock)
          // this is the call to unlockVersion() with params []
          nock.ethCallAndYield('0x4220bd46', unlockAddress, actualVersion)
        }

        it('should not crash (#3246)', async () => {
          expect.assertions(1)
          await versionedNockBeforeEach()
          testsSetup()

          const result = await web3Service.getTransaction(
            transaction.hash // no defaults, because we refreshed
          )

          expect(result).toBeNull()
        })
      })

      describe('when the transaction is pending/waiting to be mined', () => {
        const input =
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
        const blockTransaction = {
          hash: transaction.hash,
          nonce: '0x04',
          blockHash:
            '0x7a1d0b010393c8d850200d0ec1e27c0c8a295366247b1bd6124d496cf59182ad',
          blockNumber: null, // Not mined
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input,
        }

        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
          nock.ethGetCodeAndYield(unlockAddress, bytecode[version].Unlock)
          // this is the call to unlockVersion() with params []
          nock.ethCallAndYield('0x4220bd46', unlockAddress, actualVersion)
        }

        it('should call _getPendingTransaction', async () => {
          expect.assertions(2)
          await nockBeforeEach()
          testsSetup()

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(LockVersion)
          })

          web3Service._getPendingTransaction = jest.fn(() => Promise.resolve())

          await web3Service.getTransaction(transaction.hash)
          expect(web3Service._getPendingTransaction).toHaveBeenCalledWith(
            LockVersion,
            expect.objectContaining({
              hash: transaction.hash,
              data: input,
            })
          )
          expect(web3Service.lockContractAbiVersion).toHaveBeenCalledWith(
            blockTransaction.to
          )
        })
      })

      describe('when the transaction has been mined in the next block', () => {
        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(18).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })

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

          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(LockVersion)
          })

          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        }

        it('should emit a transaction.updated event with 0 confirmations', async done => {
          expect.assertions(1)
          await nockBeforeEach()
          testsSetup()
          web3Service.on('transaction.updated', (hash, update) => {
            expect(update.confirmations).toEqual(0) // 0 > -1 [17-18]
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction has been mined but not fully confirmed', () => {
        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(17).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, {
            hash:
              '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
            nonce: '0x04',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(14).toString('16')}`,
            transactionIndex: '0x0d',
            from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            value: '0x0',
            gas: '0x16e360',
            gasPrice: '0x04a817c800',
            input:
              '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
          })

          nock.ethGetTransactionReceipt(transaction.hash, {
            status: 1,
            transactionHash: transaction.hash,
            transactionIndex: '0x0d',
            blockHash:
              '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
            blockNumber: `0x${(14).toString('16')}`,
            contractAddress: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
            gasUsed: '0x16e360',
            cumulativeGasUsed: '0x16e360',
            logs: [],
          })
          web3Service._watchTransaction = jest.fn()
          web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
        }

        it('should watch the transaction', async done => {
          expect.assertions(1)
          await versionedNockBeforeEach()
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(LockVersion)
          })
          testsSetup()
          web3Service.on('transaction.updated', () => {
            expect(web3Service._watchTransaction).toHaveBeenCalledWith(
              transaction.hash
            )
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })

        it('should emit a transaction.updated event with the right values', async done => {
          expect.assertions(5)
          await versionedNockBeforeEach()
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(LockVersion)
          })
          testsSetup()
          web3Service.on('transaction.updated', (hash, update) => {
            expect(hash).toBe(transaction.hash)
            expect(update.status).toEqual('mined')
            expect(update.confirmations).toEqual(3) //17-14
            expect(update.blockNumber).toEqual(14)
            expect(update.type).toEqual('TRANSACTION_TYPE')
            done()
          })

          await web3Service.getTransaction(transaction.hash)
        })
      })

      describe('when the transaction was mined', () => {
        const blockTransaction = {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x00',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        }

        function testsSetup() {
          // nock calls cannot be in beforeEach
          nock.ethBlockNumber(`0x${(29).toString('16')}`)
          nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
        }

        it('should mark the transaction as failed if the transaction receipt status is false', async done => {
          expect.assertions(6)
          await versionedNockBeforeEach()
          web3Service.lockContractAbiVersion = jest.fn(() => {
            return Promise.resolve(LockVersion)
          })
          testsSetup()
          nock.ethGetTransactionReceipt(transaction.hash, {
            transactionIndex: '0x3',
            transactionHash: blockTransaction.hash,
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x0',
          })
          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.confirmations).toEqual(15) //29-14
            expect(update.type).toEqual('TYPE')
            expect(update.blockNumber).toEqual(14)
            web3Service.once(
              'transaction.updated',
              (transactionHash, update) => {
                expect(transactionHash).toEqual(transaction.hash)
                expect(update.status).toBe('failed')
                done()
              }
            )
          })

          return await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', async done => {
          expect.assertions(5)
          await versionedNockBeforeEach()
          testsSetup()
          const transactionReceipt = {
            transactionIndex: '0x3',
            transactionHash: blockTransaction.hash,
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
          const previousAddress = web3Service.unlockContractAddress

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            transactionHash,
            contract,
            receipt
          ) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockVersion.Unlock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            web3Service.unlockContractAddress = previousAddress
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockVersion.Unlock,
              blockTransaction.input
            )
            done()
          }
          web3Service.unlockContractAddress = blockTransaction.to

          await web3Service.getTransaction(transaction.hash)
        })

        it('should _parseTransactionLogsFromReceipt with the Lock abi otherwise', async done => {
          expect.assertions(5)
          await versionedNockBeforeEach()
          testsSetup()
          const transactionReceipt = {
            transactionIndex: '0x3',
            transactionHash: blockTransaction.hash,
            blockHash:
              '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
            blockNumber: '0x158',
            gasUsed: '0x2ea84',
            cumulativeGasUsed: '0x3a525',
            logs: [],
            status: '0x1',
          }
          nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)

          web3Service._getTransactionType = jest.fn(() => 'TYPE')

          web3Service._parseTransactionLogsFromReceipt = (
            transactionHash,
            contract,
            receipt
          ) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(contract).toEqual(UnlockVersion.PublicLock)
            expect(receipt.blockNumber).toEqual(344)
            expect(receipt.logs).toEqual([])
            expect(web3Service._getTransactionType).toHaveBeenCalledWith(
              UnlockVersion.PublicLock,
              blockTransaction.input
            )
            done()
          }

          await web3Service.getTransaction(transaction.hash)
        })
      })
    })

    describe('_genKeyOwnersFromLockContractIterative', () => {
      it('calls owners with the correct index', async () => {
        expect.assertions(2)
        await versionedNockBeforeEach()
        const metadata = new ethers.utils.Interface(LockVersion.PublicLock.abi)
        const encoder = ethers.utils.defaultAbiCoder

        nock.ethGetCodeAndYield(lockAddress, bytecode[version].PublicLock)

        nock.ethCallAndYield(
          metadata.functions['owners(uint256)'].encode([2 * 2]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(['address'], [account])
        )

        nock.ethCallAndFail(
          metadata.functions['owners(uint256)'].encode([2 * 2 + 1]),
          ethers.utils.getAddress(lockAddress),
          { code: 200, error: 'NO_OWNER' }
        )

        nock.ethCallAndYield(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            account,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(['uint256'], [ethers.utils.bigNumberify(12345)])
        )

        nock.ethCallAndFail(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            ethers.constants.AddressZero,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(
            ['bytes'],
            [ethers.utils.hexlify(ethers.utils.toUtf8Bytes('NO_SUCH_KEY'))]
          )
        )

        const lockContract = await web3Service.getLockContract(lockAddress)

        const keys = await web3Service._genKeyOwnersFromLockContractIterative(
          lockAddress,
          lockContract,
          2 /* page */,
          2 /* byPage */
        )

        expect(keys).toEqual([expect.any(Promise), expect.any(Promise)])
        const resolved = await Promise.all(keys)
        expect(resolved).toEqual([
          {
            expiration: 12345,
            id: `${lockAddress}-${account}`,
            lock: lockAddress,
            owner: account,
          },
          null,
        ])
      })
    })

    describe('_genKeyOwnersFromLockContract', () => {
      const encoder = ethers.utils.defaultAbiCoder
      it('retrieves key owners via the API', async () => {
        expect.assertions(2)
        await versionedNockBeforeEach()
        const metadata = new ethers.utils.Interface(LockVersion.PublicLock.abi)

        nock.ethGetCodeAndYield(lockAddress, bytecode[version].PublicLock)

        const lockContract = await web3Service.getLockContract(lockAddress)

        nock.ethCallAndYield(
          metadata.functions['getOwnersByPage(uint256,uint256)'].encode([2, 2]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(
            [
              metadata.functions['getOwnersByPage(uint256,uint256)'].outputs[0]
                .type,
            ],
            [[account, unlockAddress]]
          )
        )

        nock.ethCallAndYield(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            account,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(['uint256'], [ethers.utils.bigNumberify(12345)])
        )

        nock.ethCallAndFail(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            unlockAddress,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(
            ['bytes'],
            [ethers.utils.hexlify(ethers.utils.toUtf8Bytes('NO_SUCH_KEY'))]
          )
        )

        const keys = await web3Service._genKeyOwnersFromLockContract(
          lockAddress,
          lockContract,
          2 /* page */,
          2 /* byPage */
        )

        expect(keys).toEqual([expect.any(Promise), expect.any(Promise)])
        const resolved = await Promise.all(keys)
        expect(resolved).toEqual([
          {
            expiration: 12345,
            id: `${lockAddress}-${account}`,
            lock: lockAddress,
            owner: account,
          },
          {
            expiration: 0,
            id: `${lockAddress}-${unlockAddress}`,
            lock: lockAddress,
            owner: unlockAddress,
          },
        ])
      })

      it('throws on failure', async () => {
        expect.assertions(1)
        await versionedNockBeforeEach()
        const metadata = new ethers.utils.Interface(LockVersion.PublicLock.abi)

        nock.ethGetCodeAndYield(lockAddress, bytecode[version].PublicLock)

        const lockContract = await web3Service.getLockContract(lockAddress)

        nock.ethCallAndFail(
          metadata.functions['getOwnersByPage(uint256,uint256)'].encode([2, 2]),
          ethers.utils.getAddress(lockAddress),
          { code: 200, message: 'NO_USER_KEYS' }
        )

        try {
          await web3Service._genKeyOwnersFromLockContract(
            lockAddress,
            lockContract,
            2 /* page */,
            2 /* byPage */
          )
        } catch (e) {
          expect(e).toBeInstanceOf(Error)
        }
      })

      it('throws on internal failure', async () => {
        expect.assertions(1)
        await versionedNockBeforeEach()
        const metadata = new ethers.utils.Interface(LockVersion.PublicLock.abi)

        nock.ethGetCodeAndYield(lockAddress, bytecode[version].PublicLock)

        const lockContract = await web3Service.getLockContract(lockAddress)

        nock.ethCallAndYield(
          metadata.functions['getOwnersByPage(uint256,uint256)'].encode([2, 2]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(
            [
              metadata.functions['getOwnersByPage(uint256,uint256)'].outputs[0]
                .type,
            ],
            [[account, unlockAddress]]
          )
        )

        nock.ethCallAndYield(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            account,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(['uint256'], [ethers.utils.bigNumberify(12345)])
        )

        nock.ethCallAndFail(
          metadata.functions['keyExpirationTimestampFor(address)'].encode([
            unlockAddress,
          ]),
          ethers.utils.getAddress(lockAddress),
          encoder.encode(
            ['bytes'],
            [ethers.utils.hexlify(ethers.utils.toUtf8Bytes('NO_SUCH_KEY'))]
          )
        )
        web3Service._packageKeyholderInfo = jest.fn(() => {
          throw new Error('oops')
        })

        try {
          await web3Service._genKeyOwnersFromLockContract(
            lockAddress,
            lockContract,
            2 /* page */,
            2 /* byPage */
          )
        } catch (e) {
          expect(e).toBeInstanceOf(Error)
        }
      })
    })

    describe('getKeysForLockOnPage', () => {
      let keyPromises
      let iterativePromises

      function testsSetup({ owners, iterative }) {
        web3Service._genKeyOwnersFromLockContract = jest.fn(() => owners)
        web3Service._genKeyOwnersFromLockContractIterative = jest.fn(
          () => iterative
        )
      }

      beforeEach(() => {
        keyPromises = [Promise.resolve('normal'), Promise.resolve(null)]
        iterativePromises = [
          Promise.resolve('iterative'),
          Promise.resolve(null),
        ]
      })

      it('tries _genKeyOwnersFromLockContract first', async () => {
        expect.assertions(3)

        await versionedNockBeforeEach()
        testsSetup({
          owners: Promise.resolve(keyPromises),
          iterative: Promise.resolve(iterativePromises),
        })

        web3Service.on('keys.page', (lock, page, keys) => {
          expect(lock).toBe(lockAddress)
          expect(page).toBe(3)
          expect(keys).toEqual(['normal'])
        })

        await web3Service.getKeysForLockOnPage(lockAddress, 3, 2)
      })

      it('falls back to _genKeyOwnersFromLockContractIterative if keyPromises is empty', async () => {
        expect.assertions(3)

        await versionedNockBeforeEach()
        testsSetup({
          owners: Promise.resolve([]),
          iterative: Promise.resolve(iterativePromises),
        })

        web3Service.on('keys.page', (lock, page, keys) => {
          expect(lock).toBe(lockAddress)
          expect(page).toBe(3)
          expect(keys).toEqual(['iterative'])
        })

        await web3Service.getKeysForLockOnPage(lockAddress, 3, 2)
      })

      it('falls back to _genKeyOwnersFromLockContractIterative if _genKeyOwnersFromLockContract throws', async () => {
        expect.assertions(3)

        await versionedNockBeforeEach()
        testsSetup({
          owners: Promise.reject(new Error()),
          iterative: Promise.resolve(iterativePromises),
        })

        web3Service.on('keys.page', (lock, page, keys) => {
          expect(lock).toBe(lockAddress)
          expect(page).toBe(3)
          expect(keys).toEqual(['iterative'])
        })

        await web3Service.getKeysForLockOnPage(lockAddress, 3, 2)
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
})
