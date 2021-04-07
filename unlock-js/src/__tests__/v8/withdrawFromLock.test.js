import { ethers } from 'ethers'
import v8 from '../../v8'
import utils from '../../utils'
import { ZERO } from '../../constants'
import erc20 from '../../erc20'
import abis from '../../abis'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'
import WalletService from '../../walletService'

const UnlockVersion = abis.v8
const provider = getTestProvider({})

let walletService

const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
const decimals = 8 // Do not test with 18 which is the default...
const erc20Address = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
const beneficiary = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'

const amount = '20'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v8.PublicLock.abi,
  provider,
})

const EventInfo = new ethers.utils.Interface(UnlockVersion.PublicLock.abi)
const encoder = ethers.utils.defaultAbiCoder

const receipt = {
  logs: [
    {
      transactionIndex: 0,
      blockNumber: 8861,
      transactionHash:
        '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
      address: lockAddress,

      topics: [
        EventInfo.events['Withdrawal(address,address,address,uint256)'].topic,
        encoder.encode(['address'], [beneficiary]),
        encoder.encode(['address'], [erc20Address]),
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
}

const transaction = {
  hash: '0xtransaction',
}
jest.mock('../../erc20.js', () => {
  return { getErc20Decimals: jest.fn() }
})
describe('v8', () => {
  describe('withdrawFromLock', () => {
    beforeEach(() => {
      // Mock all the methods
      provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))

      walletService = new WalletService()
      walletService.provider = provider
      walletService.lockContractAbiVersion = jest.fn(() => Promise.resolve(v8))
      walletService.getLockContract = jest.fn(() => {
        return Promise.resolve(lockContract)
      })
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(transaction.hash)
      )
      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
      )
      lockContract.updateKeyPricing = jest.fn(() =>
        Promise.resolve(transaction)
      )
      lockContract.tokenAddress = jest.fn(() => Promise.resolve(ZERO))
      erc20.getErc20Decimals = jest.fn(() => Promise.resolve(8))
      erc20.approveTransfer = jest.fn()
      erc20.getAllowance = jest.fn()
    })

    describe('describe when the lock is an ERC20 lock', () => {
      beforeEach(() => {
        lockContract.tokenAddress = jest.fn(() => Promise.resolve(erc20Address))
      })

      it('should invoke _handleMethodCall with the right params when no amount has been provided', async () => {
        expect.assertions(2)

        lockContract.withdraw = jest.fn(() => {})
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
        })

        expect(lockContract.withdraw).toHaveBeenCalledWith(
          erc20Address,
          utils.bigNumberify('0')
        )
        expect(withdrawnAmount).toEqual(amount)
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        lockContract.withdraw = jest.fn(() => {})
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
          amount,
        })

        expect(lockContract.withdraw).toHaveBeenCalledWith(
          erc20Address,
          utils.toDecimal(amount, decimals)
        )
        expect(withdrawnAmount).toEqual(amount)
      })
    })

    describe('describe when the lock is an Ether lock', () => {
      beforeEach(() => {
        lockContract.tokenAddress = jest.fn(() => Promise.resolve(ZERO))
      })

      it('should invoke _handleMethodCall with the right params when no amount has been provided', async () => {
        expect.assertions(2)

        lockContract.withdraw = jest.fn(() => {})
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
        })

        expect(lockContract.withdraw).toHaveBeenCalledWith(
          ZERO,
          utils.bigNumberify('0')
        )
        expect(withdrawnAmount).toEqual(amount)
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        lockContract.withdraw = jest.fn(() => {})
        const withdrawnAmount = await walletService.withdrawFromLock({
          lockAddress,
          amount,
        })

        expect(lockContract.withdraw).toHaveBeenCalledWith(
          ZERO,
          utils.toDecimal(amount, 18)
        )
        expect(withdrawnAmount).toEqual(amount)
      })
    })
  })
})
