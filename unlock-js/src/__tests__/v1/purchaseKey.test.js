import { ethers } from 'ethers'
import * as UnlockV1 from '@unlock-protocol/unlock-abi-1'
import abis from '../../abis'
import utils from '../../utils'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
const UnlockVersion = abis.v1

let walletService
let transaction
let transactionResult
let setupSuccess

describe('v1', () => {
  describe('purchaseKey', () => {
    const keyPrice = '0.01'
    const owner = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'

    const EventInfo = new ethers.utils.Interface(UnlockVersion.PublicLock.abi)
    const encoder = ethers.utils.defaultAbiCoder
    const receipt = {
      logs: [
        {
          transactionIndex: 1,
          blockNumber: 19759,
          transactionHash:
            '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
          address: lockAddress,
          topics: [
            EventInfo.events['Transfer(address,address,uint256)'].topic,
            encoder.encode(
              ['address'],
              ['0x0000000000000000000000000000000000000000']
            ),
            encoder.encode(['address'], [owner]),
            encoder.encode(['uint256'], [owner]),
          ],
          data: encoder.encode(
            ['address', 'address', 'uint256'],
            ['0x0000000000000000000000000000000000000000', owner, owner]
          ),
          logIndex: 0,
          blockHash:
            '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
          transactionLogIndex: 0,
        },
      ],
    }
    async function nockBeforeEach() {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV1.PublicLock,
        endpoint,
        nock
      )

      const callMethodData = prepContract({
        contract: UnlockV1.PublicLock,
        functionName: 'purchaseFor',
        signature: 'address',
        nock,
        value: keyPrice,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
      } = callMethodData(owner)

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
      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
      )

      const tokenId = await walletService.purchaseKey({
        lockAddress,
        owner,
        keyPrice,
      })

      expect(mock).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.KEY_PURCHASE
      )

      // verify that the promise passed to _handleMethodCall actually resolves
      // to the result the chain returns from a sendTransaction call to createLock
      const result = await mock.mock.calls[0][0]
      await result.wait()
      expect(result).toEqual(transactionResult)
      expect(tokenId).toEqual(utils.bigNumberify(owner).toString())
      await nock.resolveWhenAllNocksUsed()
    })
  })
})
