import { ethers } from 'ethers'
import * as UnlockV11 from 'unlock-abi-1-1'
import utils from '../../utils'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import { UNLIMITED_KEYS_COUNT, ETHERS_MAX_UINT } from '../../../lib/constants'
import erc20 from '../../erc20'

const { FAILED_TO_CREATE_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail
const lock = {
  name: 'My Fancy Lock',
  address: '0x0987654321098765432109876543210987654321',
  expirationDuration: 86400, // 1 day
  keyPrice: '0.1', // 0.1 Eth
  maxNumberOfKeys: 100,
}

const callMethodData = prepContract({
  contract: UnlockV11.Unlock,
  functionName: 'createLock',
  signature: 'uint256,address,uint256,uint256,string',
  nock,
})

jest.mock('../../erc20.js', () => {
  return {
    getErc20Decimals: jest.fn(() => Promise.resolve(18)),
  }
})

let testERC20ContractAddress = '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3'

describe('v11', () => {
  describe('createLock', () => {
    async function nockBeforeEach(maxNumberOfKeys = lock.maxNumberOfKeys) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV11.Unlock,
        endpoint,
        nock,
        true // this is the Unlock contract, not PublicLock
      )

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(
        lock.expirationDuration,
        ethers.constants.AddressZero,
        utils.toWei(lock.keyPrice, 'ether'),
        maxNumberOfKeys,
        lock.name
      )

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
      setupFail = fail
    }

    describe('when not explicitly providing the address of a denominating currency contract ', () => {
      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        await nockBeforeEach()
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )
        const mock = walletService._handleMethodCall

        await walletService.createLock(lock)

        expect(mock).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.LOCK_CREATION
        )

        // verify that the promise passed to _handleMethodCall actually resolves
        // to the result the chain returns from a sendTransaction call to createLock
        const result = await mock.mock.calls[0][0]
        await result.wait()
        expect(result).toEqual(transactionResult)
        await nock.resolveWhenAllNocksUsed()
      })
    })

    describe('when providing the address of a denominating currency contract', () => {
      let erc20Lock

      beforeEach(() => {
        erc20Lock = {
          name: 'ERC20 Lock',
          address: '0x0987654321098765432109876543210987654321',
          expirationDuration: 86400, // 1 day
          keyPrice: '0.1', // 0.1 Eth
          maxNumberOfKeys: 100,
          currencyContractAddress: testERC20ContractAddress,
        }
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(0)

        await nockBeforeEach()

        let {
          testTransaction,
          testTransactionResult,
          success,
        } = callMethodData(
          erc20Lock.expirationDuration,
          testERC20ContractAddress,
          utils.toDecimal(erc20Lock.keyPrice, 18),
          erc20Lock.maxNumberOfKeys,
          erc20Lock.name
        )

        transaction = testTransaction
        transactionResult = testTransactionResult
        setupSuccess = success

        setupSuccess()

        await walletService.createLock(erc20Lock)
        await nock.resolveWhenAllNocksUsed()
      })

      it('should emit lock.updated with the right params', async () => {
        expect.assertions(2)

        await nockBeforeEach()

        let {
          testTransaction,
          testTransactionResult,
          success,
        } = callMethodData(
          erc20Lock.expirationDuration,
          testERC20ContractAddress,
          utils.toDecimal(erc20Lock.keyPrice, 18),
          erc20Lock.maxNumberOfKeys,
          erc20Lock.name
        )

        transaction = testTransaction
        transactionResult = testTransactionResult
        setupSuccess = success

        setupSuccess()

        walletService.on('lock.updated', (lockAddress, update) => {
          expect(lockAddress).toBe(erc20Lock.address)
          expect(update).toEqual({
            transaction: transaction.hash,
            balance: '0',
            expirationDuration: erc20Lock.expirationDuration,
            keyPrice: erc20Lock.keyPrice,
            maxNumberOfKeys: erc20Lock.maxNumberOfKeys,
            outstandingKeys: 0,
            name: erc20Lock.name,
            currencyContractAddress: testERC20ContractAddress,
          })
        })

        await walletService.createLock(erc20Lock)
        await nock.resolveWhenAllNocksUsed()
      })

      it('should retrieve the locks number of decimals to convert the key price to the right unit', async () => {
        expect.assertions(0)

        await nockBeforeEach()
        const decimals = 9
        erc20.getErc20Decimals = jest.fn(() => {
          return Promise.resolve(decimals)
        })
        let {
          testTransaction,
          testTransactionResult,
          success,
        } = callMethodData(
          erc20Lock.expirationDuration,
          testERC20ContractAddress,
          utils.toDecimal(erc20Lock.keyPrice, decimals),
          erc20Lock.maxNumberOfKeys,
          erc20Lock.name
        )

        transaction = testTransaction
        transactionResult = testTransactionResult
        setupSuccess = success

        setupSuccess()

        await walletService.createLock(erc20Lock)
        await nock.resolveWhenAllNocksUsed()
      })
    })

    it('should emit lock.updated with the transaction', async () => {
      expect.assertions(2)

      await nockBeforeEach()
      setupSuccess()

      walletService.on('lock.updated', (lockAddress, update) => {
        expect(lockAddress).toBe(lock.address)
        expect(update).toEqual({
          transaction: transaction.hash,
          balance: '0',
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          outstandingKeys: 0,
          name: lock.name,
        })
      })

      await walletService.createLock(lock)
      await nock.resolveWhenAllNocksUsed()
    })

    it('should convert unlimited keys from UNLIMITED_KEYS_COUNT to ETHERS_MAX_UINT for the function call', async () => {
      expect.assertions(2)

      // this param tells the call to createLock to pass in this value instead of the lock's value
      // for maxNumberOfKeys. The test will fail if the function call does not convert
      await nockBeforeEach(ETHERS_MAX_UINT)
      setupSuccess()

      walletService.on('lock.updated', (lockAddress, update) => {
        expect(lockAddress).toBe(lock.address)
        expect(update).toEqual({
          transaction: transaction.hash,
          balance: '0',
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
          outstandingKeys: 0,
          name: lock.name,
        })
      })

      await walletService.createLock({
        ...lock,
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      })

      await nock.resolveWhenAllNocksUsed()
    })

    it('should emit an error if the transaction could not be sent', async () => {
      expect.assertions(1)

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach()
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_CREATE_LOCK)
      })

      await walletService.createLock(lock)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
