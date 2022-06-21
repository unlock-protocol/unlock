const { purchaseKey, reverts, deployERC20, deployLock } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock

contract('Lock / approveBeneficiary', (accounts) => {
  const [daiOwner, beneficiary, keyOwner, spender, other] = accounts
  let lock
  before(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  describe('ETH', () => {
    before(async () => {
      lock = await deployLock({ unlock, from: beneficiary })
    })

    it('fails to approve if the lock is priced in ETH', async () => {
      await reverts(
        lock.approveBeneficiary(accounts[0], 1, { from: beneficiary })
      )
    })
  })

  describe('ERC20', () => {
    let token

    before(async () => {
      token = await deployERC20(daiOwner)
      await token.mint(keyOwner, web3.utils.toWei('100', 'ether'), {
        from: daiOwner,
      })
      lock = await deployLock({
        unlock,
        from: beneficiary,
        tokenAddress: token.address,
      })

      await token.approve(lock.address, await lock.keyPrice(), {
        from: keyOwner,
      })

      await purchaseKey(lock, keyOwner, true)
      await lock.approveBeneficiary(spender, 1, { from: beneficiary })
    })

    it('approve fails if called from the wrong account', async () => {
      await reverts(
        lock.approveBeneficiary(accounts[0], 1, { from: other }),
        'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
      )
    })

    it('has allowance', async () => {
      const actual = await token.allowance(lock.address, spender)
      assert.equal(actual.toString(), 1)
    })

    it('can transferFrom', async () => {
      await token.transferFrom(lock.address, other, 1, {
        from: spender,
      })
    })
  })
})
