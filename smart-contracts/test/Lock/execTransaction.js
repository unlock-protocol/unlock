const {
  purchaseKey,
  reverts,
  deployERC20,
  deployLock,
  deployContracts,
  getBalance,
} = require('../helpers')
const { ethers } = require('hardhat')
const { assert } = require('chai')

let unlock
let lock

contract('Lock / execTransaction', (accounts) => {
  const [deployer, lockOwner, keyOwner, spender, other, receiver] = accounts
  let token
  let interface
  let keyPrice

  before(async () => {
    ;({ unlock } = await deployContracts())
    ;({ interface } = await ethers.getContractFactory(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20'
    ))

    token = await deployERC20(deployer)

    await token.mint(keyOwner, ethers.utils.parseUnits('100', 'ether'), {
      from: deployer,
    })

    lock = await deployLock({
      unlock,
      from: lockOwner,
      tokenAddress: token.address,
    })

    keyPrice = await lock.keyPrice()

    await token.approve(lock.address, keyPrice, {
      from: keyOwner,
    })

    await purchaseKey(lock, keyOwner, true)
  })

  describe('ERC20 approval/allowance', () => {
    let calldata

    before(async () => {
      calldata = interface.encodeFunctionData('approve', [
        spender, // spender
        keyPrice.toString(), // amount
      ])
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

  describe('ERC20 transfer of funds', () => {
    it('can spend ERC20', async () => {
      // buy a key to increase lock balance
      await token.approve(lock.address, keyPrice, {
        from: other,
      })
      await purchaseKey(lock, other, true)

      const calldata = interface.encodeFunctionData('transfer', [
        receiver,
        keyPrice.toString(),
      ])

      assert.equal((await getBalance(receiver, token.address)).toString(), '0')
      await lock.execTransaction(token.address, calldata, 0, {
        from: lockOwner,
      })
      assert.equal(
        (await getBalance(receiver, token.address)).toString(),
        keyPrice.toString()
      )
    })
  })
})
