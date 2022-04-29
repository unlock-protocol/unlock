// see hardhat script https://github.com/unlock-protocol/unlock/blob/8e3b93f0c3b0c1ff0d8d883e2dbe8b01ca029e06/smart-contracts/scripts/renew.js
import { ethers } from 'ethers'
import { Op } from 'sequelize'
import { renewMembershipFor } from '../../src/websub/helpers/renewKey'
import { KeyRenewal } from '../../src/models'

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

describe('renewKey', () => {
  describe('abort on non-reccuring locks', () => {
    it('should throw when lock version <10', async () => {
      expect.assertions(1)
      const lock = { ...mockLock, publicLockVersion: async () => 9 }
      await expect(renewMembershipFor(network, lock, keyId)).rejects.toContain(
        'v10+'
      )
    })
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should throw when ERC20 allowance is too low', async () => {
      expect.assertions(0)
    })
    it('should throw if lock gas refund is not set', async () => {
      expect.assertions(1)
      const lock = {
        ...mockLock,
        gasRefundValue: async () => ethers.BigNumber.from(0),
      }
      await expect(renewMembershipFor(network, lock, keyId)).rejects.toContain(
        'GasRefundValue (0) does not cover gas cost'
      )
    })
    it('should throw if lock gas refund is not sufficient', async () => {
      expect.assertions(1)
      const lock = {
        ...mockLock,
        estimateGas: {
          renewMembershipFor: async () => ethers.BigNumber.from(200000),
        },
      }
      await expect(renewMembershipFor(network, lock, keyId)).rejects.toContain(
        'GasRefundValue (150000) does not cover gas cost'
      )
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
        lockAddress: mockLock.address,
        keyId,
        tx: 'txhash',
        network,
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
          [Op.and]: {
            keyId: `${keyId}`,
            lockAddress: mockLock.address,
          },
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
