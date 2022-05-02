// see hardhat script https://github.com/unlock-protocol/unlock/blob/8e3b93f0c3b0c1ff0d8d883e2dbe8b01ca029e06/smart-contracts/scripts/renew.js
import { ethers } from 'ethers'
import { KeyRenewal } from '../../src/models'

import {
  renewMembershipFor,
  isWorthRenewing,
} from '../../src/websub/helpers/renewKey'

const network = 31137
const keyId = 1

const mockLock = {
  address: '0xaaa',
  publicLockVersion: async () => 10,
  gasRefundValue: async () => ethers.BigNumber.from(150000),
  estimateGas: {
    renewMembershipFor: async () => ethers.BigNumber.from(115000),
  },
  renewMembershipFor: async () => ({
    hash: 'txhash',
  }),
}
const renewalInfo = {
  network,
  keyId,
  lockAddress: mockLock.address,
}

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
      mockLock,
      keyId
    )
    expect(gasRefund).toEqual(150000)
    expect(shouldRenew).toBeTruthy()
  })
  it('should return true when gas refund is enough', async () => {
    expect.assertions(2)
    const { shouldRenew, gasRefund } = await isWorthRenewing(1, mockLock, keyId)
    expect(gasRefund).toEqual(150000)
    expect(shouldRenew).toBeTruthy()
  })
  it('should return true when gas fee is covered', async () => {
    expect.assertions(2)
    const lock = {
      ...mockLock,
      gasRefundValue: async () => ethers.BigNumber.from(0),
    }
    const { shouldRenew, gasRefund } = await isWorthRenewing(
      network,
      lock,
      keyId
    )
    expect(gasRefund).toEqual(0)
    expect(shouldRenew).toBeTruthy()
  })
  it('should return false when both conditions arent unmet (gasrefund too low + higher than max covered)', async () => {
    expect.assertions(2)
    const lock = {
      ...mockLock,
      gasRefundValue: async () => ethers.BigNumber.from(0),
    }
    const { shouldRenew, gasRefund } = await isWorthRenewing(1, lock, keyId)
    expect(gasRefund).toEqual(0)
    expect(shouldRenew).toBeFalsy()
  })
})

describe('renewKey', () => {
  describe('abort on non-reccuring locks', () => {
    it('should not renew when lock version <10', async () => {
      expect.assertions(1)
      const lock = { ...mockLock, publicLockVersion: async () => 9 }
      await expect(
        renewMembershipFor(network, lock, keyId)
      ).resolves.toMatchObject({
        ...renewalInfo,
        msg: 'Renewal only supported for lock v10+',
      })
    })
    it('should not renew if lock gas refund is not set and cost are not covered', async () => {
      expect.assertions(1)
      const lock = {
        ...mockLock,
        gasRefundValue: async () => ethers.BigNumber.from(0),
      }
      await expect(renewMembershipFor(1, lock, keyId)).resolves.toMatchObject({
        ...renewalInfo,
        network: 1,
        msg: 'GasRefundValue (0) does not cover gas cost',
      })
    })
    it('should not renew if lock gas refund is not sufficient and cost are not covered', async () => {
      expect.assertions(1)
      const lock = {
        ...mockLock,
        estimateGas: {
          renewMembershipFor: async () => ethers.BigNumber.from(200000),
        },
      }
      await expect(renewMembershipFor(1, lock, keyId)).resolves.toMatchObject({
        ...renewalInfo,
        network: 1,
        msg: 'GasRefundValue (150000) does not cover gas cost',
      })
    })
  })

  describe('renewal works', () => {
    it('should renew a key properly', async () => {
      expect.assertions(3)
      await expect(
        renewMembershipFor(network, mockLock, keyId)
      ).resolves.not.toThrow()
      await expect(
        renewMembershipFor(network, mockLock, keyId)
      ).resolves.toBeInstanceOf(Object)
      await expect(
        renewMembershipFor(network, mockLock, keyId, { address: '0xSigner' })
      ).resolves.toEqual({
        ...renewalInfo,
        tx: 'txhash',
        initiatedBy: '0xSigner',
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
          lockAddress: mockLock.address,
        },
      })
      expect(dbBefore).toBe(null)
      await renewMembershipFor(network, mockLock, keyId, {
        address: '0xSigner',
      })
      const dbAfter = await KeyRenewal.findOne({
        where: {
          keyId: `${keyId}`,
          lockAddress: mockLock.address,
        },
      })
      expect(dbAfter).not.toBe(null)
      expect(dbAfter).toMatchObject({
        lockAddress: mockLock.address,
        keyId: `${keyId}`,
        tx: 'txhash',
        network,
        initiatedBy: '0xSigner',
      })
    })
  })
})
