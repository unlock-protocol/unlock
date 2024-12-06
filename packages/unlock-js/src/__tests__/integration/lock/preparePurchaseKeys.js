import { describe, it, expect, beforeAll } from 'vitest'
import { ethers } from 'ethers'

let web3Service, accounts, lock, lockAddress, chainId
let approvalTx, purchaseTx

export default () =>
  describe('preparePurchaseKeys', () => {
    beforeAll(async () => {
      ;({ web3Service, accounts, lock, lockAddress, chainId } =
        global.suiteData)

      const [keyOwner] = accounts
      const txs = await web3Service.purchaseKeys({
        lockAddress: lockAddress,
        network: chainId,
        params: {
          owners: [keyOwner],
          lockAddress: lock.address,
        },
      })
      if (lock.currencyContractAddress) {
        ;[approvalTx, purchaseTx] = txs
      } else {
        ;[purchaseTx] = txs
      }
    })
    it('parse correctly purchase tx', async () => {
      expect.assertions(2)
      expect(purchaseTx.to).toBe(lockAddress)
      expect(ethers.formatEther(purchaseTx.value)).toBe(
        lock.currencyContractAddress ? '0.0' : lock.keyPrice
      )
    })
    it('parse adds allowance tx if erc20', async () => {
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
