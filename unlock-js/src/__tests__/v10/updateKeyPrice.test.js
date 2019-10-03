import { ethers } from 'ethers'
import * as UnlockV10 from 'unlock-abi-1-0'
import utils from '../../utils'
import { ZERO } from '../../constants'
import Errors from '../../errors'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import erc20 from '../../erc20'

const { FAILED_TO_UPDATE_KEY_PRICE } = Errors
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess
let setupFail

jest.mock('../../erc20.js', () => {
  return { getErc20Decimals: jest.fn() }
})

describe('v10', () => {
  describe('updateKeyPrice', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const keyPrice = '100000000'
    const decimals = 8 // Do not test with 18 which is the default...
    const erc20Address = '0x6F7a54D6629b7416E17fc472B4003aE8EF18EF4c'

    async function nockBeforeEach(decimals = 18, erc20Address) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV10.PublicLock,
        endpoint,
        nock
      )

      const metadata = new ethers.utils.Interface(UnlockV10.PublicLock.abi)
      const contractMethods = metadata.functions
      const resultEncoder = ethers.utils.defaultAbiCoder

      // Mock the call to get erc20Address (only if it has been set!)
      if (erc20Address) {
        nock.ethCallAndYield(
          contractMethods.tokenAddress.encode([]),
          utils.toChecksumAddress(lockAddress),
          resultEncoder.encode(['uint256'], [erc20Address])
        )
      }

      const callMethodData = prepContract({
        contract: UnlockV10.PublicLock,
        functionName: 'updateKeyPrice',
        signature: 'uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
        fail,
      } = callMethodData(utils.toDecimal(keyPrice, decimals))

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
      setupFail = fail
    }

    describe('when the decimals are passed', () => {
      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        await nockBeforeEach(decimals)
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )
        const mock = walletService._handleMethodCall

        await walletService.updateKeyPrice({ lockAddress, keyPrice, decimals })

        expect(mock).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.UPDATE_KEY_PRICE
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
        await nockBeforeEach(decimals)
        setupFail(error)

        walletService.on('error', error => {
          expect(error.message).toBe(FAILED_TO_UPDATE_KEY_PRICE)
        })

        await walletService.updateKeyPrice({ lockAddress, keyPrice, decimals })
        await nock.resolveWhenAllNocksUsed()
      })
    })

    describe('when the decimals are not passed', () => {
      describe('when the erc20Address is passed', () => {
        it('should retrieve the decimals from the contract', async () => {
          expect.assertions(1)

          await nockBeforeEach(decimals)
          setupSuccess()

          walletService._handleMethodCall = jest.fn(() =>
            Promise.resolve(transaction.hash)
          )
          const mock = walletService._handleMethodCall

          // For ERC20 lock, we will retrieve the decimals
          if (erc20Address !== ZERO) {
            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.resolve(decimals)
            })
          }
          await walletService.updateKeyPrice({
            lockAddress,
            keyPrice,
            erc20Address,
          })

          expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
            erc20Address,
            walletService.provider
          )
          // verify that the promise passed to _handleMethodCall actually resolves
          // to the result the chain returns from a sendTransaction call to createLock
          const result = await mock.mock.calls[0][0]
          await result.wait()
          await nock.resolveWhenAllNocksUsed()
        })
      })
      describe('when the erc20Address is not passed', () => {
        describe('when the lock is an ERC20 lock', () => {
          it('should retrieve the decimals from the contract', async () => {
            expect.assertions(1)

            await nockBeforeEach(decimals, erc20Address)
            setupSuccess()

            walletService._handleMethodCall = jest.fn(() =>
              Promise.resolve(transaction.hash)
            )
            const mock = walletService._handleMethodCall

            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.resolve(decimals)
            })
            await walletService.updateKeyPrice({
              lockAddress,
              keyPrice,
            })

            expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
              erc20Address,
              walletService.provider
            )
            // verify that the promise passed to _handleMethodCall actually resolves
            // to the result the chain returns from a sendTransaction call to createLock
            const result = await mock.mock.calls[0][0]
            await result.wait()
            await nock.resolveWhenAllNocksUsed()
          })
        })
        describe('when the lock is an Ether lock', () => {
          it('should use 18 as decimals', async () => {
            expect.assertions(1)

            await nockBeforeEach(
              18 /* decimals for an ether lock */,
              ZERO /* no erc20 contract */
            )
            setupSuccess()

            walletService._handleMethodCall = jest.fn(() =>
              Promise.resolve(transaction.hash)
            )
            const mock = walletService._handleMethodCall

            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.resolve(decimals)
            })
            await walletService.updateKeyPrice({
              lockAddress,
              keyPrice,
            })

            expect(erc20.getErc20Decimals).not.toHaveBeenCalled()

            // verify that the promise passed to _handleMethodCall actually resolves
            // to the result the chain returns from a sendTransaction call to createLock
            const result = await mock.mock.calls[0][0]
            await result.wait()
            await nock.resolveWhenAllNocksUsed()
          })
        })
      })
    })
  })
})
