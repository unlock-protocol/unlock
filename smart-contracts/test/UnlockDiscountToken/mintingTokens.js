/* eslint-disable jest/no-identical-title */
// ignoring that rule is needed when using the `describe` workaround

const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')
const { ethers, network } = require('hardhat')
const {
  ADDRESS_ZERO,
  deployContracts,
  deployLock,
  createExchange,
} = require('../helpers')

const UnlockDiscountToken = artifacts.require('UnlockDiscountTokenV3.sol')

let unlock
let udt
let lock

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrskip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = 252166 * 2
const baseFeePerGas = 1000000000 // in gwei

contract('UnlockDiscountToken (mainnet) / mintingTokens', (accounts) => {
  const [protocolOwner, minter, referrer, keyBuyer] = accounts
  let rate

  before(async () => {
    ;({ unlock, udt } = await deployContracts())

    // parse for truffle
    udt = await UnlockDiscountToken.at(udt.address)

    // create a lock
    lock = await deployLock({ unlock })

    // grant Unlock minting permissions
    await udt.addMinter(unlock.address, { from: minter })

    // deploy uniswap exchange
    const { oracle, weth } = await createExchange({
      protocolOwner: await ethers.getSigner(protocolOwner),
      minter: await ethers.getSigner(minter),
      udtAddress: udt.address,
    })

    // config unlock
    await unlock.configUnlock(
      udt.address,
      weth.address,
      estimateGas,
      await unlock.globalTokenSymbol(),
      await unlock.globalBaseTokenURI(),
      1, // mainnet
      { from: protocolOwner }
    )
    await unlock.setOracle(udt.address, oracle.address, {
      from: protocolOwner,
    })

    // Advance time so 1 full period has past and then update again so we have data point to read
    await time.increase(time.duration.hours(30))
    await oracle.update(weth.address, udt.address)

    // Purchase a valid key for the referrer
    await lock.purchase([], [referrer], [ADDRESS_ZERO], [ADDRESS_ZERO], [[]], {
      from: referrer,
      value: await lock.keyPrice(),
    })

    // allow multiiple keys per owner
    await lock.setMaxKeysPerAddress(10)

    rate = await oracle.consult(
      udt.address,
      web3.utils.toWei('1', 'ether'),
      weth.address
    )
  })

  it('exchange rate is > 0', async () => {
    assert.notEqual(ethers.utils.formatUnits(rate), 0)
    // 1 UDT is worth ~0.000042 ETH
    assert.equal(Math.floor(ethers.utils.formatUnits(rate, 12)), 42)
  })

  it('referrer has 0 UDT to start', async () => {
    const actual = await udt.balanceOf(referrer)
    assert.equal(actual.toString(), 0)
  })

  it('owner starts with 0 UDT', async () => {
    assert.equal(
      new BigNumber(await udt.balanceOf(await unlock.owner())).toFixed(),
      '0'
    )
  })

  describe('mint by gas price', () => {
    let gasSpent

    before(async () => {
      const { blockNumber } = await lock.purchase(
        [],
        [keyBuyer],
        [referrer],
        [ADDRESS_ZERO],
        [[]],
        {
          from: keyBuyer,
          value: await lock.keyPrice(),
        }
      )

      const { baseFeePerGas: baseFeePerGasBlock } =
        await ethers.provider.getBlock(blockNumber)

      // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
      gasSpent = new BigNumber(baseFeePerGasBlock.toString()).times(estimateGas)
    })

    it('referrer has some UDT now', async () => {
      const actual = await udt.balanceOf(referrer)
      assert.notEqual(actual.toString(), 0)
    })

    it('amount minted for referrer ~= gas spent', async () => {
      // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
      assert.equal(
        new BigNumber(await udt.balanceOf(referrer))
          .shiftedBy(-18) // shift UDT balance
          .times(rate.toString())
          .shiftedBy(-18) // shift the rate
          .toFixed(3),
        gasSpent.shiftedBy(-18).toFixed(3)
      )
    })

    it('amount minted for dev ~= gas spent * 20%', async () => {
      assert.equal(
        new BigNumber(await udt.balanceOf(await unlock.owner()))
          .shiftedBy(-18) // shift UDT balance
          .times(rate.toString())
          .shiftedBy(-18) // shift the rate
          .toFixed(3),
        gasSpent.times(0.25).shiftedBy(-18).toFixed(3)
      )
    })
  })

  describeOrskip('mint capped by % growth', () => {
    let ownerBalanceBefore
    before(async () => {
      // 1,000,000 UDT minted thus far
      // Test goal: 10 UDT minted for the referrer (less than the gas cost equivalent of ~120 UDT)
      // keyPrice / GNP / 2 = 10 * 1.25 / 1,000,000 == 40,000 * keyPrice

      const initialGdp = new BigNumber(await lock.keyPrice()).times(40000)
      await unlock.resetTrackedValue(initialGdp.toFixed(0), 0, {
        from: protocolOwner,
      })

      // set basefee
      await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        ethers.BigNumber.from(baseFeePerGas).toHexString(16),
      ])
      ownerBalanceBefore = await udt.balanceOf(await unlock.owner())

      const { receipt } = await lock.purchase(
        [],
        [keyBuyer],
        [referrer],
        [ADDRESS_ZERO],
        [[]],
        {
          from: keyBuyer,
          value: await lock.keyPrice(),
          gasPrice: ethers.BigNumber.from(baseFeePerGas).mul(2).toHexString(16), // needed for coverage
        }
      )

      const { baseFeePerGas: baseFeePerGasBlockTx } =
        await ethers.provider.getBlock(receipt.blockNumber)
      assert(baseFeePerGasBlockTx.eq(baseFeePerGas))
    })

    it('referrer has some UDT now', async () => {
      const actual = await udt.balanceOf(referrer)
      assert.notEqual(actual.toString(), 0)
    })

    it('amount minted for referrer ~= 10 UDT', async () => {
      assert.equal(
        new BigNumber(await udt.balanceOf(referrer)).shiftedBy(-18).toFixed(0),
        '10'
      )
    })

    it('amount minted for dev ~= 2 UDT', async () => {
      const balance = await udt.balanceOf(await unlock.owner())

      assert.equal(
        new BigNumber(balance.sub(ownerBalanceBefore).toString())
          .shiftedBy(-18)
          .toFixed(0),
        '2'
      )
    })
  })

  describe('extend()', () => {
    let gasSpent
    let tokenId
    let balanceBefore
    let balanceOwnerBefore

    before(async () => {
      const { logs } = await lock.purchase(
        [],
        [keyBuyer],
        [referrer],
        [ADDRESS_ZERO],
        [[]],
        {
          from: keyBuyer,
          value: await lock.keyPrice(),
        }
      )

      const { args } = logs.find((v) => v.event === 'Transfer')
      const { tokenId: newTokenId } = args
      tokenId = newTokenId

      balanceBefore = new BigNumber(await udt.balanceOf(referrer))
      balanceOwnerBefore = new BigNumber(
        await udt.balanceOf(await unlock.owner())
      )

      const { blockNumber } = await lock.extend(0, tokenId, referrer, [], {
        from: keyBuyer,
        value: await lock.keyPrice(),
      })

      const { baseFeePerGas: baseFeePerGasBlock } =
        await ethers.provider.getBlock(blockNumber)

      // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
      gasSpent = new BigNumber(baseFeePerGasBlock.toString()).times(estimateGas)
    })

    it('referrer has some UDT now', async () => {
      const actual = new BigNumber(await udt.balanceOf(referrer)).minus(
        balanceBefore
      )
      assert.notEqual(actual.toString(), 0)
    })

    it('amount minted for referrer ~= gas spent', async () => {
      // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent

      assert.equal(
        new BigNumber(await udt.balanceOf(referrer))
          .minus(balanceBefore)
          .shiftedBy(-18) // shift UDT balance
          .times(rate.toString())
          .shiftedBy(-18) // shift the rate
          .toFixed(3),
        gasSpent.shiftedBy(-18).toFixed(3)
      )
    })

    it('amount minted for dev ~= gas spent * 20%', async () => {
      assert.equal(
        new BigNumber(await udt.balanceOf(await unlock.owner()))
          .minus(balanceOwnerBefore.toString())
          .shiftedBy(-18) // shift UDT balance
          .times(rate.toString())
          .shiftedBy(-18) // shift the rate
          .toFixed(3),
        gasSpent.times(0.25).shiftedBy(-18).toFixed(3)
      )
    })
  })
})
