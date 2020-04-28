import { ethers } from 'ethers'
import * as UnlockV2 from '@unlock-protocol/unlock-abi-2'
import abis from '../../abis'
import utils from '../../utils'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
const UnlockVersion = abis.v2

let walletService
let transaction
let transactionResult
let setupSuccess

describe('v2', () => {
  describe('updateKeyPrice', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const keyPrice = '100000000'

    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV2.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV2.PublicLock,
        functionName: 'updateKeyPrice',
        signature: 'uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
      } = callMethodData(utils.toWei(keyPrice, 'ether'))

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
    }

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(2)

      await nockBeforeEach()
      setupSuccess()

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )
      const mock = walletService._handleMethodCall

      const EventInfo = new ethers.utils.Interface(UnlockVersion.PublicLock.abi)
      const encoder = ethers.utils.defaultAbiCoder
      const oldPrice = '1'
      const newPrice = '2'

      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve({
          logs: [
            {
              transactionIndex: 1,
              blockNumber: 19759,
              transactionHash:
                '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
              address: lockAddress,
              topics: [
                EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(oldPrice, 'ether'))]
                ),
                encoder.encode(
                  ['uint256'],
                  [utils.toRpcResultNumber(utils.toWei(newPrice, 'ether'))]
                ),
              ],
              data: encoder.encode(
                ['uint256', 'uint256'],
                [
                  utils.toRpcResultNumber(utils.toWei(oldPrice, 'ether')),
                  utils.toRpcResultNumber(utils.toWei(newPrice, 'ether')),
                ]
              ),
              logIndex: 0,
              blockHash:
                '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
              transactionLogIndex: 0,
            },
          ],
        })
      )

      const newKeyPrice = await walletService.updateKeyPrice({
        lockAddress,
        keyPrice,
      })
      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to updateKeyPrice
      const result = await mock.mock.calls[0][0]
      await result.wait()
      expect(result).toEqual(transactionResult)
      expect(newKeyPrice).toEqual(newPrice)
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
