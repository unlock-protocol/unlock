import * as UnlockV10 from 'unlock-abi-1-0'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import erc20 from '../../erc20'
import Web3Utils from '../../utils'

const { FAILED_TO_PURCHASE_KEY } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail

jest.mock('../../erc20.js', () => {
  return { approveTransfer: jest.fn() }
})

describe('v10', () => {
  describe('purchaseKey', () => {
    const keyPrice = '0.01'
    const owner = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'

    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV10.PublicLock,
        endpoint,
        nock
      )

      // Reset the mock
      erc20.approveTransfer = jest.fn(() => {
        Promise.resolve()
      })

      const callMethodData = prepContract({
        contract: UnlockV10.PublicLock,
        functionName: 'purchaseFor',
        signature: 'address',
        nock,
        value: keyPrice,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(owner)

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
      setupFail = fail
    }

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(2)

      await nockBeforeEach()
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )

      const mock = walletService._handleMethodCall

      await walletService.purchaseKey(lockAddress, owner, keyPrice)

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.KEY_PURCHASE
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      await result.wait()
      expect(result).toEqual(transactionResult)
      await nock.resolveWhenAllNocksUsed()
    })

    it('should call approveTransfer when the lock is an ERC20 lock', async () => {
      expect.assertions(1)

      await nockBeforeEach()
      setupSuccess()

      const erc20Address = '0x6f7a54d6629b7416e17fc472b4003ae8ef18ef4c'

      // This is very confusing!
      // prepContract above will actually nock things that it does not need to nock
      // The result is that we test the internals of _handleMethodCall in each and
      // every function which uses it.
      // We should have great coverage for `_handleMethodCall` and then confidently
      // mock its behavior inside of each function which actually calls it
      walletService._handleMethodCall = jest.fn(
        async sendTransactionPromise => {
          const result = await sendTransactionPromise
          await result.wait()
          return Promise.resolve(transaction.hash)
        }
      )

      const amountToApprove = Web3Utils.toDecimal(keyPrice, 18)

      await walletService.purchaseKey(
        lockAddress,
        owner,
        keyPrice,
        null,
        null,
        erc20Address
      )

      expect(erc20.approveTransfer).toHaveBeenCalledWith(
        erc20Address,
        lockAddress,
        amountToApprove,
        walletService.provider
      )
      await nock.resolveWhenAllNocksUsed()
    })

    it('should not call approveTransfer when the lock is not an ERC20 lock', async () => {
      expect.assertions(1)

      await nockBeforeEach()
      setupSuccess()

      // This is very confusing!
      // prepContract above will actually nock things that it does not need to nock
      // The result is that we test the internals of _handleMethodCall in each and
      // every function which uses it.
      // We should have great coverage for `_handleMethodCall` and then confidently
      // mock its behavior inside of each function which actually calls it
      walletService._handleMethodCall = jest.fn(
        async sendTransactionPromise => {
          const result = await sendTransactionPromise
          await result.wait()
          return Promise.resolve(transaction.hash)
        }
      )

      await walletService.purchaseKey(lockAddress, owner, keyPrice)

      expect(erc20.approveTransfer).not.toHaveBeenCalled()
      await nock.resolveWhenAllNocksUsed()
    })

    it('should emit an error if the transaction could not be sent', async () => {
      expect.assertions(1)

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach()
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_PURCHASE_KEY)
      })

      await walletService.purchaseKey(lockAddress, owner, keyPrice)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
