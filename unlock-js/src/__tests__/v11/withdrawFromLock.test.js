import * as UnlockV11 from 'unlock-abi-1-1'
import utils from '../../utils'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'

const { FAILED_TO_WITHDRAW_FROM_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail

describe('v11', () => {
  describe('withdrawFromLock', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'

    async function nockBeforeEach(amount) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV11.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV11.PublicLock,
        functionName: 'withdraw',
        signature: 'uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(utils.toWei(amount, 'ether'))

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
      setupFail = fail
    }

    it('should invoke _handleMethodCall with the right params when no amount has been provided', async () => {
      expect.assertions(2)

      await nockBeforeEach('0')
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )
      const mock = walletService._handleMethodCall

      await walletService.withdrawFromLock({ lockAddress })

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.WITHDRAWAL
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      await result.wait()
      expect(result).toEqual(transactionResult)
      await nock.resolveWhenAllNocksUsed()
    })

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(2)
      const amount = '3'

      await nockBeforeEach(amount)
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )
      const mock = walletService._handleMethodCall

      await walletService.withdrawFromLock({ lockAddress, amount })

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.WITHDRAWAL
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      await result.wait()
      expect(result).toEqual(transactionResult)
      await nock.resolveWhenAllNocksUsed()
    })

    it('should emit an error if the transaction cannot be sent', async () => {
      expect.assertions(1)
      const amount = '3'

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach(amount)
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
      })

      await walletService.withdrawFromLock({ lockAddress, amount })
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
