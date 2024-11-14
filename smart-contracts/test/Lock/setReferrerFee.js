const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  deployERC20,
  compareBigNumbers,
  increaseTimeTo,
} = require('../helpers')

const {
  ADDRESS_ZERO,
  getBalance,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

const BASIS_POINT_DENOMINATOR = 10000n
const someDai = ethers.parseUnits('10', 'ether')

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
    const receipt = await tx.wait()
    const { args: eventArgs } = await getEvent(receipt, 'ReferrerFee')
    const balanceBefore = await getBalance(referrerAddress, tokenAddress)

    const txPurchase = await lock.connect(keyOwner).purchase(
      [
        {
          value: isErc20 ? keyPrice : 0,
          recipient: await keyOwner.getAddress(),
          referrer: referrerAddress,
          protocolReferrer: referrerAddress,
          keyManager: ADDRESS_ZERO,
          data: '0x',
          additionalPeriods: 0,
        },
      ],
      {
        value: isErc20 ? 0 : keyPrice,
      }
    )
    const receiptPurchase = await txPurchase.wait()
    const { args: purchaseEventArgs } = await getEvent(
      receiptPurchase,
      'ReferrerPaid'
    )

    return {
      balanceBefore,
      eventArgs,
      purchaseEventArgs,
    }
  }

  const storeFeeCorrectly = async (lock, referrerAddress, referrerFee) => {
    const fee = await lock.referrerFees(referrerAddress)
    compareBigNumbers(fee, referrerFee)
  }

  const emitsCorrectReferrerFeeEvent = async (
    eventArgs,
    referrerAddress,
    referrerFee
  ) => {
    assert.equal(eventArgs.fee, referrerFee)
    assert.equal(eventArgs.referrer, referrerAddress)
  }

  const emitsCorrectReferrerPaidEvent = async (
    eventArgs,
    tokenAddress,
    referrerAddress,
    referrerFee
  ) => {
    assert.equal(eventArgs.fee, referrerFee)
    assert.equal(eventArgs.tokenAddress, tokenAddress)
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
      balanceBefore + (keyPrice * referrerFee) / BASIS_POINT_DENOMINATOR
    )
  }

  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[deployer, keyOwner, referrer, renewer] = await ethers.getSigners()

        // ERC20 for testing
        dai = await deployERC20(deployer)
        tokenAddress = isErc20 ? await dai.getAddress() : ADDRESS_ZERO
        await dai.mint(await keyOwner.getAddress(), someDai)

        // deploy a lock
        lock = await deployLock({ tokenAddress })
        keyPrice = await lock.keyPrice()

        // Approve the lock to make transfers
        await dai.connect(keyOwner).approve(await lock.getAddress(), someDai)
      })

      it('has a default fee of 0%', async () => {
        const fee = await lock.referrerFees(await referrer.getAddress())
        compareBigNumbers(fee / BASIS_POINT_DENOMINATOR, 0)
      })

      it('reverts if a non-manager attempts to change the fee', async () => {
        await reverts(
          lock.connect(renewer).updateTransferFee(0),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('setting 5% fee for a specific address', () => {
        const referrerFee = 500n
        let balanceBefore
        let eventArgs, purchaseEventArgs

        before(async () => {
          ;({ balanceBefore, eventArgs, purchaseEventArgs } =
            await setReferrerFeeAndPurchase({
              isErc20,
              lock,
              referrerAddress: await referrer.getAddress(),
              referrerFee,
              keyOwner,
            }))
        })

        describe('setting the fee', () => {
          it('store fee correctly', async () => {
            await storeFeeCorrectly(
              lock,
              await referrer.getAddress(),
              referrerFee
            )
          })

          it('emits an event', async () => {
            await emitsCorrectReferrerFeeEvent(
              eventArgs,
              await referrer.getAddress(),
              referrerFee
            )
          })
        })

        describe('purchasing with referrer', () => {
          it('transfer correctly 5% of the price', async () => {
            await transferCorrectly(
              balanceBefore,
              referrerFee,
              await referrer.getAddress(),
              tokenAddress
            )
          })
          it('emits an event when the referrer is paid', async () => {
            await emitsCorrectReferrerPaidEvent(
              purchaseEventArgs,
              tokenAddress,
              await referrer.getAddress(),
              (keyPrice * referrerFee) / BASIS_POINT_DENOMINATOR
            )
          })
        })
      })

      describe('setting 20% fee for a specific address', () => {
        const referrerFee = 2000n
        let balanceBefore
        let eventArgs, purchaseEventArgs

        before(async () => {
          ;({ balanceBefore, eventArgs, purchaseEventArgs } =
            await setReferrerFeeAndPurchase({
              isErc20,
              lock,
              referrerAddress: await referrer.getAddress(),
              referrerFee,
              keyOwner,
            }))
        })
        describe('setting the fee', () => {
          it('store fee correctly', async () => {
            await storeFeeCorrectly(
              lock,
              await referrer.getAddress(),
              referrerFee
            )
          })

          it('emits an event', async () => {
            await emitsCorrectReferrerFeeEvent(
              eventArgs,
              await referrer.getAddress(),
              referrerFee
            )
          })
        })

        describe('purchasing with referrer', () => {
          it('transfer correctly 5% of the price', async () => {
            await transferCorrectly(
              balanceBefore,
              referrerFee,
              await referrer.getAddress(),
              tokenAddress
            )
          })
          it('emits an event when the referrer is paid', async () => {
            await emitsCorrectReferrerPaidEvent(
              purchaseEventArgs,
              tokenAddress,
              await referrer.getAddress(),
              (keyPrice * referrerFee) / BASIS_POINT_DENOMINATOR
            )
          })
        })
      })

      describe('setting 20% general fee for all addresses', () => {
        let balanceBefore, eventArgs, purchaseEventArgs
        const generalFee = 1000n

        before(async () => {
          // reset fee for referrer
          await lock.setReferrerFee(await referrer.getAddress(), 0)
          const tx = await lock.setReferrerFee(ADDRESS_ZERO, generalFee)
          const receipt = await tx.wait()
          ;({ args: eventArgs } = await getEvent(receipt, 'ReferrerFee'))
        })
        describe('setting the fee', () => {
          it('store fee correctly', async () => {
            await storeFeeCorrectly(lock, ADDRESS_ZERO, generalFee)
          })

          it('emits an event', async () => {
            await emitsCorrectReferrerFeeEvent(
              eventArgs,
              ADDRESS_ZERO,
              generalFee
            )
          })
        })
        describe('purchasing with referrer', () => {
          before(async () => {
            balanceBefore = await getBalance(
              await referrer.getAddress(),
              tokenAddress
            )

            const txPurchase = await lock
              .connect(keyOwner)
              .purchase(
                isErc20 ? [keyPrice] : [],
                [await keyOwner.getAddress()],
                [await referrer.getAddress()],
                [ADDRESS_ZERO],
                ['0x'],
                {
                  value: isErc20 ? 0 : keyPrice,
                }
              )
            const receiptPurchase = await txPurchase.wait()
            ;({ args: purchaseEventArgs } = await getEvent(
              receiptPurchase,
              'ReferrerPaid'
            ))
          })
          it('transfer correctly 20% of the price', async () => {
            compareBigNumbers(
              await getBalance(await referrer.getAddress(), tokenAddress),
              balanceBefore + (keyPrice * generalFee) / BASIS_POINT_DENOMINATOR
            )
          })
          it('emits an event when the referrer is paid', async () => {
            await emitsCorrectReferrerPaidEvent(
              purchaseEventArgs,
              tokenAddress,
              await referrer.getAddress(),
              (keyPrice * generalFee) / BASIS_POINT_DENOMINATOR
            )
          })
        })
      })

      describe('updating/cancelling a 5% fee', () => {
        before(async () => {
          await lock.setReferrerFee(await referrer.getAddress(), 500)
        })
        it('fee can cancelled', async () => {
          compareBigNumbers(
            await lock.referrerFees(await referrer.getAddress()),
            500
          )
          const tx = await lock.setReferrerFee(await referrer.getAddress(), 0)
          compareBigNumbers(
            await lock.referrerFees(await referrer.getAddress()),
            0
          )
          const receipt = await tx.wait()
          const { args } = await getEvent(receipt, 'ReferrerFee')
          assert.equal(args.fee, 0)
          assert.equal(args.referrer, await referrer.getAddress())
        })
        it('fee can updated correctly', async () => {
          const tx = await lock.setReferrerFee(
            await referrer.getAddress(),
            7000
          )
          // event fired ok
          const receipt = await tx.wait()
          const { args } = await getEvent(receipt, 'ReferrerFee')
          assert.equal(args.fee, 7000)
          assert.equal(args.referrer, await referrer.getAddress())
          // prived updated ok
          const fee = await lock.referrerFees(await referrer.getAddress())
          assert.equal(fee, 7000)
        })
      })

      describe('extend() also pays the referrer', () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(await referrer.getAddress(), 2000)
          const tx = await lock
            .connect(keyOwner)
            .purchase(
              isErc20 ? [keyPrice] : [],
              [await keyOwner.getAddress()],
              [await referrer.getAddress()],
              [ADDRESS_ZERO],
              ['0x'],
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )
          const receipt = await tx.wait()
          const { args } = await getEvent(receipt, 'Transfer')
          const { tokenId } = args

          balanceBefore = await getBalance(
            await referrer.getAddress(),
            tokenAddress
          )

          await lock
            .connect(keyOwner)
            .extend(
              isErc20 ? keyPrice : 0,
              tokenId,
              await referrer.getAddress(),
              '0x',
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )
        })

        it('transfer 5% of the key price on extend', async () => {
          const balanceAfter = await getBalance(
            await referrer.getAddress(),
            tokenAddress
          )
          compareBigNumbers(
            balanceAfter,
            balanceBefore + (keyPrice * 2000n) / BASIS_POINT_DENOMINATOR
          )
        })
      })

      describe('doesnt revert if no referrer is specified', async () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(ADDRESS_ZERO, 2000)
          balanceBefore = await getBalance(
            await referrer.getAddress(),
            tokenAddress
          )
          await lock
            .connect(keyOwner)
            .purchase(
              isErc20 ? [keyPrice] : [],
              [await keyOwner.getAddress()],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'],
              {
                value: isErc20 ? 0 : keyPrice,
              }
            )
        })
        it('store fee correctly', async () => {
          compareBigNumbers(await lock.referrerFees(ADDRESS_ZERO), 2000n)
        })
        it('referrer balance didnt change', async () => {
          compareBigNumbers(
            balanceBefore,
            await getBalance(await referrer.getAddress(), tokenAddress)
          )
        })
      })

      if (isErc20) {
        describe('renewMembershipFor() also pays the referrer', () => {
          let balanceBefore
          before(async () => {
            await lock.setReferrerFee(await referrer.getAddress(), 2000)

            const tx = await lock
              .connect(keyOwner)
              .purchase(
                isErc20 ? [keyPrice] : [],
                [await keyOwner.getAddress()],
                [await referrer.getAddress()],
                [ADDRESS_ZERO],
                ['0x'],
                {
                  value: isErc20 ? 0 : keyPrice,
                }
              )

            const receipt = await tx.wait()
            const { args } = await getEvent(receipt, 'Transfer')
            const { tokenId } = args

            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await increaseTimeTo(expirationTs)

            // Mint some dais for testing
            await dai.mint(await renewer.getAddress(), someDai)
            await dai.connect(renewer).approve(await lock.getAddress(), someDai)

            balanceBefore = await getBalance(
              await referrer.getAddress(),
              tokenAddress
            )
            await lock
              .connect(renewer)
              .renewMembershipFor(tokenId, await referrer.getAddress())
          })

          it('transfer 5% of the key price on extend', async () => {
            const balanceAfter = await getBalance(
              await referrer.getAddress(),
              tokenAddress
            )
            compareBigNumbers(
              balanceAfter,
              balanceBefore + (keyPrice * 2000n) / BASIS_POINT_DENOMINATOR
            )
          })
        })
      }
    })
  })
})
