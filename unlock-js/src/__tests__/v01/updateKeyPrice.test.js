import * as UnlockV01 from 'unlock-abi-0-1'
import * as utils from '../../utils.ethers'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'

const { FAILED_TO_UPDATE_KEY_PRICE } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail

describe('v01', () => {
  describe('updateKeyPrice', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const account = '0xdeadbeef'
    const price = '100000000'

    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV01.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV01.PublicLock,
        functionName: 'updateKeyPrice',
        signature: 'uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(utils.toWei(price, 'ether'))

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

      await walletService.updateKeyPrice(lockAddress, account, price)

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.UPDATE_KEY_PRICE
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      expect(result).toEqual(transactionResult)
      await nock.resolveWhenAllNocksUsed()
    })

    it('should emit an error if the transaction could not be sent', async () => {
      expect.assertions(1)

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach()
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_UPDATE_KEY_PRICE)
      })

      await walletService.updateKeyPrice(lockAddress, account, price)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
