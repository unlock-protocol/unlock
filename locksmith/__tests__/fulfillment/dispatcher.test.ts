import { EventEmitter } from 'events'
import { BigNumber, Wallet } from 'ethers'
import Dispatcher, {
  getAllPurchasers,
  getPurchaser,
} from '../../src/fulfillment/dispatcher'
import config from '../../src/config/config'
import { vi } from 'vitest'
const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const standardLock = {
  asOf: 227,
  balance: '0.01',
  expirationDuration: 2592000,
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  outstandingKeys: 1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
}

const mockWeb3Service = {
  getLock: vi
    .fn()
    .mockResolvedValue(standardLock)
    .mockResolvedValueOnce(standardLock),
  isKeyGranter: vi.fn().mockResolvedValue(true),
}

class MockLockContract extends EventEmitter {
  renewMembershipFor = vi.fn()
}

const mockLockContract = new MockLockContract()
class MockWalletService extends EventEmitter {
  connect = vi.fn()

  purchaseKey = vi.fn(() => {
    this.emit(
      'transaction.new',
      'a transaction hash',
      'the sender',
      'the recipient',
      'some data'
    )
  })

  setUnlockAddress = vi.fn()

  grantKeys = vi.fn()

  getLockContract = vi.fn(async () => mockLockContract)

  renewMembershipFor = vi.fn(async () => ({ hash: 'txhash' }))
}

const mockWalletService = new MockWalletService()

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  WalletService: function WalletService() {
    return mockWalletService
  },
}))

vi.mock('@unlock-protocol/networks', () => ({
  default: {
    31337: {
      provider: 'http://127.0.0.1:8545',
      publicProvider: 'http://127.0.0.1:8545',
    },
  },
}))

vi.mock('../../src/utils/gasSettings', () => ({
  getGasSettings: vi.fn(() => {
    return {
      maxFeePerGas: BigInt(40000000000),
      maxPriorityFeePerGas: BigInt(40000000000),
    }
  }),
}))

describe('Dispatcher', () => {
  describe('grantKey', () => {
    it('should call grant keys on the key granter', async () => {
      expect.assertions(1)

      const callback = vi.fn()
      await new Dispatcher().grantKeys(
        lockAddress,
        [{ recipient }],
        31337,
        callback
      )
      expect(mockWalletService.grantKeys).toBeCalledWith(
        {
          lockAddress: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
          expirations: [],
          keyManagers: [],
          recipients: ['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'],
        },
        {
          maxFeePerGas: BigInt(40000000000),
          maxPriorityFeePerGas: BigInt(40000000000),
        },
        callback
      )
    })
  })
  describe('renewMembershipFor', () => {
    it('should call the function from walletService', async () => {
      expect.assertions(1)
      const keyId = '1'

      await new Dispatcher().renewMembershipFor(31337, lockAddress, keyId)

      expect(mockWalletService.renewMembershipFor).toBeCalledWith(
        {
          lockAddress,
          referrer: undefined,
          tokenId: keyId,
        },
        {
          maxFeePerGas: BigInt(40000000000),
          maxPriorityFeePerGas: BigInt(40000000000),
        }
      )
    })
  })
  describe('purchasers (local signer only, no Defender)', () => {
    const localPurchaserAddress = new Wallet(config.purchaserCredentials)
      .address

    it('getAllPurchasers returns only the local purchaser', async () => {
      expect.assertions(2)
      const purchasers = await getAllPurchasers({ network: 31337 })
      expect(purchasers).toHaveLength(1)
      expect(await purchasers[0].getAddress()).toBe(localPurchaserAddress)
    })

    it('getPurchaser returns the local purchaser', async () => {
      expect.assertions(1)
      const purchaser = await getPurchaser({ network: 31337 })
      expect(await purchaser.getAddress()).toBe(localPurchaserAddress)
    })

    it('getPurchaser throws when an unavailable address is requested', async () => {
      expect.assertions(1)
      await expect(
        getPurchaser({
          network: 31337,
          address: '0x0000000000000000000000000000000000000001',
        })
      ).rejects.toThrow('The purchaser at')
    })
  })
})
