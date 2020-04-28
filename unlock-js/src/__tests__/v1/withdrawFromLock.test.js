import { ethers } from 'ethers'
import * as UnlockV1 from '@unlock-protocol/unlock-abi-1'
import utils from '../../utils'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import abis from '../../abis'

const UnlockVersion = abis.v1
const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

let walletService
let transaction
let transactionResult
let setupSuccess

describe('v1', () => {
  describe('withdrawFromLock', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const beneficiary = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'

    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV1.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV1.PublicLock,
        functionName: 'withdraw',
        signature: '',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
      } = callMethodData()

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
    }

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(3)

      await nockBeforeEach()
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )
      const mock = walletService._handleMethodCall

      const EventInfo = new ethers.utils.Interface(UnlockVersion.PublicLock.abi)
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
                EventInfo.events['Withdrawal(address,uint256)'].topic,
                encoder.encode(['address'], [beneficiary]),
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
