import { ethers } from 'ethers'
import * as UnlockV5 from '@unlock-protocol/unlock-abi-5'
import utils from '../../utils'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import abis from '../../abis'
import { ZERO } from '../../constants'

const UnlockVersion = abis.v5
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
let walletService
let transaction
let transactionResult
let setupSuccess

describe('v5', () => {
  describe('withdrawFromLock', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const beneficiary = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
    const tokenAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'

    async function nockBeforeEach(amount, erc20Address = ZERO) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV5.PublicLock,
        endpoint,
        nock
      )

      const metadata = new ethers.utils.Interface(UnlockV5.PublicLock.abi)
      const contractMethods = metadata.functions
      const resultEncoder = ethers.utils.defaultAbiCoder

      // Mock the call to get erc20Address (only if it has been set!)
      nock.ethCallAndYield(
        contractMethods.tokenAddress.encode([]),
        utils.toChecksumAddress(lockAddress),
        resultEncoder.encode(['uint256'], [erc20Address])
      )

      const callMethodData = prepContract({
        contract: UnlockV5.PublicLock,
        functionName: 'withdraw',
        signature: 'address,uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
      } = callMethodData(erc20Address, utils.toWei(amount, 'ether'))

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
    }

    describe('describe when the lock is an ERC20 lock', () => {
      it('should invoke _handleMethodCall with the right params when no amount has been provided', async () => {
        expect.assertions(3)

        await nockBeforeEach('0', tokenAddress)
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )

        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const encoder = ethers.utils.defaultAbiCoder
        const amount = '1'

        walletService.provider.waitForTransaction = jest.fn(() =>
          Promise.resolve({
            logs: [
              {
                transactionIndex: 0,
                blockNumber: 8861,
                transactionHash:
                  '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                address: lockAddress,

                topics: [
                  EventInfo.events[
                    'Withdrawal(address,address,address,uint256)'
                  ].topic,
                  encoder.encode(['address'], [beneficiary]),
                  encoder.encode(['address'], [tokenAddress]),
                  encoder.encode(['address'], [lockAddress]),
                ],
                data: encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(amount, 'ether'))]
                ),
                logIndex: 0,
                blockHash:
                  '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                transactionLogIndex: 0,
              },
            ],
          })
        )
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
        })
        expect(walletService._handleMethodCall).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.WITHDRAWAL
        )

        // verify that the promise passed to _handleMethodCall actually resolves
        // to the result the chain returns from a sendTransaction call to withdrawFromLock
        const result = await walletService._handleMethodCall.mock.calls[0][0]
        await result.wait()
        expect(result).toEqual(transactionResult)
        await nock.resolveWhenAllNocksUsed()
        expect(withdrawnAmount).toEqual(amount)
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(3)
        const amount = '3'

        await nockBeforeEach(amount, tokenAddress)
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )
        const mock = walletService._handleMethodCall

        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const encoder = ethers.utils.defaultAbiCoder

        walletService.provider.waitForTransaction = jest.fn(() =>
          Promise.resolve({
            logs: [
              {
                transactionIndex: 0,
                blockNumber: 8861,
                transactionHash:
                  '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                address: lockAddress,
                topics: [
                  EventInfo.events[
                    'Withdrawal(address,address,address,uint256)'
                  ].topic,
                  encoder.encode(['address'], [beneficiary]),
                  encoder.encode(['address'], [tokenAddress]),
                  encoder.encode(['address'], [lockAddress]),
                ],
                data: encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(amount, 'ether'))]
                ),
                logIndex: 0,
                blockHash:
                  '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                transactionLogIndex: 0,
              },
            ],
          })
        )
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
          amount,
        })

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
        expect(withdrawnAmount).toEqual(amount)
      })
    })

    describe('describe when the lock is an Ether lock', () => {
      it('should invoke _handleMethodCall with the right params when no amount has been provided', async () => {
        expect.assertions(3)

        await nockBeforeEach('0')
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )

        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const encoder = ethers.utils.defaultAbiCoder
        const amount = '1'

        walletService.provider.waitForTransaction = jest.fn(() =>
          Promise.resolve({
            logs: [
              {
                transactionIndex: 0,
                blockNumber: 8861,
                transactionHash:
                  '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                address: lockAddress,

                topics: [
                  EventInfo.events[
                    'Withdrawal(address,address,address,uint256)'
                  ].topic,
                  encoder.encode(['address'], [beneficiary]),
                  encoder.encode(['address'], [tokenAddress]),
                  encoder.encode(['address'], [lockAddress]),
                ],
                data: encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(amount, 'ether'))]
                ),
                logIndex: 0,
                blockHash:
                  '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                transactionLogIndex: 0,
              },
            ],
          })
        )
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
        })
        expect(walletService._handleMethodCall).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.WITHDRAWAL
        )

        // verify that the promise passed to _handleMethodCall actually resolves
        // to the result the chain returns from a sendTransaction call to withdrawFromLock
        const result = await walletService._handleMethodCall.mock.calls[0][0]
        await result.wait()
        expect(result).toEqual(transactionResult)
        await nock.resolveWhenAllNocksUsed()
        expect(withdrawnAmount).toEqual(amount)
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(3)
        const amount = '3'

        await nockBeforeEach(amount)
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )
        const mock = walletService._handleMethodCall

        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const encoder = ethers.utils.defaultAbiCoder

        walletService.provider.waitForTransaction = jest.fn(() =>
          Promise.resolve({
            logs: [
              {
                transactionIndex: 0,
                blockNumber: 8861,
                transactionHash:
                  '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                address: lockAddress,
                topics: [
                  EventInfo.events[
                    'Withdrawal(address,address,address,uint256)'
                  ].topic,
                  encoder.encode(['address'], [beneficiary]),
                  encoder.encode(['address'], [tokenAddress]),
                  encoder.encode(['address'], [lockAddress]),
                ],
                data: encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(amount, 'ether'))]
                ),
                logIndex: 0,
                blockHash:
                  '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                transactionLogIndex: 0,
              },
            ],
          })
        )
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
          amount,
        })

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
        expect(withdrawnAmount).toEqual(amount)
      })
    })
  })
})
