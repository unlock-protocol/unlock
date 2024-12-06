import { describe, it, expect, beforeAll } from 'vitest'
import { ethers } from 'ethers'
let web3Service, accounts, lock, lockAddress, chainId
let txs

export default () =>
  describe('preparePurchaseKeys', () => {
    beforeAll(async () => {
      ;({ web3Service, accounts, lock, lockAddress, chainId } =
        global.suiteData)

      const [keyOwner] = accounts
      txs = await web3Service.purchaseKeys({
        lockAddress: lockAddress,
        network: chainId,
        params: {
          owners: [keyOwner],
          lockAddress: lock.address,
        },
      })
    })

    it('has correct number of txs', async () => {
      expect.assertions(1)
      expect(txs.length).toBe(lock.currencyContractAddress ? 2 : 1)
    })

    it('parse correctly purchase tx', async () => {
      expect.assertions(2)
      let purchaseTx
      if (lock.currencyContractAddress) {
        ;[, purchaseTx] = txs
      } else {
        ;[purchaseTx] = txs
      }
      expect(purchaseTx.to).toBe(lockAddress)
      expect(ethers.formatEther(purchaseTx.value)).toBe(
        lock.currencyContractAddress ? '0.0' : lock.keyPrice
      )
    })
    it('parse adds allowance tx if erc20', async () => {
      let approvalTx
      if (lock.currencyContractAddress) {
        ;[approvalTx] = txs
      }
      // check that approval tx has been added
      if (!lock.currencyContractAddress) {
        expect.assertions(2)
        expect(txs.length).toBe(1)
        expect(approvalTx).toBeUndefined()
      } else {
        expect.assertions(3)
        expect(txs.length).toBe(2)
        expect(approvalTx.to).toBe(lock.currencyContractAddress)
        expect(approvalTx.value).toBe(0)
      }
    })
  })
