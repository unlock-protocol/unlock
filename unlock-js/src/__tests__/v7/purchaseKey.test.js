import { ethers } from 'ethers'

import abis from '../../abis'
import TransactionTypes from '../../transactionTypes'

import v7 from '../../v7'
import WalletService from '../../walletService'

import utils from '../../utils'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'

import erc20 from '../../erc20'

import { ZERO } from '../../constants'

const provider = getTestProvider({})

const UnlockVersion = abis.v7

let walletService

const keyPrice = '0.01'
const owner = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
const erc20Address = '0x6F7a54D6629b7416E17fc472B4003aE8EF18EF4c'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v7.PublicLock.abi,
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
        encoder.encode(['address'], [owner]),
        encoder.encode(['uint256'], [tokenId]),
      ],
      data: encoder.encode(
        ['address', 'address', 'uint256'],
        ['0x0000000000000000000000000000000000000000', owner, tokenId]
      ),
      logIndex: 0,
      blockHash:
        '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
      transactionLogIndex: 0,
    },
  ],
}

const keyPurchaseCreationTransaction = {
  hash: '0xkeyPurchaseCreationTransaction',
}

jest.mock('../../erc20.js', () => {
  return {}
})

const decimals = 4
describe('v7', () => {
  describe('purchaseKey', () => {
    beforeEach(() => {
      // Mock all the methods
      provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))

      walletService = new WalletService()
      walletService.provider = provider
      walletService.lockContractAbiVersion = jest.fn(() => Promise.resolve(v7))
      walletService.getLockContract = jest.fn(() => {
        return Promise.resolve(lockContract)
      })
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(keyPurchaseCreationTransaction.hash)
      )
      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
      )
      lockContract.purchase = jest.fn(() =>
        Promise.resolve(keyPurchaseCreationTransaction)
      )
      lockContract.tokenAddress = jest.fn(() => Promise.resolve(ZERO))
      lockContract.keyPrice = jest.fn(() => Promise.resolve(keyPrice))
      erc20.getErc20Decimals = jest.fn(() => Promise.resolve(decimals))
      erc20.approveTransfer = jest.fn()
      erc20.getAllowance = jest.fn()
    })

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(4)

      const newTokenId = await walletService.purchaseKey(
        {
          lockAddress,
          owner,
          keyPrice,
        },
        (error, hash) => {
          if (error) {
            throw error
          }
          expect(hash).toEqual(keyPurchaseCreationTransaction.hash)
        }
      )

      expect(lockContract.purchase).toHaveBeenCalledWith(
        utils.toDecimal(keyPrice, 18),
        owner,
        ZERO,
        [],
        { value: utils.toDecimal(keyPrice, 18) }
      )

      expect(walletService._handleMethodCall).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.KEY_PURCHASE
      )

      expect(newTokenId).toEqual(tokenId)
    })

    it('should yield null if the transaction failed', async () => {
      expect.assertions(1)

      provider.waitForTransaction = jest.fn(() =>
        Promise.resolve({
          logs: [],
        })
      )
      const newTokenId = await walletService.purchaseKey({
        lockAddress,
        owner,
      })
      expect(newTokenId).toEqual(null)
    })

    describe('if the lock is an ERC20 lock', () => {
      beforeEach(() => {
        lockContract.tokenAddress = jest.fn(() => Promise.resolve(erc20Address))
      })

      describe('if the allowance of ERC20 is too small', () => {
        beforeEach(() => {
          erc20.getAllowance = jest.fn(() => Promise.resolve(0))
        })

        it('should call approveTransfer and then set a gasLimit', async () => {
          expect.assertions(3)

          await walletService.purchaseKey({ lockAddress, owner, keyPrice })
          expect(erc20.getAllowance).toHaveBeenCalledWith(
            erc20Address,
            lockAddress,
            walletService.provider,
            walletService.signer
          )

          expect(erc20.approveTransfer).toHaveBeenCalledWith(
            erc20Address,
            lockAddress,
            utils.toDecimal(keyPrice, decimals),
            walletService.provider,
            walletService.signer
          )

          expect(lockContract.purchase).toHaveBeenCalledWith(
            utils.toDecimal(keyPrice, decimals),
            owner,
            ZERO,
            [],
            {
              gasLimit: 500000,
            }
          )
        })

        it('should retrieve the decimals from the ERC20 contract', async () => {
          expect.assertions(1)

          await walletService.purchaseKey({ lockAddress, owner, keyPrice })
          expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
            erc20Address,
            walletService.provider
          )
        })
      })

      describe('if the allowance of ERC20 is high enough', () => {
        beforeEach(() => {
          erc20.getAllowance = jest.fn(() =>
            Promise.resolve(utils.toDecimal(keyPrice, decimals))
          )
        })

        it('should not call approveTransfer', async () => {
          expect.assertions(1)

          await walletService.purchaseKey({ lockAddress, owner, keyPrice })

          expect(erc20.approveTransfer).not.toHaveBeenCalled()
        })
      })
    })

    it('should not call approveTransfer when the lock is not an ERC20 lock', async () => {
      expect.assertions(1)

      lockContract.tokenAddress = jest.fn(() => Promise.resolve(ZERO))

      await walletService.purchaseKey({ lockAddress, owner, keyPrice })

      expect(erc20.approveTransfer).not.toHaveBeenCalled()
    })

    it('should get the price from the lock contract if not supplied', async () => {
      expect.assertions(1)

      lockContract.keyPrice = jest.fn(() => utils.toDecimal(keyPrice, decimals))

      await walletService.purchaseKey({ lockAddress, owner })

      expect(lockContract.keyPrice).toHaveBeenCalled()
    })

    it('should not get the decimals or currency if supplied', async () => {
      expect.assertions(2)
      await walletService.purchaseKey({
        lockAddress,
        owner,
        keyPrice,
        decimals,
      })

      expect(lockContract.keyPrice).not.toHaveBeenCalled()
      expect(erc20.getErc20Decimals).not.toHaveBeenCalled()
    })

    it('should not get the erc20Address if supplied', async () => {
      expect.assertions(1)
      await walletService.purchaseKey({
        lockAddress,
        owner,
        keyPrice,
        decimals,
        erc20Address,
      })

      expect(lockContract.tokenAddress).not.toHaveBeenCalled()
    })
  })
})
