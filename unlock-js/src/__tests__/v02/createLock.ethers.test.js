import { ethers } from 'ethers'
import * as UnlockV02 from 'unlock-abi-0-2'
import * as utils from '../../utils.ethers'
import createLock from '../../v02/createLock.ethers'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import {
  prepWalletService,
  prepContract,
} from '../helpers/walletServiceHelper.ethers'

const { FAILED_TO_CREATE_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)

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
const owner = '0xdeadfeed'

describe('v02 (ethers)', () => {
  describe('createLock', () => {
    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV02.Unlock,
        endpoint,
        nock,
        true // this is the Unlock contract, not PublicLock
      )
      walletService.createLock = createLock.bind(walletService)

      const callMethodData = prepContract({
        contract: UnlockV02.Unlock,
        functionName: 'createLock',
        signature: 'uint256,address,uint256,uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(
        lock.expirationDuration,
        ethers.constants.AddressZero,
        utils.toWei(lock.keyPrice, 'ether'),
        lock.maxNumberOfKeys
      )

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

      await walletService.createLock(lock, owner)

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.LOCK_CREATION
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      expect(result).toEqual(transactionResult)
      await nock.resolveWhenAllNocksUsed()
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
          owner,
        })
      })

      await walletService.createLock(lock, owner)
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

      await walletService.createLock(lock, owner)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
