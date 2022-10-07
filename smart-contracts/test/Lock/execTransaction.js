const {
  purchaseKey,
  reverts,
  deployERC20,
  deployLock,
  deployContracts,
} = require('../helpers')
const { ethers } = require('hardhat')

let unlock
let lock

contract('Lock / execTransaction', (accounts) => {
  const [deployer, lockOwner, keyOwner, spender, other] = accounts
  let token

  before(async () => {
    ;({ unlock } = await deployContracts())
    token = await deployERC20(deployer)

    await token.mint(keyOwner, ethers.utils.parseUnits('100', 'ether'), {
      from: deployer,
    })
    lock = await deployLock({
      unlock,
      from: lockOwner,
      tokenAddress: token.address,
    })

    await token.approve(lock.address, await lock.keyPrice(), {
      from: keyOwner,
    })

    await purchaseKey(lock, keyOwner, true)
  })

  // An ERC-20 style approval, allowing the spender to transfer funds directly from the lock.
  describe('approveBeneficiary', () => {
    let calldata
    let keyPrice
    before(async () => {
      const { interface } = await ethers.getContractFactory(
        '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20'
      )
      keyPrice = await lock.keyPrice()

      calldata = interface.encodeFunctionData('approve', [
        spender, // spender
        keyPrice.toString(), // amount
      ])

      console.log(calldata)
    })

    it('approve fails if called from the wrong account', async () => {
      await reverts(
        lock.execTransaction(token.address, calldata, 0, { from: other }),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('has allowance', async () => {
      await lock.execTransaction(token.address, calldata, 0, {
        from: lockOwner,
      })
      const actual = await token.allowance(lock.address, spender)
      assert.equal(actual.toString(), keyPrice.toString())
    })

    it('can transferFrom', async () => {
      await lock.execTransaction(token.address, calldata, 0, {
        from: lockOwner,
      })
      await token.transferFrom(lock.address, other, keyPrice, {
        from: spender,
      })
    })
  })
})
