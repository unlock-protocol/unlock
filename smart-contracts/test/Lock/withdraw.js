const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const {
  getBalance,
  deployLock,
  deployERC20,
  reverts,
  purchaseKeys,
  ADDRESS_ZERO,
} = require('../helpers')

const someTokens = ethers.utils.parseUnits('10', 'ether')
const scenarios = [true]

contract('Lock / withdraw', (accounts) => {
  let lock
  let tokenAddress = ADDRESS_ZERO
  let testToken
  const owner = accounts[0]

  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        if (isErc20) {
          testToken = await deployERC20(owner)
          tokenAddress = testToken.address

          // Mint some tokens for testing
          await testToken.mint(owner, someTokens, {
            from: owner,
          })
        }
        lock = await deployLock({ tokenAddress })

        if (isErc20) {
          await testToken.approve(lock.address, someTokens, {
            from: owner,
          })
        }

        await purchaseKeys(lock, 2, isErc20)
      })

      it('should only allow the owner to withdraw', async () => {
        assert.notEqual(owner, accounts[1]) // Making sure
        await reverts(
          lock.withdraw(tokenAddress, accounts[1], 0, {
            from: accounts[1],
          }),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('when the owner withdraws funds', () => {
        let tx
        let ownerBalance
        let contractBalance
        before(async () => {
          ownerBalance = await getBalance(owner, tokenAddress)
          contractBalance = await getBalance(lock.address, tokenAddress)
          tx = await lock.withdraw(tokenAddress, owner, 0, {
            from: owner,
          })
        })

        it("should set the lock's balance to 0", async () => {
          assert.equal(await getBalance(lock.address, tokenAddress), 0)
        })

        it("should increase the owner's balance with the funds from the lock", async () => {
          const balance = await getBalance(owner, tokenAddress)

          const { gasPrice } = await ethers.provider.getTransaction(tx.tx)
          const gasUsed = new BigNumber(tx.receipt.gasUsed)
          const txFee = gasUsed.times(gasPrice.toString())
          assert.equal(
            balance.toString(),
            ownerBalance
              .plus(contractBalance.toString())
              .minus(tokenAddress === ADDRESS_ZERO ? txFee : 0)
              .toString()
          )
        })

        it('should fail if there is nothing left to withdraw', async () => {
          await reverts(
            lock.withdraw(tokenAddress, owner, 0, {
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
          await purchaseKeys(lock, 2, isErc20)

          ownerBalance = await getBalance(owner, tokenAddress)
          contractBalance = await getBalance(lock.address, tokenAddress)
          tx = await lock.withdraw(tokenAddress, owner, 42, {
            from: owner,
          })
        })

        it("should reduce the lock's balance by 42", async () => {
          assert.equal(
            (await getBalance(lock.address, tokenAddress)).toString(),
            contractBalance.minus(42).toString()
          )
        })

        it("should increase the owner's balance by 42", async () => {
          const balance = await getBalance(owner, tokenAddress)
          const { gasPrice } = await ethers.provider.getTransaction(tx.tx)
          const gasUsed = new BigNumber(tx.receipt.gasUsed)
          const txFee = gasUsed.times(gasPrice.toString())
          assert.equal(
            balance.toString(),
            ownerBalance
              .plus(42)
              .minus(tokenAddress === ADDRESS_ZERO ? txFee.toString() : 0)
              .toString()
          )
        })

        describe('when there is nothing left to withdraw', () => {
          before(async () => {
            await lock.withdraw(tokenAddress, owner, 0, {
              from: owner,
            })
          })

          it('withdraw should fail', async () => {
            await reverts(
              lock.withdraw(tokenAddress, owner, 42, {
                from: owner,
              }),
              'NOT_ENOUGH_FUNDS'
            )
          })
        })
      })
    })
  })
})
