const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { getBalance } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')

let unlock
let lock
let tokenAddress
const price = ethers.utils.parseUnits('0.01', 'ether')

contract('Lock / withdraw', (accounts) => {
  let owner = accounts[0]

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, owner)
    lock = locks.OWNED
    await lock.setMaxKeysPerAddress(10)
    tokenAddress = await lock.tokenAddress()

    await purchaseKeys(accounts)
  })

  it('should only allow the owner to withdraw', async () => {
    assert.notEqual(owner, accounts[1]) // Making sure
    await reverts(
      lock.withdraw(tokenAddress, 0, {
        from: accounts[1],
      }),
      'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
    )
  })

  describe('when the owner withdraws funds', () => {
    let tx
    let ownerBalance
    let contractBalance
    before(async () => {
      ownerBalance = await getBalance(owner)
      contractBalance = await getBalance(lock.address)
      tx = await lock.withdraw(tokenAddress, 0, {
        from: owner,
      })
    })

    it("should set the lock's balance to 0", async () => {
      assert.equal(await getBalance(lock.address), 0)
    })

    it("should increase the owner's balance with the funds from the lock", async () => {
      const balance = await getBalance(owner)
      const { gasPrice } = await ethers.provider.getTransaction(tx.tx)
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      const txFee = gasUsed.times(gasPrice.toString())
      assert.equal(
        balance.toString(),
        ownerBalance.plus(contractBalance.toString()).minus(txFee).toString()
      )
    })

    it('should fail if there is nothing left to withdraw', async () => {
      await reverts(
        lock.withdraw(tokenAddress, 0, {
          from: owner,
        }),
        'NOT_ENOUGH_FUNDS'
      )
    })
  })

  describe('when the owner partially withdraws funds', () => {
    let tx
    let ownerBalance
    let contractBalance

    before(async () => {
      await purchaseKeys(accounts)

      ownerBalance = await getBalance(owner)
      contractBalance = await getBalance(lock.address)
      tx = await lock.withdraw(tokenAddress, 42, {
        from: owner,
      })
    })

    it("should reduce the lock's balance by 42", async () => {
      assert.equal(
        (await getBalance(lock.address)).toString(),
        contractBalance.minus(42).toString()
      )
    })

    it("should increase the owner's balance by 42", async () => {
      const balance = await getBalance(owner)
      const { gasPrice } = await ethers.provider.getTransaction(tx.tx)
      const gasUsed = new BigNumber(tx.receipt.gasUsed)
      const txFee = gasUsed.times(gasPrice.toString())
      assert.equal(
        balance.toString(),
        ownerBalance.plus(42).minus(txFee.toString()).toString()
      )
    })

    describe('when there is nothing left to withdraw', () => {
      before(async () => {
        await lock.withdraw(tokenAddress, 0, {
          from: owner,
        })
      })

      it('withdraw should fail', async () => {
        await reverts(
          lock.withdraw(tokenAddress, 42, {
            from: owner,
          }),
          'NOT_ENOUGH_FUNDS'
        )
      })
    })
  })

  describe('when beneficiary != owner', () => {
    let beneficiary = accounts[2]

    before(async () => {
      await purchaseKeys(accounts)

      await lock.updateBeneficiary(beneficiary, { from: owner })
    })

    it('can withdraw from beneficiary account', async () => {
      await lock.withdraw(tokenAddress, 42, {
        from: beneficiary,
      })
    })

    it('can withdraw from owner account', async () => {
      await lock.withdraw(tokenAddress, 42, {
        from: owner,
      })
    })

    it('should fail to withdraw as non-owner or beneficiary', async () => {
      await reverts(
        lock.withdraw(tokenAddress, 42, {
          from: accounts[4],
        }),
        'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
      )
    })
  })
})

async function purchaseKeys(accounts) {
  await lock.purchase(
    [],
    [accounts[1], accounts[2]],
    [1, 2].map(() => ADDRESS_ZERO),
    [1, 2].map(() => ADDRESS_ZERO),
    [1, 2].map(() => []),
    {
      value: price * 2,
      from: accounts[1],
    }
  )
}
