import * as UnlockV0 from 'unlock-abi-0'
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

describe('v0', () => {
  describe('withdrawFromLock', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const account = '0xdeadbeef'

    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV0.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV0.PublicLock,
        functionName: 'withdraw',
        signature: '',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData()

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

      await walletService.withdrawFromLock(lockAddress, account)

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

    it('should emit an error if the transaction could not be sent', async () => {
      expect.assertions(1)

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach()
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
      })
      await walletService.withdrawFromLock(lockAddress, account)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
