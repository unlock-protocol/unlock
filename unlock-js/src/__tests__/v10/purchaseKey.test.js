import { ethers } from 'ethers'
import * as UnlockV10 from 'unlock-abi-1-0'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import erc20 from '../../erc20'
import utils from '../../utils'
import { ZERO } from '../../constants'

const { FAILED_TO_PURCHASE_KEY } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail

jest.mock('../../erc20.js', () => {
  return { approveTransfer: jest.fn(), getErc20Decimals: jest.fn() }
})

describe('v10', () => {
  describe('purchaseKey', () => {
    const keyPrice = '0.01'
    const owner = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const erc20Address = '0x6F7a54D6629b7416E17fc472B4003aE8EF18EF4c'

    async function nockBeforeEach(
      purchaseForOptions = {},
      { erc20Address, decimals } = {}
    ) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV10.PublicLock,
        endpoint,
        nock
      )

      const metadata = new ethers.utils.Interface(UnlockV10.PublicLock.abi)
      const contractMethods = metadata.functions
      const resultEncoder = ethers.utils.defaultAbiCoder

      // Gets the erc20Address
      nock.ethCallAndYield(
        contractMethods.tokenAddress.encode([]),
        utils.toChecksumAddress(lockAddress),
        resultEncoder.encode(['uint256'], [erc20Address || ZERO])
      )

      // If we have an ERC20, we will get the decimals
      if (erc20Address && erc20Address !== ZERO) {
        // Gets the decimals
        erc20.getErc20Decimals = jest.fn(() => {
          return Promise.resolve(decimals || 18)
        })
      }

      // Reset the mocks
      erc20.approveTransfer = jest.fn(() => {
        return Promise.resolve()
      })

      const callMethodData = prepContract({
        contract: UnlockV10.PublicLock,
        functionName: 'purchaseFor',
        signature: 'address',
        nock,
        ...purchaseForOptions,
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

      await nockBeforeEach({ value: keyPrice })
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )

      const mock = walletService._handleMethodCall

      await walletService.purchaseKey({ lockAddress, owner, keyPrice })

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

    describe('if the lock is an ERC20 lock', () => {
      it('should call approveTransfer', async () => {
        expect.assertions(1)
        await nockBeforeEach({ value: keyPrice }, { erc20Address, decimals: 4 })
        setupSuccess()

        walletService._handleMethodCall = jest.fn(
          async sendTransactionPromise => {
            const result = await sendTransactionPromise
            await result.wait()
            return Promise.resolve(transaction.hash)
          }
        )

        await walletService.purchaseKey({ lockAddress, owner, keyPrice })

        expect(erc20.approveTransfer).toHaveBeenCalledWith(
          erc20Address,
          lockAddress,
          utils.toDecimal(keyPrice, 4),
          walletService.provider
        )

        await nock.resolveWhenAllNocksUsed()
      })

      it('should retrieve the decimals from the ERC20 contract', async () => {
        expect.assertions(1)
        await nockBeforeEach({ value: keyPrice }, { erc20Address, decimals: 4 })
        setupSuccess()

        walletService._handleMethodCall = jest.fn(
          async sendTransactionPromise => {
            const result = await sendTransactionPromise
            await result.wait()
            return Promise.resolve(transaction.hash)
          }
        )

        await walletService.purchaseKey({ lockAddress, owner, keyPrice })

        expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
          erc20Address,
          walletService.provider
        )

        await nock.resolveWhenAllNocksUsed()
      })
    })

    it('should not call approveTransfer when the lock is not an ERC20 lock', async () => {
      expect.assertions(1)

      await nockBeforeEach({ value: keyPrice })
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

      await walletService.purchaseKey({ lockAddress, owner, keyPrice })

      expect(erc20.approveTransfer).not.toHaveBeenCalled()
      await nock.resolveWhenAllNocksUsed()
    })

    it('should emit an error if the transaction could not be sent', async () => {
      expect.assertions(1)

      const error = { code: 404, data: 'oops' }
      await nockBeforeEach({ value: keyPrice })
      setupFail(error)

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_PURCHASE_KEY)
      })

      await walletService.purchaseKey({ lockAddress, owner, keyPrice })
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
