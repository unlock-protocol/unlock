const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('../helpers/constants')
const { tokens } = require('hardlydifficult-ethereum-contracts')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')

const Unlock = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')

const BASIS_POINT_DENOMINATOR = 10000
const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
const someDai = new BigNumber(web3.utils.toWei('10', 'ether'))

contract('Lock / setReferrerFee', (accounts) => {
  let lock
  let unlock
  let referrer
  let referrer2
  let lockOwner
  let keyOwner

  before(async () => {
    lockOwner = accounts[0]
    keyOwner = accounts[1]
    referrer = accounts[5]
    referrer2 = accounts[6]

    unlock = await getContractInstance(Unlock)

    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
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

  describe('setting 5% fee (in ETH)', () => {
    let balanceBefore
    beforeEach(async () => {
      await lock.setReferrerFee(referrer, 500)
      balanceBefore = new BigNumber(await web3.eth.getBalance(referrer))
      await lock.purchase([], [accounts[8]], [referrer], [ADDRESS_ZERO], [[]], {
        value: await lock.keyPrice(),
      })
    })

    it('store fee correctly', async () => {
      const fee = new BigNumber(await lock.referrerFees(referrer))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.05)
    })

    it('transfer correctly 5% of the price', async () => {
      const balanceAfter = new BigNumber(await web3.eth.getBalance(referrer))
      assert.equal(
        balanceAfter.toFixed(),
        balanceBefore.plus((keyPrice * 500) / BASIS_POINT_DENOMINATOR).toFixed()
      )
    })
  })

  describe('erc20 - setting 20% fee', () => {
    let balanceBefore
    let dai
    let erc20Lock

    before(async () => {
      dai = await tokens.dai.deploy(web3, lockOwner)

      // Mint some dais for testing
      await dai.mint(keyOwner, someDai, {
        from: lockOwner,
      })

      const locks = await deployLocks(unlock, lockOwner, dai.address)
      erc20Lock = locks.ERC20

      // setting 20% fee
      await erc20Lock.setReferrerFee(referrer, 2000)

      // Approve the lock to make transfers
      await dai.approve(erc20Lock.address, keyPrice, { from: keyOwner })

      balanceBefore = new BigNumber(await dai.balanceOf(referrer))
      await erc20Lock.purchase(
        [keyPrice],
        [keyOwner],
        [referrer],
        [ADDRESS_ZERO],
        [[]],
        { from: keyOwner }
      )
    })

    it('store fee correctly', async () => {
      const fee = new BigNumber(await erc20Lock.referrerFees(referrer))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
    })

    it('transfer correctly 20% of the tokens', async () => {
      const balanceAfter = new BigNumber(await dai.balanceOf(referrer))
      assert.equal(
        balanceAfter.toFixed(),
        balanceBefore
          .plus((keyPrice * 2000) / BASIS_POINT_DENOMINATOR)
          .toFixed()
      )
    })
  })

  describe('setting 20% general fee', () => {
    let balanceBefore
    before(async () => {
      await lock.setReferrerFee(ZERO_ADDRESS, 2000)
      balanceBefore = new BigNumber(await web3.eth.getBalance(referrer2))
      await lock.purchase(
        [],
        [accounts[8]],
        [referrer2],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )
    })
    it('store fee correctly', async () => {
      const fee = new BigNumber(await lock.referrerFees(ZERO_ADDRESS))
      assert.equal(fee.div(BASIS_POINT_DENOMINATOR).toFixed(), 0.2)
    })

    it('transfer correctly 5% of the price', async () => {
      const balanceAfter = new BigNumber(await web3.eth.getBalance(referrer2))
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
      balanceBefore = new BigNumber(await web3.eth.getBalance(referrer))

      const tx = await lock.purchase(
        [],
        [accounts[8]],
        [referrer],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args
      console.log(tokenId)
      console.log(tokenId.toNumber())

      await lock.extend(0, tokenId, referrer, [], {
        value: await lock.keyPrice(),
      })
    })

    it('transfer 5% of the key price on extend', async () => {
      const balanceAfter = new BigNumber(await web3.eth.getBalance(referrer))
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
