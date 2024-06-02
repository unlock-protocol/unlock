const assert = require('assert')
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

const someTokens = ethers.parseUnits('10', 'ether')
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
        tokenAddress = isErc20 ? await testToken.getAddress() : ADDRESS_ZERO

        lock = await deployLock({ tokenAddress })

        if (isErc20) {
          await testToken.mint(await owner.getAddress(), someTokens)
          await testToken.approve(await lock.getAddress(), someTokens)
        }

        await purchaseKeys(lock, 5, isErc20)
      })

      it('should only allow the owner to withdraw', async () => {
        assert.notEqual(await owner.getAddress(), await attacker.getAddress()) // Making sure
        await reverts(
          lock
            .connect(attacker)
            .withdraw(tokenAddress, await attacker.getAddress(), 0),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('when the owner withdraws funds', () => {
        let gas
        let ownerBalance
        let contractBalance
        before(async () => {
          ownerBalance = await getBalance(
            await owner.getAddress(),
            tokenAddress
          )
          contractBalance = await getBalance(
            await lock.getAddress(),
            tokenAddress
          )
          const tx = await lock.withdraw(
            tokenAddress,
            await owner.getAddress(),
            0
          )
          const { gasPrice } = tx
          const { gasUsed } = await tx.wait()
          gas = gasPrice * gasUsed
        })

        it("should set the lock's balance to 0", async () => {
          assert.equal(
            await getBalance(await lock.getAddress(), tokenAddress),
            0
          )
        })

        it("should increase the owner's balance with the funds from the lock", async () => {
          compareBigNumbers(
            await getBalance(await owner.getAddress(), tokenAddress),
            ownerBalance + contractBalance - (isErc20 ? 0n : gas)
          )
        })

        it('should fail if there is nothing left to withdraw', async () => {
          await reverts(
            lock.withdraw(tokenAddress, await owner.getAddress(), 0),
            'NOT_ENOUGH_FUNDS'
          )
        })
      })

      describe('when the owner partially withdraws funds', () => {
        let gas
        let ownerBalance
        let contractBalance
        const amount = 42n

        before(async () => {
          await purchaseKeys(lock, 2, isErc20)

          ownerBalance = await getBalance(
            await owner.getAddress(),
            tokenAddress
          )
          contractBalance = await getBalance(
            await lock.getAddress(),
            tokenAddress
          )
          const tx = await lock.withdraw(
            tokenAddress,
            await owner.getAddress(),
            amount
          )

          // calculate gas
          const { gasPrice } = tx
          const { gasUsed } = await tx.wait()
          gas = gasPrice * gasUsed
        })

        it(`should reduce the lock's balance by ${amount}`, async () => {
          compareBigNumbers(
            await getBalance(await lock.getAddress(), tokenAddress),
            contractBalance - amount
          )
        })

        it(`should increase the owner's balance by ${amount}`, async () => {
          compareBigNumbers(
            await getBalance(await owner.getAddress(), tokenAddress),
            ownerBalance + amount - (isErc20 ? 0n : gas)
          )
        })

        describe('when there is nothing left to withdraw', () => {
          before(async () => {
            await lock.withdraw(tokenAddress, await owner.getAddress(), 0)
          })

          it('withdraw should fail', async () => {
            await reverts(
              lock.withdraw(tokenAddress, await owner.getAddress(), 42),
              'NOT_ENOUGH_FUNDS'
            )
          })
        })
      })
    })
  })
})
