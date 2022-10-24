import { versionEqualOrBelow } from '../../helpers/integration'

let walletService, web3Service, lockAddress, lock, chainId

export default () => () => {
  let lockBalanceBefore
  let userBalanceBefore
  let withdrawnAmount
  let transactionHash
  let beneficiary
  let publicLockVersion

  // TODO: support partial withdraws
  // TODO: get the beneficiary address from the lock
  beforeAll(async () => {
    ;({
      walletService,
      web3Service,
      lockAddress,
      lock,
      chainId,
      publicLockVersion,
    } = global.suiteData)

    beneficiary = versionEqualOrBelow(publicLockVersion, 'v11')
      ? lock.beneficiary
      : await walletService.signer.getAddress()

    if (lock.currencyContractAddress === null) {
      // Get the ether balance of the lock before the withdrawal
      lockBalanceBefore = await web3Service.getAddressBalance(
        lockAddress,
        chainId
      )
      // Get the ether balance of the beneficiary before the withdrawal
      userBalanceBefore = await web3Service.getAddressBalance(
        beneficiary,
        chainId
      )
    } else {
      // Get the erc20 balance of the lock before the purchase
      lockBalanceBefore = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        lockAddress,
        chainId
      )
      // Get the erc20 balance of the user before the purchase
      userBalanceBefore = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        beneficiary,
        chainId
      )
    }

    withdrawnAmount = await walletService.withdrawFromLock(
      {
        lockAddress,
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
    let lockBalanceAfter
    if (lock.currencyContractAddress === null) {
      // Get the ether balance of the lock before the withdrawal
      lockBalanceAfter = await web3Service.getAddressBalance(
        lockAddress,
        chainId
      )
    } else {
      // Get the erc20 balance of the lock before the purchase
      lockBalanceAfter = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        lockAddress,
        chainId
      )
    }
    expect(parseFloat(lockBalanceAfter)).toEqual(
      parseFloat(lockBalanceBefore) - parseFloat(withdrawnAmount)
    )
  })

  it('should increase the balance of the beneficiary', async () => {
    expect.assertions(1)
    let beneficiaryBalanceAfter
    if (lock.currencyContractAddress === null) {
      // Get the ether balance of the beneficiary before the withdrawal
      beneficiaryBalanceAfter = await web3Service.getAddressBalance(
        beneficiary,
        chainId
      )
      // We should take gas paid into account... so the amount is larger than before
      // but smaller than the sum of the previous balance and the amount in the lock
      expect(parseFloat(beneficiaryBalanceAfter)).toBeGreaterThan(
        parseFloat(userBalanceBefore)
      )
    } else {
      // Get the erc20 balance of the user before the purchase
      beneficiaryBalanceAfter = await web3Service.getTokenBalance(
        lock.currencyContractAddress,
        beneficiary,
        chainId
      )
      expect(parseFloat(beneficiaryBalanceAfter)).toEqual(
        parseFloat(userBalanceBefore) + parseFloat(withdrawnAmount)
      )
    }
  })
}
