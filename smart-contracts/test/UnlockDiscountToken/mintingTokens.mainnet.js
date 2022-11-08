/* eslint-disable jest/no-identical-title */
// ignoring that rule is needed when using the `describe` workaround

const { ethers, network } = require('hardhat')
const {
  ADDRESS_ZERO,
  deployLock,
  deployOracle,
  getUnlockMainnet,
  getUDTMainnet,
  UDT,
  WETH,
  createPool,
  addLiquidity,
  getPoolState,
} = require('../helpers')

let udt
let lock
let unlock
let oracle
let unlockOwner

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrskip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = 252166 * 2
const baseFeePerGas = ethers.BigNumber.from(1000000000) // in gwei

contract('UnlockDiscountToken (mainnet) / mintingTokens', () => {
  let rate
  let unlockBalanceBefore
  let referrer, keyBuyer

  before(async function () {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }
    // signers
    ;[referrer, keyBuyer] = await ethers.getSigners()

    // get contracts from mainnet
    udt = await getUDTMainnet()
    unlock = await getUnlockMainnet()
    unlockOwner = await unlock.owner()
    unlockBalanceBefore = await udt.balanceOf(unlockOwner)

    // create UDT/WETH pool
    const pool = await createPool()
    console.log(await getPoolState(pool))

    // add some liquidity
    const { liquidity, amount0, amount1 } = await addLiquidity(pool)
    console.log({
      liquidity,
      amount0,
      amount1,
    })
    console.log(await getPoolState(pool))

    // deploy uniswap oracle
    oracle = await deployOracle()
    await unlock.setOracle(UDT, oracle.address)

    // await time.increase(time.duration.hours(1))
    // create a lock
    lock = await deployLock({ unlock, isEthers: true })

    // Purchase a valid key for the referrer
    await lock
      .connect(referrer)
      .purchase([], [referrer.address], [ADDRESS_ZERO], [ADDRESS_ZERO], [[]], {
        value: await lock.keyPrice(),
      })

    // TODO get rate from oracle
    rate = ethers.BigNumber.from('40000000000')
    // rate = await oracle.consult(
    //   UDT,
    //   ethers.utils.parseUnits('1', 'ether'),
    //   WETH
    // )
  })

  // it('exchange rate is > 0', async () => {
  //   assert.notEqual(ethers.utils.formatUnits(rate), 0)
  //   // 1 UDT is worth ~0.000042 ETH
  //   assert.equal(Math.floor(ethers.utils.formatUnits(rate, 12)), 42)
  // })

  it('referrer has 0 UDT to start', async () => {
    const actual = await udt.balanceOf(referrer.address)
    assert.equal(actual.toString(), '0')
  })

  it('unlock starts with UDT', async () => {
    assert.notEqual(unlockBalanceBefore.toString(), '0')
  })

  describe('mint by gas price', () => {
    let gasSpent
    before(async () => {
      unlockBalanceBefore = await udt.balanceOf(unlockOwner)
      const tx = await lock.purchase(
        [],
        [keyBuyer.address],
        [referrer.address],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      const { blockNumber } = await tx.wait()
      const { baseFeePerGas: baseFeePerGasBlock } =
        await ethers.provider.getBlock(blockNumber)

      // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
      gasSpent = baseFeePerGasBlock.mul(estimateGas)

      rate = await oracle.consult(
        UDT,
        ethers.utils.parseUnits('1', 'ether'),
        WETH
      )
    })

    it('referrer has some UDT now', async () => {
      const referrerBalance = await udt.balanceOf(referrer.address)
      assert.notEqual(referrerBalance.toString(), '0')
    })

    it('amount minted for referrer ~= gas spent', async () => {
      // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
      const referrerBalance = await udt.balanceOf(referrer.address)
      assert.equal(referrerBalance.mul(rate).toString(), gasSpent.toString())
    })

    it('amount minted for dev ~= gas spent * 20%', async () => {
      const unlockBalance = await udt.balanceOf(unlockOwner)
      assert.equal(
        unlockBalance.sub(unlockBalanceBefore).mul(rate).toString(),
        gasSpent.mul('25').div('100').toString()
      )
    })
  })

  describeOrskip('mint capped by % growth', () => {
    before(async () => {
      // 1,000,000 UDT minted thus far
      // Test goal: 10 UDT minted for the referrer (less than the gas cost equivalent of ~120 UDT)
      // keyPrice / GNP / 2 = 10 * 1.25 / 1,000,000 == 40,000 * keyPrice

      const initialGdp = (await lock.keyPrice()).mul(40000)
      await unlock.resetTrackedValue(initialGdp, 0)

      // set basefee
      await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        baseFeePerGas.toHexString(16),
      ])

      unlockBalanceBefore = await udt.balanceOf(unlockOwner)
      const { receipt } = await lock.purchase(
        [],
        [keyBuyer.address],
        [referrer.address],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
          gasPrice: baseFeePerGas.mul(2).toHexString(16), // needed for coverage
        }
      )

      const { baseFeePerGas: baseFeePerGasBlockTx } =
        await ethers.provider.getBlock(receipt.blockNumber)
      assert(baseFeePerGasBlockTx.eq(baseFeePerGas))
    })

    it('referrer has some UDT now (~= 10 UDT)', async () => {
      const referrerBalance = await udt.balanceOf(referrer.address)
      assert.notEqual(referrerBalance.toString(), '0')
      assert.equal(referrerBalance.toString(), '10')
    })

    it('amount minted for dev ~= 2 UDT', async () => {
      const balance = await udt.balanceOf(unlockOwner)
      assert.equal(balance.sub(unlockBalanceBefore).toString(), '2')
    })
  })

  describe('extend()', () => {
    let gasSpent
    let tokenId
    let referrerBalanceBefore

    before(async () => {
      const tx = await lock.purchase(
        [],
        [keyBuyer.address],
        [referrer.address],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      const { events } = await tx.wait()
      const { args } = events.find(({ event }) => event === 'Transfer')
      const { tokenId: newTokenId } = args
      tokenId = newTokenId

      referrerBalanceBefore = await udt.balanceOf(referrer.address)
      unlockBalanceBefore = await udt.balanceOf(await unlock.owner())

      const txExtend = await lock.extend(0, tokenId, referrer.address, [], {
        value: await lock.keyPrice(),
      })
      const { blockNumber } = await txExtend.wait()

      const { baseFeePerGas: baseFeePerGasBlock } =
        await ethers.provider.getBlock(blockNumber)

      // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
      gasSpent = baseFeePerGasBlock.mul(estimateGas)
    })

    it('referrer has some UDT now (~= gas spent)', async () => {
      const referrerBalance = await udt.balanceOf(referrer.address)
      assert.notEqual(
        referrerBalance.sub(referrerBalanceBefore).toString(),
        '0'
      )
      // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
      assert.equal(
        referrerBalance.sub(referrerBalanceBefore).mul(rate).toString(),
        gasSpent.toString()
      )
    })

    it('amount minted for dev ~= gas spent * 20%', async () => {
      const balance = await udt.balanceOf(unlockOwner)
      assert.equal(
        balance.sub(unlockBalanceBefore).mul(rate).toString(),
        gasSpent.mul('25').div('100').toString()
      )
    })
  })
})
