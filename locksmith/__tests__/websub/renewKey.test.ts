// see hardhat script https://github.com/unlock-protocol/unlock/blob/8e3b93f0c3b0c1ff0d8d883e2dbe8b01ca029e06/smart-contracts/scripts/renew.js
import { ethers } from 'ethers'
import { KeyRenewal } from '../../src/models'

import { renewKey, isWorthRenewing } from '../../src/websub/helpers/renewKey'

const renewalInfo = {
  network: 31137,
  keyId: 1,
  lockAddress: '0xaaa',
}

const { network, keyId, lockAddress } = renewalInfo

const mockLock = {
  publicLockVersion: async () => 10,
  gasRefundValue: async () => ethers.BigNumber.from(150000),
  estimateGas: {
    renewMembershipFor: async () => ethers.BigNumber.from(115000),
  },
  renewMembershipFor: async () => ({
    hash: 'txhash',
  }),
}

const mockWebService = {
  getLock: jest.fn((lockAddress: string) => {
    switch (lockAddress) {
      case 'v9':
        return { ...mockLock, publicLockVersion: async () => 9 }
      case 'noRefund':
        return {
          ...mockLock,
          gasRefundValue: async () => ethers.BigNumber.from(0),
        }
      case 'highCost':
        return {
          ...mockLock,
          estimateGas: {
            renewMembershipFor: async () => ethers.BigNumber.from(200000),
          },
        }
      default:
        return mockLock
    }
  }),
}

class WalletService {
  connect = jest.fn()

  getLockContract = jest.fn()
}
const mockWalletService = new WalletService()

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWebService
  },
  WalletService: function WalletService() {
    return mockWalletService
  },
}))

jest.mock('../../src/utils/keyPricer', () => {
  return jest.fn(() => {
    return {
      gasFee: (network: number) =>
        Promise.resolve(network === 1 ? 1000000 : 10),
    }
  })
})

describe('isWorthRenewing', () => {
  it('should return gas refund value', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      network,
      lockAddress,
      keyId
    )
    expect(gasRefund).toEqual(150000)
    expect(shouldRenew).toBeTruthy()
  })
  it('should return true when gas refund is enough', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      1,
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
    expect(gasRefund).toEqual(0)
    expect(shouldRenew).toBeTruthy()
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
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should not renew when lock version <10', async () => {
      expect.assertions(1)
      await expect(
        renewKey({ network, lockAddress: 'v9', keyId })
      ).resolves.toMatchObject({
        ...renewalInfo,
        msg: 'Renewal only supported for lock v10+',
      })
    })
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
        msg: 'GasRefundValue (0) does not cover gas cost',
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
        msg: 'GasRefundValue (150000) does not cover gas cost',
      })
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('renewal works', () => {
    it('should renew a key properly', async () => {
      expect.assertions(3)
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
