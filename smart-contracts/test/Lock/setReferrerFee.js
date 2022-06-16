const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('../helpers/constants')
const { tokens } = require('hardlydifficult-ethereum-contracts')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')

const Unlock = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const {
  ZERO_ADDRESS,
  MAX_UINT256,
} = require('@openzeppelin/test-helpers/src/constants')

const BASIS_POINT_DENOMINATOR = 10000
const someDai = new BigNumber(web3.utils.toWei('10', 'ether'))

const scenarios = [false, true]

contract('Lock / setReferrerFee', (accounts) => {
  let lock
  let dai
  let unlock
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

        dai = await tokens.dai.deploy(web3, lockOwner)
        tokenAddress = isErc20 ? dai.address : ADDRESS_ZERO

        // Mint some dais for testing
        await dai.mint(keyOwner, someDai, {
          from: lockOwner,
        })

        // get locks
        unlock = await getContractInstance(Unlock)
        const locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks.FIRST
        await lock.setMaxKeysPerAddress(10)

        keyPrice = await lock.keyPrice()

        // Approve the lock to make transfers
        await dai.approve(lock.address, MAX_UINT256, { from: keyOwner })

        getBalance = async (account) =>
          isErc20
            ? new BigNumber(await dai.balanceOf(account))
            : new BigNumber(await web3.eth.getBalance(account))
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
        beforeEach(async () => {
          await lock.setReferrerFee(referrer, 500)
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
        let balanceBefore

        before(async () => {
          // setting 20% fee
          await lock.setReferrerFee(referrer, 2000)

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
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(ZERO_ADDRESS, 2000)
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
          await lock.setReferrerFee(referrer, 0)
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toNumber(), 0)
        })
        it('fee can updated correctly', async () => {
          await lock.setReferrerFee(referrer, 7000)
          const fee = new BigNumber(await lock.referrerFees(referrer))
          assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.7)
        })
      })

      describe('extend() also pays the referrer', () => {
        let balanceBefore
        before(async () => {
          await lock.setReferrerFee(referrer, 2000)
          balanceBefore = await getBalance(referrer)

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
              .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR) // purchase
              .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR) // extend
              .toFixed()
          )
        })
      })
    })
  })
})
