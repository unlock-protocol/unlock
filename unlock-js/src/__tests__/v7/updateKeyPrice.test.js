import { ethers } from 'ethers'
import v7 from '../../v7'
import utils from '../../utils'
import { ZERO } from '../../constants'
import erc20 from '../../erc20'
import abis from '../../abis'

import { getTestProvider } from '../helpers/provider'
import { getTestLockContract } from '../helpers/contracts'
import WalletService from '../../walletService'

const UnlockVersion = abis.v7
const provider = getTestProvider({})

let walletService

const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
const keyPrice = '2' // new keyPrice
const oldPrice = '1'
const decimals = 8 // Do not test with 18 which is the default...
const erc20Address = '0x6F7a54D6629b7416E17fc472B4003aE8EF18EF4c'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v7.PublicLock.abi,
  provider,
})

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
        EventInfo.events['PricingChanged(uint256,uint256,address,address)']
          .topic,
        encoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber(utils.toDecimal(oldPrice, decimals))]
        ),
        encoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber(utils.toDecimal(keyPrice, decimals))]
        ),
        encoder.encode(['address'], [ZERO]),
        encoder.encode(['address'], [ZERO]),
      ],
      data: encoder.encode(
        ['uint256', 'uint256', 'address', 'address'],
        [
          utils.toRpcResultNumber(utils.toDecimal(oldPrice, decimals)),
          utils.toRpcResultNumber(utils.toDecimal(keyPrice, decimals)),
          ZERO,
          ZERO,
        ]
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
describe('v7', () => {
  describe('updateKeyPrice', () => {
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
        Promise.resolve(transaction.hash)
      )
      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve(receipt)
      )
      lockContract.updateKeyPricing = jest.fn(() =>
        Promise.resolve(transaction)
      )
      lockContract.tokenAddress = jest.fn(() => Promise.resolve(ZERO))
      lockContract.keyPrice = jest.fn(() => Promise.resolve(keyPrice))
      erc20.getErc20Decimals = jest.fn(() => Promise.resolve(decimals))
      erc20.approveTransfer = jest.fn()
      erc20.getAllowance = jest.fn()
    })

    it('should invoke updateKeyPricing with the right params', async () => {
      expect.assertions(2)
      const newKeyPrice = await walletService.updateKeyPrice({
        lockAddress,
        keyPrice,
        decimals,
      })
      expect(lockContract.updateKeyPricing).toHaveBeenCalledWith(
        utils.toDecimal(keyPrice, decimals),
        ZERO
      )
      expect(newKeyPrice).toEqual(keyPrice)
    })

    describe('when the ERC20 address is not provided', () => {
      it('should retrieve it from the contract', async () => {
        expect.assertions(2)

        lockContract.tokenAddress = jest.fn(() => Promise.resolve(erc20Address))
        await walletService.updateKeyPrice({
          lockAddress,
          keyPrice,
        })
        expect(lockContract.tokenAddress).toHaveBeenCalled()
        expect(lockContract.updateKeyPricing).toHaveBeenCalledWith(
          utils.toDecimal(keyPrice, decimals),
          erc20Address
        )
      })
    })

    describe('when the decimals are not passed', () => {
      describe('when lock is an ERC20 lock', () => {
        it('should retrieve the decimals from the contract', async () => {
          expect.assertions(1)
          erc20.getErc20Decimals = jest.fn(() => Promise.resolve(decimals))

          await walletService.updateKeyPrice({
            lockAddress,
            keyPrice,
            erc20Address,
          })
          expect(lockContract.updateKeyPricing).toHaveBeenCalledWith(
            utils.toDecimal(keyPrice, decimals),
            erc20Address
          )
        })
      })
      describe('when lock is an Ether lock', () => {
        it('should use the default of 18 decimals', async () => {
          expect.assertions(1)

          await walletService.updateKeyPrice({
            lockAddress,
            keyPrice,
            erc20Address: ZERO,
          })
          expect(lockContract.updateKeyPricing).toHaveBeenCalledWith(
            utils.toDecimal(keyPrice, 18),
            ZERO
          )
        })
      })
    })
  })
})
