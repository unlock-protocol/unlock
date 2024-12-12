import { describe, it, expect, beforeAll } from 'vitest'
import { ethers } from 'ethers'
import { versionEqualOrAbove } from '../../../helpers/integration'

let web3Service, accounts, lock, lockAddress, chainId
let txs

export default ({ publicLockVersion }) =>
  describe('preparePurchaseKeys', () => {
    let keyPrice
    beforeAll(async () => {
      ;({ web3Service, accounts, lock, lockAddress, chainId } =
        global.suiteData)
      ;({ keyPrice } = await web3Service.getLock(lockAddress, chainId))

      const [keyOwner] = accounts
      txs = await web3Service.purchaseKeys({
        lockAddress: lockAddress,
        network: chainId,
        params: {
          owners: [keyOwner, keyOwner],
          lockAddress: lock.address,
        },
      })
    })

    it('has correct number of txs', async () => {
      expect.assertions(1)
      console.log(publicLockVersion)
      if (versionEqualOrAbove(publicLockVersion, 'v10')) {
        expect(txs.length).toBe(lock.currencyContractAddress ? 2 : 1)
      } else {
        expect(txs.length).toBe(lock.currencyContractAddress ? 3 : 2)
      }
    })

    it('parse correctly purchase tx', async () => {
      if (versionEqualOrAbove(publicLockVersion, 'v10')) {
        expect.assertions(2)
        let purchaseTx
        if (lock.currencyContractAddress) {
          ;[, purchaseTx] = txs
        } else {
          ;[purchaseTx] = txs
        }
        expect(purchaseTx.to).toBe(lockAddress)
        expect(ethers.formatEther(purchaseTx.value)).toBe(
          lock.currencyContractAddress
            ? '0.0'
            : ethers.formatEther(ethers.parseEther(keyPrice) * BigInt(2))
        )
      } else {
        expect.assertions(4)
        let purchaseTx, purchaseTx2
        if (lock.currencyContractAddress) {
          ;[, purchaseTx, purchaseTx2] = txs
        } else {
          ;[purchaseTx, purchaseTx2] = txs
        }
        expect(purchaseTx.to).toBe(lockAddress)
        expect(purchaseTx2.to).toBe(lockAddress)
        expect(ethers.formatEther(purchaseTx.value)).toBe(
          lock.currencyContractAddress ? '0.0' : keyPrice
        )
        expect(ethers.formatEther(purchaseTx2.value)).toBe(
          lock.currencyContractAddress ? '0.0' : keyPrice
        )
      }
    })
    it('parse adds allowance tx if erc20', async () => {
      let approvalTx
      if (lock.currencyContractAddress) {
        ;[approvalTx] = txs
      }

      // check that approval tx has been added
      if (!lock.currencyContractAddress) {
        expect.assertions(1)
        expect(approvalTx).toBeUndefined()
      } else {
        expect.assertions(2)
        expect(approvalTx.to).toBe(lock.currencyContractAddress)
        expect(approvalTx.value).toBe(0)
      }
    })
  })
