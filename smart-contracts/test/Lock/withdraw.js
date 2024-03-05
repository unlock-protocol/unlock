const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  getBalance,
  deployLock,
  deployERC20,
  reverts,
  purchaseKeys,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')

const someTokens = ethers.utils.parseUnits('10', 'ether')
const scenarios = [true, false]

describe('Lock / withdraw', () => {
  let lock
  let tokenAddress
  let testToken
  let owner, attacker

  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[owner, attacker] = await ethers.getSigners()

        testToken = await deployERC20(owner.addres)
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO

        lock = await deployLock({ tokenAddress })

        if (isErc20) {
          await testToken.mint(owner.address, someTokens)
          await testToken.approve(lock.address, someTokens)
        }

        await purchaseKeys(lock, 5, isErc20)
      })

      it('should only allow the owner to withdraw', async () => {
        assert.notEqual(owner.address, attacker.address) // Making sure
        await reverts(
          lock.connect(attacker).withdraw(tokenAddress, attacker.address, 0),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('when the owner withdraws funds', () => {
        let gas
        let ownerBalance
        let contractBalance
        before(async () => {
          ownerBalance = await getBalance(owner.address, tokenAddress)
          contractBalance = await getBalance(lock.address, tokenAddress)
          const tx = await lock.withdraw(tokenAddress, owner.address, 0)
          const { gasPrice } = tx
          const { gasUsed } = await tx.wait()
          gas = gasPrice.mul(gasUsed)
        })

        it("should set the lock's balance to 0", async () => {
          assert.equal(await getBalance(lock.address, tokenAddress), 0)
        })

        it("should increase the owner's balance with the funds from the lock", async () => {
          compareBigNumbers(
            await getBalance(owner.address, tokenAddress),
            ownerBalance.add(contractBalance).sub(isErc20 ? 0 : gas)
          )
        })

        it('should fail if there is nothing left to withdraw', async () => {
          await reverts(
            lock.withdraw(tokenAddress, owner.address, 0),
            'NOT_ENOUGH_FUNDS'
          )
        })
      })

      describe('when the owner partially withdraws funds', () => {
        let gas
        let ownerBalance
        let contractBalance
        const amount = 42

        before(async () => {
          await purchaseKeys(lock, 2, isErc20)

          ownerBalance = await getBalance(owner.address, tokenAddress)
          contractBalance = await getBalance(lock.address, tokenAddress)
          const tx = await lock.withdraw(tokenAddress, owner.address, amount)

          // calculate gas
          const { gasPrice } = tx
          const { gasUsed } = await tx.wait()
          gas = gasPrice.mul(gasUsed)
        })

        it(`should reduce the lock's balance by ${amount}`, async () => {
          compareBigNumbers(
            await getBalance(lock.address, tokenAddress),
            contractBalance.sub(amount)
          )
        })

        it(`should increase the owner's balance by ${amount}`, async () => {
          compareBigNumbers(
            await getBalance(owner.address, tokenAddress),
            ownerBalance.add(amount).sub(isErc20 ? 0 : gas)
          )
        })

        describe('when there is nothing left to withdraw', () => {
          before(async () => {
            await lock.withdraw(tokenAddress, owner.address, 0)
          })

          it('withdraw should fail', async () => {
            await reverts(
              lock.withdraw(tokenAddress, owner.address, 42),
              'NOT_ENOUGH_FUNDS'
            )
          })
        })
      })
    })
  })
})
