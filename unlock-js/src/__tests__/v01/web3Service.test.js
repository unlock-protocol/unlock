import { ethers, utils as ethersUtils } from 'ethers'

import abis from '../../abis'

import NockHelper from '../helpers/nockHelper'
import bytecode from '../helpers/bytecode'
import Web3Service from '../../web3Service'
import TransactionTypes from '../../transactionTypes'
import utils from '../../utils'

import v01 from '../../v01'

import { KEY_ID } from '../../constants'

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

const nock = new NockHelper(readOnlyProvider, false /** debug */)
let web3Service

const version = 'v01'
const UnlockVersion = abis.v01
const LockVersion = v01
const actualVersion = 1

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

  describe('_getTransactionType', () => {
    function getEncoder(abi, method) {
      const contractInterface = new ethersUtils.Interface(abi)
      return contractInterface.functions[method].encode.bind(
        contractInterface.functions[method]
      )
    }

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
      const data = getEncoder(UnlockVersion.PublicLock.abi, 'updateKeyPrice')([
        123,
      ])
      expect(
        web3Service._getTransactionType(UnlockVersion.PublicLock, data)
      ).toBe(TransactionTypes.UPDATE_KEY_PRICE)
    })
  })

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
    web3Service._getPublicLockVersionFromContract = jest.fn(() => actualVersion)
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
          for: owner,
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
              address: lockAddress,
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
          receipt,
          lockAddress
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
          receipt,
          lockAddress
        )
      })

      it('handles the Transfer event from PublicLock contract', async () => {
        expect.assertions(4)
        await versionedNockBeforeEach()
        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const owner = checksumLockAddress
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

        web3Service.on('transaction.updated', (tHash, transactionUpdate) => {
          expect(tHash).toBe('hash')
          expect(transactionUpdate).toEqual({
            for: owner,
            key: KEY_ID(lockAddress, owner),
            lock: lockAddress,
          })
        })
        web3Service.on('key.saved', (id, key) => {
          expect(id).toBe(KEY_ID(lockAddress, owner))
          expect(key).toEqual({
            lock: lockAddress,
            owner,
          })
        })

        web3Service._parseTransactionLogsFromReceipt(
          'hash',
          UnlockVersion.PublicLock,
          receipt,
          lockAddress
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
              data: encoder.encode(['address', 'uint256'], [unlockAddress, 2]),
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
          receipt,
          lockAddress
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

      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
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
      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
        lockAddress
      )
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
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
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
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
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

        web3Service._getSubmittedTransaction = jest.fn(() => Promise.resolve())

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
        web3Service._watchTransaction = jest.fn()

        const result = await web3Service.getTransaction(
          transaction.hash // no defaults, because we refreshed
        )

        expect(result).toBeNull()
      })

      it('should poll for transaction (#4149)', async () => {
        expect.assertions(1)
        await versionedNockBeforeEach()
        testsSetup()

        web3Service._watchTransaction = jest.fn()

        await web3Service.getTransaction(
          transaction.hash // no defaults, because we refreshed
        )

        expect(web3Service._watchTransaction).toHaveBeenCalledWith(
          transaction.hash
        )
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
          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.status).toBe('failed')
            done()
          })
        })

        return await web3Service.getTransaction(transaction.hash)
      })

      it('should _parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', async done => {
        expect.assertions(6)
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
          receipt,
          lockAddress
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
          expect(lockAddress).toBe(blockTransaction.to)
          done()
        }
        web3Service.unlockContractAddress = blockTransaction.to

        await web3Service.getTransaction(transaction.hash)
      })

      it('should _parseTransactionLogsFromReceipt with the Lock abi otherwise', async done => {
        expect.assertions(6)
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
          receipt,
          lockAddress
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contract).toEqual(UnlockVersion.PublicLock)
          expect(receipt.blockNumber).toEqual(344)
          expect(receipt.logs).toEqual([])
          expect(web3Service._getTransactionType).toHaveBeenCalledWith(
            UnlockVersion.PublicLock,
            blockTransaction.input
          )
          expect(lockAddress).toBe(blockTransaction.to)
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
      iterativePromises = [Promise.resolve('iterative'), Promise.resolve(null)]
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
