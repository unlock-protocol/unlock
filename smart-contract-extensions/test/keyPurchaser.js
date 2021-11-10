const { constants, protocols, tokens } = require('hardlydifficult-eth')

const KeyPurchaser = artifacts.require('KeyPurchaser.sol')
const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')

contract('keyPurchaser', accounts => {
  const [endUser, lockCreator, tokenMinter, otherAccount] = accounts
  let dai
  let lock
  let keyPurchaser
  // Since dai also uses 18 decimals, this represents 1 DAI
  const keyPrice = web3.utils.toWei('1', 'ether')

  beforeEach(async () => {
    dai = await tokens.dai.deploy(web3, tokenMinter)
    await dai.mint(endUser, web3.utils.toWei('100', 'ether'), {
      from: tokenMinter,
    })

    // Create a Lock priced in DAI
    lock = await protocols.unlock.createTestLock(web3, {
      tokenAddress: dai.address,
      keyPrice,
      expirationDuration: 30, // 30 seconds
      from: lockCreator,
    })

    // Note that approving spending before the keyPurchaser is initialized
    // would allow anyone to steal the user's funds
    // Normally by deploying via the KeyPurchaserFactory this window will not exist
    keyPurchaser = await KeyPurchaser.new()
  })

  describe('Single purchase / exact price', () => {
    beforeEach(async () => {
      await keyPurchaser.initialize(lock.address, keyPrice, 35, 0, 0, {
        from: lockCreator,
      })
    })

    it('purchase fails without approval', async () => {
      await reverts(
        keyPurchaser.readyToPurchaseFor(endUser, constants.ZERO_ADDRESS, []),
        'INSUFFICIENT_ALLOWANCE'
      )
      await reverts(
        keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        })
      )
    })

    it('purchase fails without balance', async () => {
      await reverts(
        keyPurchaser.readyToPurchaseFor(
          accounts[3],
          constants.ZERO_ADDRESS,
          []
        ),
        'INSUFFICIENT_BALANCE'
      )
      await reverts(
        keyPurchaser.purchaseFor(accounts[3], constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        })
      )
    })

    describe('after approval', () => {
      let endUserBalanceBefore

      beforeEach(async () => {
        endUserBalanceBefore = await dai.balanceOf(endUser)
        assert.equal(await lock.getHasValidKey(endUser), false) // sanity check

        await dai.approve(keyPurchaser.address, await lock.keyPrice(), {
          from: endUser,
        })
      })

      it('purchase fails if the lock price increased', async () => {
        await lock.updateKeyPricing(
          new BigNumber(keyPrice).plus(1).toFixed(),
          dai.address,
          { from: lockCreator }
        )
        await reverts(
          keyPurchaser.readyToPurchaseFor(endUser, constants.ZERO_ADDRESS, []),
          'PRICE_TOO_HIGH'
        )
        await reverts(
          keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
            from: otherAccount,
          }),
          'PRICE_TOO_HIGH'
        )
      })

      describe('anyone can purchase for the endUser', () => {
        beforeEach(async () => {
          await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
            from: otherAccount,
          })
        })

        it('purchase successful', async () => {
          assert.equal(await lock.getHasValidKey(endUser), true)
        })

        describe('even if the key is transferred or otherwise revoked for the endUser', () => {
          beforeEach(async () => {
            await lock.expireAndRefundFor(endUser, 0, { from: lockCreator })
          })

          it('purchase is single use only', async () => {
            assert.equal(await lock.getHasValidKey(endUser), false) // sanity check
            await reverts(
              keyPurchaser.readyToPurchaseFor(
                endUser,
                constants.ZERO_ADDRESS,
                []
              ),
              'INSUFFICIENT_ALLOWANCE'
            )
            await reverts(
              keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
                from: otherAccount,
              })
            )
          })
        })

        it('endUser paid exactly keyPrice', async () => {
          const amountPaid = new BigNumber(endUserBalanceBefore).minus(
            await dai.balanceOf(endUser)
          )
          assert.equal(amountPaid, keyPrice)
        })
      })

      describe('if the price goes down', () => {
        const newKeyPrice = new BigNumber(keyPrice).minus(1).toFixed()

        beforeEach(async () => {
          await lock.updateKeyPricing(newKeyPrice, dai.address, {
            from: lockCreator,
          })
          await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
            from: otherAccount,
          })
        })

        it('endUser paid exactly keyPrice (vs the original price or maxPrice)', async () => {
          const amountPaid = new BigNumber(endUserBalanceBefore)
            .minus(await dai.balanceOf(endUser))
            .toFixed()
          assert.equal(amountPaid, newKeyPrice)
        })
      })

      it('metadata cannot be set by anyone', async () => {
        await reverts(
          keyPurchaser.config('Test', false, { from: otherAccount }),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('metadata', () => {
        const name = 'Monthly Sub'

        beforeEach(async () => {
          await keyPurchaser.config(name, false, { from: lockCreator })
        })

        it('Can read metadata on-chain', async () => {
          const _name = await keyPurchaser.name()
          assert.equal(name, _name)
        })

        it('Can change name anytime', async () => {
          await keyPurchaser.config('new name', false, { from: lockCreator })
        })

        it('shouldBeDisplayed == true', async () => {
          const shouldBeDisplayed = await keyPurchaser.shouldBeDisplayed()
          assert.equal(shouldBeDisplayed, true)
        })

        describe('if disabled', () => {
          beforeEach(async () => {
            await keyPurchaser.config(name, true, { from: lockCreator })
          })

          it('shouldBeDisplayed == false', async () => {
            const shouldBeDisplayed = await keyPurchaser.shouldBeDisplayed()
            assert.equal(shouldBeDisplayed, false)
          })

          it('Purchases still work fine!', async () => {
            await keyPurchaser.purchaseFor(
              endUser,
              constants.ZERO_ADDRESS,
              [],
              {
                from: otherAccount,
              }
            )
          })
        })
      })

      describe('stoppable', () => {
        describe('if stopped', () => {
          beforeEach(async () => {
            await keyPurchaser.stop({ from: lockCreator })
          })

          it('shouldBeDisplayed == false', async () => {
            const shouldBeDisplayed = await keyPurchaser.shouldBeDisplayed()
            assert.equal(shouldBeDisplayed, false)
          })

          it('Purchases fails', async () => {
            await reverts(
              keyPurchaser.readyToPurchaseFor(
                endUser,
                constants.ZERO_ADDRESS,
                []
              ),
              'stopped'
            )
            await reverts(
              keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
                from: otherAccount,
              }),
              'stopped'
            )
          })
        })
      })
    })
  })

  describe('Subscription capped by renewWindow', () => {
    beforeEach(async () => {
      await keyPurchaser.initialize(lock.address, keyPrice, 15, 1, 0, {
        from: lockCreator,
      })

      // Make first purchase
      await dai.approve(keyPurchaser.address, constants.MAX_UINT, { from: endUser })
      await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
        from: otherAccount,
      })

      // Ensure at least 1 second has passed to avoid the min frequency check
      await time.increase(1)
    })

    it('cannot purchase again right away', async () => {
      await reverts(
        keyPurchaser.readyToPurchaseFor(endUser, constants.ZERO_ADDRESS, []),
        'OUTSIDE_RENEW_WINDOW'
      )
      await reverts(
        keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        }),
        'OUTSIDE_RENEW_WINDOW'
      )
    })

    describe('after enough time has passed', () => {
      beforeEach(async () => {
        await time.increase(15)
      })

      it('Can now purchase again', async () => {
        await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        })
      })
    })
  })

  describe('Subscription capped by renewMinFrequency', () => {
    beforeEach(async () => {
      await keyPurchaser.initialize(lock.address, keyPrice, 1, 15, 0, {
        from: lockCreator,
      })

      // Make first purchase
      await dai.approve(keyPurchaser.address, constants.MAX_UINT, { from: endUser })
      await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
        from: otherAccount,
      })

      // Now expire it to skip the renewWindow check
      await lock.expireAndRefundFor(endUser, 0, { from: lockCreator })
    })

    it('cannot purchase again right away', async () => {
      await reverts(
        keyPurchaser.readyToPurchaseFor(endUser, constants.ZERO_ADDRESS, []),
        'BEFORE_MIN_FREQUENCY'
      )
      await reverts(
        keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        }),
        'BEFORE_MIN_FREQUENCY'
      )
    })

    describe('after enough time has past', () => {
      beforeEach(async () => {
        await time.increase(15)
      })

      it('Can now purchase again', async () => {
        await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        })
      })
    })
  })

  describe('free purchase', () => {
    let freeLock

    beforeEach(async () => {
      freeLock = await protocols.unlock.createTestLock(web3, {
        keyPrice: 0,
        expirationDuration: 30, // 30 seconds
        from: lockCreator,
        tokenAddress: dai.address,
      })
      await keyPurchaser.initialize(freeLock.address, 0, 35, 0, 0, {
        from: lockCreator,
      })
    })

    it('purchase fails if the lock price increased', async () => {
      await freeLock.updateKeyPricing('1', dai.address, { from: lockCreator })
      await keyPurchaser.approveSpending()
      await reverts(
        keyPurchaser.readyToPurchaseFor(endUser, constants.ZERO_ADDRESS, []),
        'PRICE_TOO_HIGH'
      )
      await reverts(
        keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        }),
        'PRICE_TOO_HIGH'
      )
    })

    describe('anyone can purchase for the endUser', () => {
      beforeEach(async () => {
        await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
          from: otherAccount,
        })
      })

      it('purchase successful', async () => {
        assert.equal(await freeLock.getHasValidKey(endUser), true)
      })
    })
  })

  describe('msgSenderReward', () => {
    const msgSenderReward = web3.utils.toWei('0.01', 'ether')
    let endUserBalanceBefore
    let otherAccountBalanceBefore

    beforeEach(async () => {
      await keyPurchaser.initialize(
        lock.address,
        keyPrice,
        35,
        0,
        msgSenderReward,
        {
          from: lockCreator,
        }
      )

      await dai.approve(keyPurchaser.address, constants.MAX_UINT, {
        from: endUser,
      })

      endUserBalanceBefore = new BigNumber(await dai.balanceOf(endUser))
      otherAccountBalanceBefore = new BigNumber(
        await dai.balanceOf(otherAccount)
      )

      await keyPurchaser.purchaseFor(endUser, constants.ZERO_ADDRESS, [], {
        from: otherAccount,
      })
    })

    it('endUser was charged keyPrice + msgSenderReward', async () => {
      const balance = new BigNumber(await dai.balanceOf(endUser))
      assert.equal(
        balance.toFixed(),
        endUserBalanceBefore
          .minus(keyPrice)
          .minus(msgSenderReward)
          .toFixed()
      )
    })

    it('other account was rewarded with msgSenderReward', async () => {
      const balance = new BigNumber(await dai.balanceOf(otherAccount))
      assert.equal(
        balance.toFixed(),
        otherAccountBalanceBefore.plus(msgSenderReward).toFixed()
      )
    })
  })
})
