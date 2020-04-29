import { ethers } from 'ethers'
import * as UnlockV0 from '@unlock-protocol/unlock-abi-0'
import v0 from '../../v0'

import { getTestProvider } from '../helpers/provider'
import { getTestUnlockContract } from '../helpers/contracts'
import utils from '../../utils'
import TransactionTypes from '../../transactionTypes'
import { UNLIMITED_KEYS_COUNT } from '../../../lib/constants'
import WalletService from '../../walletService'

let walletService

const provider = getTestProvider({})
provider.waitForTransaction = jest.fn(() => Promise.resolve(receipt))

const unlockContract = getTestUnlockContract({
  abi: v0.Unlock.abi,
  provider,
})

const lockCreationTransaction = {
  hash: '0xlockCreation',
}

lockCreationTransaction.wait = jest.fn(() => lockCreationTransaction)

jest
  .spyOn(unlockContract, 'createLock')
  .mockReturnValue(Promise.resolve(lockCreationTransaction))

const lock = {
  address: '0x0987654321098765432109876543210987654321',
  expirationDuration: 86400, // 1 day
  keyPrice: '0.1', // 0.1 Eth
  maxNumberOfKeys: 100,
}

const EventInfo = new ethers.utils.Interface(UnlockV0.Unlock.abi)
const encoder = ethers.utils.defaultAbiCoder

const receipt = {
  logs: [],
}

describe('v0', () => {
  describe('createLock', () => {
    beforeEach(() => {
      // Mock all the methods
      walletService = new WalletService({
        unlockAddress: '0xunlockAddress',
      })
      walletService.provider = provider
      walletService.unlockContractAbiVersion = jest.fn(() => {
        return v0
      })
      walletService.getUnlockContract = jest.fn(() =>
        Promise.resolve(unlockContract)
      )
      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(lockCreationTransaction.hash)
      )
    })

    it('should get the unlock contract', async () => {
      expect.assertions(1)
      await walletService.createLock(lock)
      expect(walletService.getUnlockContract).toHaveBeenCalled()
    })

    it('should call createLock on the unlock contract with the right params', async () => {
      expect.assertions(1)
      await walletService.createLock(lock)
      const spy = jest.spyOn(unlockContract, 'createLock')
      expect(spy).toHaveBeenCalledWith(
        lock.expirationDuration,
        utils.toWei(lock.keyPrice, 'ether'),
        lock.maxNumberOfKeys
      )
    })

    it('should invoke _handleMethodCall with the right params', async () => {
      expect.assertions(1)

      walletService._handleMethodCall = jest.fn(() =>
        Promise.resolve(lockCreationTransaction.hash)
      )

      await walletService.createLock(lock)

      expect(walletService._handleMethodCall).toHaveBeenCalledWith(
        expect.any(Promise),
        TransactionTypes.LOCK_CREATION
      )
    })

    it('should emit lock.updated with the transaction', async () => {
      expect.assertions(2)

      walletService.on('lock.updated', (lockAddress, update) => {
        expect(lockAddress).toBe(lock.address)
        expect(update).toEqual({
          transaction: lockCreationTransaction.hash,
          balance: '0',
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          outstandingKeys: 0,
        })
      })

      await walletService.createLock(lock)
    })

    it('should convert unlimited keys from UNLIMITED_KEYS_COUNT to ETHERS_MAX_UINT for the function call', async () => {
      expect.assertions(2)

      walletService.on('lock.updated', (lockAddress, update) => {
        expect(lockAddress).toBe(lock.address)
        expect(update).toEqual({
          transaction: lockCreationTransaction.hash,
          balance: '0',
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
          outstandingKeys: 0,
        })
      })

      await walletService.createLock({
        ...lock,
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      })
    })

    it('should yield a promise of lock address', async () => {
      expect.assertions(1)

      // For now we do not use this
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
