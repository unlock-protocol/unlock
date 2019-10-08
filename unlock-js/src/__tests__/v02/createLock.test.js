import { ethers } from 'ethers'
import * as UnlockV02 from 'unlock-abi-0-2'
import utils from '../../utils'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import { UNLIMITED_KEYS_COUNT, ETHERS_MAX_UINT } from '../../../lib/constants'

const { FAILED_TO_CREATE_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail
const lock = {
  address: '0x0987654321098765432109876543210987654321',
  expirationDuration: 86400, // 1 day
  keyPrice: '0.1', // 0.1 Eth
  maxNumberOfKeys: 100,
}

const callMethodData = prepContract({
  contract: UnlockV02.Unlock,
  functionName: 'createLock',
  signature: 'uint256,address,uint256,uint256',
  nock,
})

let testERC20ContractAddress = '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3'

const EventInfo = new ethers.utils.Interface(UnlockV02.Unlock.abi)
const encoder = ethers.utils.defaultAbiCoder

let receipt = {
  logs: [],
}

describe('v02', () => {
  describe('createLock', () => {
    async function nockBeforeEach(maxNumberOfKeys = lock.maxNumberOfKeys) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV02.Unlock,
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
        maxNumberOfKeys
      )

      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
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
      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(0)

        await nockBeforeEach()

        const Erc20Lock = {
          address: '0x0987654321098765432109876543210987654321',
          expirationDuration: 86400, // 1 day
          keyPrice: '0.1', // 0.1 Eth
          maxNumberOfKeys: 100,
          currencyContractAddress: testERC20ContractAddress,
        }

        let {
          testTransaction,
          testTransactionResult,
          success,
        } = callMethodData(
          Erc20Lock.expirationDuration,
          testERC20ContractAddress,
          utils.toWei(Erc20Lock.keyPrice, 'ether'),
          Erc20Lock.maxNumberOfKeys
        )

        transaction = testTransaction
        transactionResult = testTransactionResult
        setupSuccess = success

        setupSuccess()

        await walletService.createLock(Erc20Lock)
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

    it('should yield a promise of lock address', async () => {
      expect.assertions(1)

      await nockBeforeEach()
      setupSuccess()

      // For now we do not use this
      const sender = '0x0000000000000000000000000000000000000000'

      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve({
          logs: [
            {
              transactionIndex: 1,
              blockNumber: 19759,
              transactionHash:
                '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
              address: lock.address,
              topics: [
                EventInfo.events['NewLock(address,address)'].topic,
                encoder.encode(['address'], [sender]),
                encoder.encode(['address'], [lock.address]),
              ],
              data: '0x',
              logIndex: 0,
              blockHash:
                '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
              transactionLogIndex: 0,
            },
          ],
        })
      )
      const lockAddress = await walletService.createLock(lock)
      await nock.resolveWhenAllNocksUsed()
      expect(lockAddress).toEqual(lock.address)
    })
  })
})
