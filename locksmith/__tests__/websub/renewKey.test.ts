// see hardhat script https://github.com/unlock-protocol/unlock/blob/8e3b93f0c3b0c1ff0d8d883e2dbe8b01ca029e06/smart-contracts/scripts/renew.js
import { BigNumber } from 'ethers'
import { KeyRenewal } from '../../src/models'
import { vi } from 'vitest'
import { renewKey, isWorthRenewing } from '../../src/websub/helpers/renewKey'

const renewalInfo = {
  network: 31137,
  keyId: '1',
  lockAddress: '0xaaa',
}

const { network, keyId, lockAddress } = renewalInfo

const mockLock = {
  publicLockVersion: async () => 10,
  gasRefundValue: async () => BigNumber.from(150000),
  estimateGas: {
    renewMembershipFor: async () => BigNumber.from(115000),
  },
  renewMembershipFor: async () => ({
    hash: 'txhash',
  }),
}

const mockLockFunctions = vi.fn((lockAddress: string) => {
  switch (lockAddress) {
    case 'v9':
      return { ...mockLock, publicLockVersion: async () => 9 }
    case 'noRefund':
      return {
        ...mockLock,
        gasRefundValue: async () => BigNumber.from(0),
      }
    case 'highCost':
      return {
        ...mockLock,
        estimateGas: {
          renewMembershipFor: async () => BigNumber.from(200000),
        },
      }
    default:
      return mockLock
  }
})

const mockGetLockContract = vi.fn((lockAddress: string) => ({
  ...mockLockFunctions(lockAddress),
  connect: vi.fn(() => mockLockFunctions(lockAddress)),
}))

const mockWeb3Service = {
  getLockContract: mockGetLockContract,
  getLock: vi.fn(() => ({
    currencyContractAddress: '0xtestToken',
    currencySymbol: 'TEST',
  })),
}

const mockWalletService = {
  connect: vi.fn(),
  getLockContract: mockGetLockContract,
  renewMembershipFor: async () => ({
    hash: 'txhash',
  }),
}

vi.mock('@unlock-protocol/networks', () => {
  return {
    default: {
      1: {},
      31137: {},
    },
  }
})

vi.mock('ethers', async () => {
  const original = await vi.importActual<any>('ethers')
  const provider = vi.fn(() => ({
    getFeeData: vi.fn(() => ({
      maxFeePerGas: BigNumber.from(10),
      maxPriorityFeePerGas: BigNumber.from(20),
      catch: vi.fn(),
    })),
  }))
  return {
    ...original,
    Wallet: {
      createRandom: vi.fn(() => ({
        address: '0x',
        connect: vi.fn(),
      })),
    },
    Contract: vi.fn(() => ({
      decimals: vi.fn(),
    })),
    ethers: {
      ...original.ethers,
      providers: {
        JsonRpcProvider: provider,
        JsonRpcBatchProvider: provider,
      },
      Wallet: vi.fn(),
      utils: {
        formatUnits: vi.fn(() => '0.01'),
      },
    },
  }
})

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  WalletService: function WalletService() {
    return mockWalletService
  },
}))

vi.mock('../../src/utils/keyPricer', () => {
  return {
    default: vi.fn(() => {
      return {
        GAS_COST: 1000,
      }
    }),
  }
})

vi.mock('../../src/utils/gasPrice', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        gasPriceUSD: (network: number) =>
          Promise.resolve(network === 1 ? 10 : 1),
      }
    }),
  }
})

vi.mock('isomorphic-fetch', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        json: async () => ({
          data: { base: 'USDT', currency: 'USD', amount: 1 },
        }),
        ok: true,
      }
    }),
  }
})

describe('isWorthRenewing', () => {
  it('should return true when gas refund is enough', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      network,
      lockAddress,
      keyId
    )
    expect(gasRefund).toEqual(150000)
    expect(shouldRenew).toBeTruthy()
  })
  it('should return true when gas fee is covered', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      network,
      'noRefund',
      keyId
    )
    expect(shouldRenew).toBeTruthy()
    expect(gasRefund).toEqual(0)
  })
  it('should return false when both conditions arent unmet (gasrefund too low + higher than max covered)', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      1,
      'noRefund',
      keyId
    )
    expect(gasRefund).toEqual(0)
    expect(shouldRenew).toBeFalsy()
  })
})

describe('renewKey', () => {
  describe('abort on non-reccuring locks', () => {
    it('should not renew if lock gas refund is not set and cost are not covered', async () => {
      expect.assertions(1)
      const renewal = await renewKey({
        network: 1,
        lockAddress: 'noRefund',
        keyId,
      })
      expect(renewal).toMatchObject({
        ...renewalInfo,
        network: 1,
        lockAddress: 'noRefund',
        error: 'GasRefundValue (0) does not cover gas cost',
      })
    })
    it('should not renew if lock gas refund is not sufficient and cost are not covered', async () => {
      expect.assertions(1)
      const renewal = await renewKey({
        network: 1,
        lockAddress: 'highCost',
        keyId,
      })
      expect(renewal).toMatchObject({
        ...renewalInfo,
        network: 1,
        lockAddress: 'highCost',
        error: 'GasRefundValue (150000) does not cover gas cost',
      })
    })
  })

  describe('renewal works', () => {
    it('should renew a key properly', async () => {
      expect.assertions(2)
      const renewal = await renewKey({ network, keyId, lockAddress })
      expect(renewal).toBeInstanceOf(Object)
      expect(renewal).toEqual({
        ...renewalInfo,
        tx: 'txhash',
      })
    })
    it('should store renewal info in the db', async () => {
      expect.assertions(3)
      // clean up table
      await KeyRenewal.destroy({
        where: {},
        truncate: true,
      })
      // make sure its empty
      const dbBefore = await KeyRenewal.findOne({
        where: {
          keyId: `${keyId}`,
          lockAddress,
        },
      })
      expect(dbBefore).toBe(null)
      await renewKey({ network, keyId, lockAddress })
      const dbAfter = await KeyRenewal.findOne({
        where: {
          keyId: `${keyId}`,
          lockAddress,
        },
      })
      expect(dbAfter).not.toBe(null)
      expect(dbAfter).toMatchObject({
        lockAddress,
        keyId: `${keyId}`,
        tx: 'txhash',
        network,
      })
    })
  })
})
