const {
  purchaseKey,
  reverts,
  deployERC20,
  deployLock,
  deployContracts,
} = require('../helpers')
const { ethers } = require('hardhat')
const { assert } = require('chai')

let unlock
let lock

describe('Lock / approveBeneficiary', () => {
  let daiOwner, beneficiary, keyOwner, spender, other

  before(async () => {
    ;[daiOwner, beneficiary, keyOwner, spender, other] =
      await ethers.getSigners()
    ;({ unlock } = await deployContracts())
  })

  describe('ETH', () => {
    before(async () => {
      lock = await deployLock({ unlock, from: beneficiary })
    })

    it('fails to approve if the lock is priced in ETH', async () => {
      await reverts(
        lock.connect(beneficiary).approveBeneficiary(daiOwner.address, 1)
      )
    })
  })

  describe('ERC20', () => {
    let token

    before(async () => {
      token = await deployERC20(daiOwner)
      await token.mint(
        keyOwner.address,
        ethers.utils.parseUnits('100', 'ether')
      )
      lock = await deployLock({
        unlock,
        from: beneficiary,
        tokenAddress: token.address,
      })

      await token.connect(keyOwner).approve(lock.address, await lock.keyPrice())

      await purchaseKey(lock, keyOwner, true)
      await lock.connect(beneficiary).approveBeneficiary(spender.address, 1)
    })

    it('approve fails if called from the wrong account', async () => {
      await reverts(
        lock.connect(other).approveBeneficiary(beneficiary.address, 1),
        'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
      )
    })

    it('has allowance', async () => {
      const actual = await token.allowance(lock.address, spender.address)
      assert.equal(actual.toString(), 1)
    })

    it('can transferFrom', async () => {
      await token.connect(spender).transferFrom(lock.address, other.address, 1)
    })
  })
})
