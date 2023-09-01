const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')

const { deployLock, ADDRESS_ZERO, reverts, deployERC20 } = require('../helpers')

const {
  ZERO_ADDRESS,
  MAX_UINT256,
} = require('@openzeppelin/test-helpers/src/constants')
const { ethers } = require('hardhat')

const BASIS_POINT_DENOMINATOR = 10000
const someDai = ethers.utils.parseUnits('10', 'ether')

const scenarios = [false, true]

contract('Lock / setReferrerFee', (accounts) => {
  let lock
  let dai
  let referrer
  let lockOwner
  let keyOwner
  let tokenAddress
  let keyPrice
  let getBalance

  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        lockOwner = accounts[0]
        keyOwner = accounts[1]
        referrer = accounts[5]

        dai = await deployERC20(lockOwner)
        tokenAddress = isErc20 ? dai.address : ADDRESS_ZERO

        // Mint some dais for testing
        await dai.mint(keyOwner, someDai, {
          from: lockOwner,
        })

        // deploy a lock
        lock = await deployLock({ tokenAddress })
        keyPrice = await lock.keyPrice()

        // Approve the lock to make transfers
        await dai.approve(lock.address, MAX_UINT256, { from: keyOwner })

        getBalance = async (account) =>
          isErc20
            ? new BigNumber(await dai.balanceOf(account))
            : new BigNumber(await ethers.provider.getBalance(account))
      })

      it('has a default fee of 0%', async () => {
        const fee = new BigNumber(await lock.referrerFees(referrer))
        assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toNumber(), 0)
      })

      it('reverts if a non-manager attempts to change the fee', async () => {
        await reverts(
          lock.updateTransferFee(0, { from: accounts[1] }),
          'ONLY_LOCK_MANAGER'
        )
      })

      describe('setting 5% fee for a specific address', () => {
        let balanceBefore
        let tx
        beforeEach(async () => {
          tx = await lock.setReferrerFee(referrer, 500)
          balanceBefore = await getBalance(referrer)
          await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [accounts[8]],
            [referrer],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice,
              from: keyOwner,
            }
          )
        })

        it('store fee correctly', async () => {
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.05)
        })

        it('emits an event', async () => {
          const { args } = tx.logs.find((v) => v.event === 'ReferrerFee')
          assert.equal(args.fee, 500)
          assert.equal(args.referrer, referrer)
        })

        it('transfer correctly 5% of the price', async () => {
          const balanceAfter = await getBalance(referrer)
          assert.equal(
            balanceAfter.toFixed(),
            balanceBefore
              .plus((keyPrice * 500) / BASIS_POINT_DENOMINATOR)
              .toFixed()
          )
        })
      })

      describe('setting 20% fee for a specific address', () => {
        let balanceBefore, tx

        before(async () => {
          // setting 20% fee
          tx = await lock.setReferrerFee(referrer, 2000)

          balanceBefore = await getBalance(referrer)
          await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [keyOwner],
            [referrer],
            [ADDRESS_ZERO],
            [[]],
            {
              from: keyOwner,
              value: isErc20 ? 0 : keyPrice,
            }
          )
        })

        it('store fee correctly', async () => {
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
        })

        it('emits an event', async () => {
          const { args } = tx.logs.find((v) => v.event === 'ReferrerFee')
          assert.equal(args.fee, 2000)
          assert.equal(args.referrer, referrer)
        })

        it('transfer correctly 20% of the tokens', async () => {
          const balanceAfter = await getBalance(referrer)
          assert.equal(
            balanceAfter.toFixed(),
            balanceBefore
              .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR)
              .toFixed()
          )
        })
      })

      describe('setting 20% general fee for all addresses', () => {
        let balanceBefore, tx
        before(async () => {
          tx = await lock.setReferrerFee(ZERO_ADDRESS, 2000)
          balanceBefore = await getBalance(referrer)
          await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [accounts[8]],
            [referrer],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice,
              from: keyOwner,
            }
          )
        })
        it('store fee correctly', async () => {
          const fee = new BigNumber(await lock.referrerFees(ZERO_ADDRESS))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
        })

        it('emits an event', async () => {
          const { args } = tx.logs.find((v) => v.event === 'ReferrerFee')
          assert.equal(args.fee.toNumber(), 2000)
          assert.equal(args.referrer, ZERO_ADDRESS)
        })

        it('transfer correctly 5% of the price', async () => {
          const balanceAfter = await getBalance(referrer)
          assert.equal(
            balanceAfter.toFixed(),
            balanceBefore
              .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR)
              .toFixed()
          )
        })
      })

      describe('updating/cancelling a 5% fee', () => {
        before(async () => {
          await lock.setReferrerFee(referrer, 500)
        })
        it('fee can cancelled', async () => {
          const tx = await lock.setReferrerFee(referrer, 0)
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toNumber(), 0)
          const { args } = tx.logs.find((v) => v.event === 'ReferrerFee')
          assert.equal(args.fee, 0)
          assert.equal(args.referrer, referrer)
        })
        it('fee can updated correctly', async () => {
          const tx = await lock.setReferrerFee(referrer, 7000)
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.7)
          const { args } = tx.logs.find((v) => v.event === 'ReferrerFee')
          assert.equal(args.fee.toNumber(), 7000)
          assert.equal(args.referrer, referrer)
        })
      })

      describe('extend() also pays the referrer', () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(referrer, 2000)
          const tx = await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [keyOwner],
            [referrer],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice,
              from: keyOwner,
            }
          )

          const { args } = tx.logs.find((v) => v.event === 'Transfer')
          const { tokenId } = args

          balanceBefore = await getBalance(referrer)

          await lock.extend(isErc20 ? keyPrice : 0, tokenId, referrer, [], {
            value: isErc20 ? 0 : keyPrice,
            from: keyOwner,
          })
        })

        it('transfer 5% of the key price on extend', async () => {
          const balanceAfter = await getBalance(referrer)
          assert.equal(
            balanceAfter.toFixed(),
            balanceBefore
              .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR)
              .toFixed()
          )
        })
      })

      describe('doesnt revert if no referrer is specified', async () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(ZERO_ADDRESS, 2000)
          balanceBefore = await getBalance(referrer)
          await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [keyOwner],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice,
              from: keyOwner,
            }
          )
        })
        it('store fee correctly', async () => {
          const fee = new BigNumber(await lock.referrerFees(ZERO_ADDRESS))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
        })
        it('referrer balance didnt change', async () => {
          assert.equal(
            balanceBefore.toString(),
            (await getBalance(referrer)).toString()
          )
        })
      })

      if (isErc20) {
        describe('renewMembershipFor() also pays the referrer', () => {
          let balanceBefore
          before(async () => {
            await lock.setReferrerFee(referrer, 2000)

            const tx = await lock.purchase(
              isErc20 ? [keyPrice] : [],
              [accounts[8]],
              [referrer],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice,
                from: keyOwner,
              }
            )

            const { args } = tx.logs.find((v) => v.event === 'Transfer')
            const { tokenId } = args

            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await time.increaseTo(expirationTs.toNumber())

            // Mint some dais for testing
            const renewer = accounts[8]
            await dai.mint(renewer, someDai, {
              from: lockOwner,
            })
            await dai.approve(lock.address, MAX_UINT256, { from: renewer })

            balanceBefore = await getBalance(referrer)
            await lock.renewMembershipFor(tokenId, referrer, {
              from: renewer,
            })
          })

          it('transfer 5% of the key price on extend', async () => {
            const balanceAfter = await getBalance(referrer)
            assert.equal(
              balanceAfter.toFixed(),
              balanceBefore
                .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR)
                .toFixed()
            )
          })
        })
      }
    })
  })
})
