const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  deployERC20,
  compareBigNumbers,
  increaseTimeTo,
} = require('../helpers')

const { ADDRESS_ZERO, getBalance } = require('@unlock-protocol/hardhat-helpers')

const BASIS_POINT_DENOMINATOR = 10000
const someDai = ethers.utils.parseUnits('10', 'ether')

const scenarios = [false, true]

describe('Lock / setReferrerFee', () => {
  let lock
  let deployer, keyOwner, referrer, renewer
  let dai
  let tokenAddress
  let keyPrice

  const setReferrerFeeAndPurchase = async ({
    isErc20,
    lock,
    referrerAddress,
    referrerFee,
    keyOwner,
  }) => {
    const tx = await lock.setReferrerFee(referrerAddress, referrerFee)
    const { events } = await tx.wait()
    const { args: eventArgs } = events.find(
      ({ event }) => event === 'ReferrerFee'
    )

    const balanceBefore = await getBalance(referrerAddress, tokenAddress)

    await lock
      .connect(keyOwner)
      .purchase(
        isErc20 ? [keyPrice] : [],
        [keyOwner.address],
        [referrerAddress],
        [ADDRESS_ZERO],
        [[]],
        {
          value: isErc20 ? 0 : keyPrice,
        }
      )
    return {
      balanceBefore,
      eventArgs,
    }
  }

  const storeFeeCorrectly = async (lock, referrerAddress, referrerFee) => {
    const fee = await lock.referrerFees(referrerAddress)
    compareBigNumbers(fee, referrerFee)
  }

  const emitsCorrectEvent = async (eventArgs, referrerAddress, referrerFee) => {
    assert.equal(eventArgs.fee, referrerFee)
    assert.equal(eventArgs.referrer, referrerAddress)
  }

  const transferCorrectly = async (
    balanceBefore,
    referrerFee,
    referrerAddress,
    tokenAddress
  ) => {
    const balanceAfter = await getBalance(referrerAddress, tokenAddress)
    compareBigNumbers(
      balanceAfter,
      balanceBefore.add(keyPrice.mul(referrerFee).div(BASIS_POINT_DENOMINATOR))
    )
  }

  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[deployer, keyOwner, referrer, renewer] = await ethers.getSigners()

        // ERC20 for testing
        dai = await deployERC20(deployer)
        tokenAddress = isErc20 ? dai.address : ADDRESS_ZERO
        await dai.mint(keyOwner.address, someDai)

        // deploy a lock
        lock = await deployLock({ tokenAddress })
        keyPrice = await lock.keyPrice()

        // Approve the lock to make transfers
        await dai.connect(keyOwner).approve(lock.address, someDai)
      })

      it('has a default fee of 0%', async () => {
        const fee = await lock.referrerFees(referrer.address)
        compareBigNumbers(fee.div(BASIS_POINT_DENOMINATOR), 0)
      })

      it('reverts if a non-manager attempts to change the fee', async () => {
        await reverts(
          lock.connect(renewer).updateTransferFee(0),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('setting 5% fee for a specific address', () => {
        const referrerFee = 500
        let balanceBefore
        let eventArgs

        before(async () => {
          ;({ balanceBefore, eventArgs } = await setReferrerFeeAndPurchase({
            isErc20,
            lock,
            referrerAddress: referrer.address,
            referrerFee,
            keyOwner,
          }))
        })

        it('store fee correctly', async () => {
          await storeFeeCorrectly(lock, referrer.address, referrerFee)
        })

        it('emits an event', async () => {
          await emitsCorrectEvent(eventArgs, referrer.address, referrerFee)
        })

        it('transfer correctly 5% of the price', async () => {
          await transferCorrectly(
            balanceBefore,
            referrerFee,
            referrer.address,
            tokenAddress
          )
        })
      })

      describe('setting 20% fee for a specific address', () => {
        const referrerFee = 2000
        let balanceBefore
        let eventArgs

        before(async () => {
          ;({ balanceBefore, eventArgs } = await setReferrerFeeAndPurchase({
            isErc20,
            lock,
            referrerAddress: referrer.address,
            referrerFee,
            keyOwner,
          }))
        })

        it('store fee correctly', async () => {
          await storeFeeCorrectly(lock, referrer.address, referrerFee)
        })

        it('emits an event', async () => {
          await emitsCorrectEvent(eventArgs, referrer.address, referrerFee)
        })

        it('transfer correctly 5% of the price', async () => {
          await transferCorrectly(
            balanceBefore,
            referrerFee,
            referrer.address,
            tokenAddress
          )
        })
      })

      describe('setting 20% general fee for all addresses', () => {
        let balanceBefore, eventArgs
        const generalFee = 1000

        before(async () => {
          // reset fee for referrer
          await lock.setReferrerFee(referrer.address, 0)
          const tx = await lock.setReferrerFee(ADDRESS_ZERO, generalFee)
          const { events } = await tx.wait()
          ;({ args: eventArgs } = events.find(
            ({ event }) => event === 'ReferrerFee'
          ))
        })

        it('store fee correctly', async () => {
          await storeFeeCorrectly(lock, ADDRESS_ZERO, generalFee)
        })

        it('emits an event', async () => {
          await emitsCorrectEvent(eventArgs, ADDRESS_ZERO, generalFee)
        })

        it('transfer correctly 20% of the price', async () => {
          balanceBefore = await getBalance(referrer.address, tokenAddress)

          await lock
            .connect(keyOwner)
            .purchase(
              isErc20 ? [keyPrice] : [],
              [keyOwner.address],
              [referrer.address],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )

          compareBigNumbers(
            await getBalance(referrer.address, tokenAddress),
            balanceBefore.add(
              keyPrice.mul(generalFee).div(BASIS_POINT_DENOMINATOR)
            )
          )
        })
      })

      describe('updating/cancelling a 5% fee', () => {
        before(async () => {
          await lock.setReferrerFee(referrer.address, 500)
        })
        it('fee can cancelled', async () => {
          compareBigNumbers(await lock.referrerFees(referrer.address), 500)
          const tx = await lock.setReferrerFee(referrer.address, 0)
          compareBigNumbers(await lock.referrerFees(referrer.address), 0)
          const { events } = await tx.wait()
          const { args } = events.find(({ event }) => event === 'ReferrerFee')
          assert.equal(args.fee, 0)
          assert.equal(args.referrer, referrer.address)
        })
        it('fee can updated correctly', async () => {
          const tx = await lock.setReferrerFee(referrer.address, 7000)
          // event fired ok
          const { events } = await tx.wait()
          const { args } = events.find(({ event }) => event === 'ReferrerFee')
          assert.equal(args.fee, 7000)
          assert.equal(args.referrer, referrer.address)
          // prived updated ok
          const fee = await lock.referrerFees(referrer.address)
          assert.equal(fee, 7000)
        })
      })

      describe('extend() also pays the referrer', () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(referrer.address, 2000)
          const tx = await lock
            .connect(keyOwner)
            .purchase(
              isErc20 ? [keyPrice] : [],
              [keyOwner.address],
              [referrer.address],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )
          const { events } = await tx.wait()
          const { args } = events.find(({ event }) => event === 'Transfer')
          const { tokenId } = args

          balanceBefore = await getBalance(referrer.address, tokenAddress)

          await lock
            .connect(keyOwner)
            .extend(isErc20 ? keyPrice : 0, tokenId, referrer.address, [], {
              value: isErc20 ? 0 : keyPrice,
            })
        })

        it('transfer 5% of the key price on extend', async () => {
          const balanceAfter = await getBalance(referrer.address, tokenAddress)
          compareBigNumbers(
            balanceAfter,
            balanceBefore.add(keyPrice.mul(2000).div(BASIS_POINT_DENOMINATOR))
          )
        })
      })

      describe('doesnt revert if no referrer is specified', async () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(ADDRESS_ZERO, 2000)
          balanceBefore = await getBalance(referrer.address, tokenAddress)
          await lock
            .connect(keyOwner)
            .purchase(
              isErc20 ? [keyPrice] : [],
              [keyOwner.address],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )
        })
        it('store fee correctly', async () => {
          compareBigNumbers(await lock.referrerFees(ADDRESS_ZERO), 2000)
        })
        it('referrer balance didnt change', async () => {
          compareBigNumbers(
            balanceBefore,
            await getBalance(referrer.address, tokenAddress)
          )
        })
      })

      if (isErc20) {
        describe('renewMembershipFor() also pays the referrer', () => {
          let balanceBefore
          before(async () => {
            await lock.setReferrerFee(referrer.address, 2000)

            const tx = await lock
              .connect(keyOwner)
              .purchase(
                isErc20 ? [keyPrice] : [],
                [keyOwner.address],
                [referrer.address],
                [ADDRESS_ZERO],
                [[]],
                {
                  value: isErc20 ? 0 : keyPrice,
                }
              )

            const { events } = await tx.wait()
            const { args } = events.find(({ event }) => event === 'Transfer')
            const { tokenId } = args

            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await increaseTimeTo(expirationTs)

            // Mint some dais for testing
            await dai.mint(renewer.address, someDai)
            await dai.connect(renewer).approve(lock.address, someDai)

            balanceBefore = await getBalance(referrer.address, tokenAddress)
            await lock
              .connect(renewer)
              .renewMembershipFor(tokenId, referrer.address)
          })

          it('transfer 5% of the key price on extend', async () => {
            const balanceAfter = await getBalance(
              referrer.address,
              tokenAddress
            )
            compareBigNumbers(
              balanceAfter,
              balanceBefore.add(keyPrice.mul(2000).div(BASIS_POINT_DENOMINATOR))
            )
          })
        })
      }
    })
  })
})
