import { ethers } from 'ethers'

import abis from '../../abis'
import TransactionTypes from '../../transactionTypes'

import v6 from '../../v6'
import WalletService from '../../walletService'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'

const provider = getTestProvider({})

const UnlockVersion = abis.v6

let walletService

const recipient = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v6.PublicLock.abi,
  provider,
})

const EventInfo = new ethers.utils.Interface(UnlockVersion.PublicLock.abi)
const encoder = ethers.utils.defaultAbiCoder
const tokenId = '1'

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
        encoder.encode(['address'], [recipient]),
        encoder.encode(['uint256'], [tokenId]),
      ],
      data: encoder.encode(
        ['address', 'address', 'uint256'],
        ['0x0000000000000000000000000000000000000000', recipient, tokenId]
      ),
      logIndex: 0,
      blockHash:
        '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
      transactionLogIndex: 0,
    },
  ],
}

const expiration = 1587424756

const grantKeyTransaction = {
  hash: '0xgrantKeyTransaction',
}

const expirationDuration = 60 * 60 * 24 * 7

describe('v6', () => {
  describe('grantKey', () => {
    beforeEach(() => {
      // Mock all the methods
      provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))

      walletService = new WalletService()
      walletService.provider = provider
      walletService.signer = provider.getSigner()
      walletService.lockContractAbiVersion = jest.fn(() => Promise.resolve(v6))
      walletService.getLockContract = jest.fn(() => {
        return Promise.resolve(lockContract)
      })
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(grantKeyTransaction.hash)
      )
      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
      )
      lockContract.grantKeys = jest.fn(() =>
        Promise.resolve(grantKeyTransaction)
      )
      lockContract.expirationDuration = jest.fn(() => expirationDuration)
    })

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(4)

      const newTokenId = await walletService.grantKey(
        {
          lockAddress,
          recipient,
          expiration,
        },
        (error, hash) => {
          if (error) {
            throw error
          }
          expect(hash).toEqual(grantKeyTransaction.hash)
        }
      )

      expect(lockContract.grantKeys).toHaveBeenCalledWith(
        [recipient],
        [expiration],
        {}
      )

      expect(walletService._handleMethodCall).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.GRANT_KEY
      )

      expect(newTokenId).toEqual(tokenId)
    })

    it('should get the duration if none was passed', async () => {
      expect.assertions(4)

      const newTokenId = await walletService.grantKey(
        {
          lockAddress,
          recipient,
        },
        (error, hash) => {
          if (error) {
            throw error
          }

          expect(hash).toEqual(grantKeyTransaction.hash)
        }
      )

      expect(lockContract.grantKeys).toHaveBeenCalledWith(
        [recipient],
        [parseInt(new Date().getTime() / 1000 + expirationDuration)],
        {}
      )

      expect(walletService._handleMethodCall).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.GRANT_KEY
      )

      expect(newTokenId).toEqual(tokenId)
    })
  })
})
