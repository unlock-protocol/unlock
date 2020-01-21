import { ethers } from 'ethers'
import abis from '../../abis'
import v0 from '../../v0'
import WalletService from '../../walletService'
import TransactionTypes from '../../transactionTypes'

import utils from '../../utils'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'

const UnlockVersion = abis.v0

let walletService

const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'

const oldPrice = '1'
const newPrice = '2'

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
}

const provider = getTestProvider({})
provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))
const lockContract = getTestLockContract({
  lockAddress,
  abi: v0.PublicLock.abi,
  provider,
})
const updateKeyPriceTransaction = {
  hash: '0xupdateKeyPrice',
}

const keyPrice = '100000000'

describe('v0', () => {
  describe('updateKeyPrice', () => {
    beforeEach(() => {
      // Mock all the methods
      walletService = new WalletService({
        unlockAddress: '0xunlockAddress',
      })
      walletService.provider = provider
      walletService.lockContractAbiVersion = jest.fn(() => Promise.resolve(v0))
      walletService.getLockContract = jest.fn(() =>
        Promise.resolve(lockContract)
      )
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(updateKeyPriceTransaction.hash)
      )
      lockContract.updateKeyPrice = jest.fn(() =>
        Promise.resolve(updateKeyPriceTransaction)
      )
    })

    it('should get the lock contract based on its address', async () => {
      expect.assertions(1)
      await walletService.updateKeyPrice({
        lockAddress,
        keyPrice,
      })

      expect(walletService.getLockContract).toHaveBeenCalledWith(lockAddress)
    })

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(2)
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(updateKeyPriceTransaction.hash)
      )

      const newKeyPrice = await walletService.updateKeyPrice({
        lockAddress,
        keyPrice,
      })

      expect(walletService._handleMethodCall).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.UPDATE_KEY_PRICE
      )
      expect(newKeyPrice).toEqual(newPrice)
    })
  })
})
