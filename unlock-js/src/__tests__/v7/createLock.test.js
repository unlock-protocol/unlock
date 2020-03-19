import { ethers } from 'ethers'

import abis from '../../abis'

import v13 from '../../v13'
import WalletService from '../../walletService'
import TransactionTypes from '../../transactionTypes'
import utils from '../../utils'

import { getTestProvider } from '../helpers/provider'
import { getTestUnlockContract } from '../helpers/contracts'

import {
  UNLIMITED_KEYS_COUNT,
  ETHERS_MAX_UINT,
  ZERO,
} from '../../../lib/constants'
import erc20 from '../../erc20'

const UnlockVersion = abis.v13

let walletService

const lock = {
  name: 'My Fancy Lock',
  address: '0x0987654321098765432109876543210987654321',
  expirationDuration: 86400, // 1 day
  keyPrice: '0.1', // 0.1 Eth
  maxNumberOfKeys: 100,
}

jest.mock('../../erc20.js', () => {
  return {
    getErc20Decimals: jest.fn(() => Promise.resolve(18)),
  }
})

const provider = getTestProvider({})
provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))

const unlockContract = getTestUnlockContract({
  abi: v13.Unlock.abi,
  provider,
})
const testERC20ContractAddress = '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3'

const EventInfo = new ethers.utils.Interface(UnlockVersion.Unlock.abi)
const encoder = ethers.utils.defaultAbiCoder

const receipt = {
  logs: [],
}

const lockCreationTransaction = {
  hash: '0xcreateLock',
}

describe('v13', () => {
  beforeEach(() => {
    // Mock all the methods
    walletService = new WalletService({
      unlockAddress: '0xunlockAddress',
    })
    walletService.provider = provider
    walletService.unlockContractAbiVersion = jest.fn(() => Promise.resolve(v13))
    walletService.getUnlockContract = jest.fn(() => {
      return Promise.resolve(unlockContract)
    })
    unlockContract.createLock = jest.fn(() =>
      Promise.resolve(lockCreationTransaction)
    )

    walletService._handleMethodCall = jest.fn(() =>
      Promise.resolve(lockCreationTransaction.hash)
    )
  })

  describe('createLock', () => {
    describe('when not explicitly providing the address of a denominating currency contract ', () => {
      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)
        await walletService.createLock(lock)
        const salt = utils.sha3(utils.utf8ToHex(lock.name)).substring(0, 26)

        expect(unlockContract.createLock).toHaveBeenCalledWith(
          lock.expirationDuration,
          ZERO,
          { _hex: '0x016345785d8a0000' },
          lock.maxNumberOfKeys,
          lock.name,
          salt // lock salt
        )
        expect(walletService._handleMethodCall).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.LOCK_CREATION
        )
      })
    })

    describe('when providing the address of a denominating currency contract', () => {
      let erc20Lock

      beforeEach(() => {
        erc20Lock = {
          name: 'ERC20 Lock',
          address: '0x0987654321098765432109876543210987654321',
          expirationDuration: 86400, // 1 day
          keyPrice: '0.1', // 0.1 Eth
          maxNumberOfKeys: 100,
          currencyContractAddress: testERC20ContractAddress,
        }
      })

      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        await walletService.createLock(erc20Lock)
        const salt = utils
          .sha3(utils.utf8ToHex(erc20Lock.name))
          .substring(0, 26)

        expect(unlockContract.createLock).toHaveBeenCalledWith(
          erc20Lock.expirationDuration,
          erc20Lock.currencyContractAddress,
          { _hex: '0x016345785d8a0000' },
          erc20Lock.maxNumberOfKeys,
          erc20Lock.name,
          salt // lock salt
        )
        expect(walletService._handleMethodCall).toHaveBeenCalledWith(
          expect.any(Promise),
          TransactionTypes.LOCK_CREATION
        )
      })

      it('should emit lock.updated with the right params', async () => {
        expect.assertions(2)

        walletService.on('lock.updated', (lockAddress, update) => {
          expect(lockAddress).toBe(erc20Lock.address)
          expect(update).toEqual({
            transaction: lockCreationTransaction.hash,
            balance: '0',
            expirationDuration: erc20Lock.expirationDuration,
            keyPrice: erc20Lock.keyPrice,
            maxNumberOfKeys: erc20Lock.maxNumberOfKeys,
            outstandingKeys: 0,
            name: erc20Lock.name,
            currencyContractAddress: testERC20ContractAddress,
          })
        })

        await walletService.createLock(erc20Lock)
      })

      it('should retrieve the locks number of decimals to convert the key price to the right unit', async () => {
        expect.assertions(2)

        const decimals = 9
        erc20.getErc20Decimals = jest.fn(() => {
          return Promise.resolve(decimals)
        })
        await walletService.createLock(erc20Lock)

        expect(unlockContract.createLock).toHaveBeenCalledWith(
          erc20Lock.expirationDuration,
          erc20Lock.currencyContractAddress,
          { _hex: '0x05f5e100' },
          erc20Lock.maxNumberOfKeys,
          erc20Lock.name,
          expect.any(String) // lock salt
        )
        expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
          erc20Lock.currencyContractAddress,
          provider
        )
      })
    })

    it('should callback with the transaction hash', async done => {
      expect.assertions(1)

      await walletService.createLock(lock, (error, hash) => {
        expect(hash).toEqual(lockCreationTransaction.hash)
        done()
      })
    })

    it('should convert unlimited keys from UNLIMITED_KEYS_COUNT to ETHERS_MAX_UINT for the function call', async () => {
      expect.assertions(1)

      await walletService.createLock({
        ...lock,
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      })

      expect(unlockContract.createLock).toHaveBeenCalledWith(
        lock.expirationDuration,
        ZERO,
        { _hex: '0x016345785d8a0000' },
        ETHERS_MAX_UINT,
        lock.name,
        expect.any(String) // lock salt
      )
    })

    it('should yield a promise of lock address', async () => {
      expect.assertions(1)
      const sender = '0x0000000000000000000000000000000000000000'

      walletService.provider.waitForTransaction = jest.fn(() =>
        Promise.resolve({
          logs: [
            {
              transactionIndex: 1,
              blockNumber: 19759,
              transactionHash:
                '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
              address: lock.address,
              topics: [
                EventInfo.events['NewLock(address,address)'].topic,
                encoder.encode(['address'], [sender]),
                encoder.encode(['address'], [lock.address]),
              ],
              data: '0x',
              logIndex: 0,
              blockHash:
                '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
              transactionLogIndex: 0,
            },
          ],
        })
      )
      const lockAddress = await walletService.createLock(lock)
      expect(lockAddress).toEqual(lock.address)
    })
  })
})
