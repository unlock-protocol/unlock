import { ethers } from 'hardhat'
import {
  versionEqualOrBelow,
  versionEqualOrAbove,
} from '../../helpers/integration'

let walletService, web3Service, lockAddress, lock, chainId

export default ({ publicLockVersion }) =>
  () => {
    let lockBalanceBefore
    let userBalanceBefore
    let withdrawnAmount
    let transactionHash
    let beneficiary
    let keyOwners

    const getBalance = async (address, chainId, tokenAddress) =>
      tokenAddress === null
        ? await web3Service.getAddressBalance(address, chainId)
        : await web3Service.getTokenBalance(
            lock.currencyContractAddress,
            address,
            chainId
          )

    // TODO: support partial withdraws
    // TODO: get the beneficiary address from the lock
    beforeAll(async () => {
      ;({ walletService, web3Service, lockAddress, lock, chainId } =
        global.suiteData)

      const [deployer, ...signers] = await ethers.getSigners()
      keyOwners = signers.slice(2, 7).map(({ address }) => address)

      // buy some keys
      await walletService.purchaseKeys({
        lockAddress,
        owners: keyOwners, // 5 keys
      })

      if (versionEqualOrBelow(publicLockVersion, 'v11')) {
        const lockContract = await walletService.getLockContract(lockAddress)
        beneficiary = await lockContract.beneficiary()
      } else {
        // first signer is default lock deployer/owner in tests
        beneficiary = deployer.address
      }

      // Get the balance of the lock before the withdrawal
      lockBalanceBefore = await getBalance(
        lockAddress,
        chainId,
        lock.currencyContractAddress
      )
      // Get the ether balance of the beneficiary before the withdrawal
      userBalanceBefore = await getBalance(
        beneficiary,
        chainId,
        lock.currencyContractAddress
      )

      withdrawnAmount = await walletService.withdrawFromLock(
        {
          lockAddress,
          beneficiary,
        },
        {} /** transactionOptions */,

        (error, hash) => {
          if (error) {
            throw error
          }
          transactionHash = hash
        }
      )
    })

    it('should have yielded a transaction hash', () => {
      expect.assertions(1)
      expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })

    it('should have withdrawn an non null amount', () => {
      expect.assertions(1)
      expect(withdrawnAmount).toEqual(lockBalanceBefore)
    })

    it('should decrease the balance by the withdrawn amount', async () => {
      expect.assertions(1)
      // Get the ether balance of the lock before the withdrawal
      const lockBalanceAfter = await getBalance(
        lockAddress,
        chainId,
        lock.currencyContractAddress
      )

      expect(parseFloat(lockBalanceAfter)).toEqual(
        parseFloat(lockBalanceBefore) - parseFloat(withdrawnAmount)
      )
    })

    it('should increase the balance of the beneficiary', async () => {
      expect.assertions(1)

      // Get the ether balance of the beneficiary before the withdrawal
      const beneficiaryBalanceAfter = await getBalance(
        beneficiary,
        chainId,
        lock.currencyContractAddress
      )

      if (lock.currencyContractAddress === null) {
        // We should take gas paid into account... so the amount is larger than before
        // but smaller than the sum of the previous balance and the amount in the lock
        expect(parseFloat(beneficiaryBalanceAfter)).toBeGreaterThan(
          parseFloat(userBalanceBefore)
        )
      } else {
        expect(parseFloat(beneficiaryBalanceAfter)).toEqual(
          parseFloat(userBalanceBefore) + parseFloat(withdrawnAmount)
        )
      }
    })

    if (versionEqualOrAbove(publicLockVersion, 'v12')) {
      it('accept a custom beneficiary as parameter', async () => {
        expect.assertions(1)
        // buy some keys
        await walletService.purchaseKeys({
          lockAddress,
          owners: keyOwners,
        })
        const newBeneficary = keyOwners[0]
        const before = await getBalance(
          newBeneficary,
          chainId,
          lock.currencyContractAddress
        )
        const amount = await walletService.withdrawFromLock({
          lockAddress,
          beneficiary: newBeneficary,
        })
        const after = await getBalance(
          newBeneficary,
          chainId,
          lock.currencyContractAddress
        )
        console.log({
          before,
          amount,
          after,
        })
        expect(parseFloat(after)).toBeGreaterThanOrEqual(parseFloat(amount))
      })
    }
  }
