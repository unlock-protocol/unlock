// ignoring that rule is needed when using the `describeOrskip` workaround

const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')
const { ethers, network } = require('hardhat')
const {
  deployContracts,
  deployLock,
  ADDRESS_ZERO,
  createUniswapV2Exchange,
} = require('../helpers')

const UnlockDiscountToken = artifacts.require('UnlockDiscountTokenV3.sol')

let unlock, udt, lock, oracle, weth

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrSkip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = 252166 * 2

// test with various chainIds
const scenarios = [
  1, // mainnet
  100, // xdai gnosis
  137, // polygon
]

contract('UnlockDiscountToken (l2/sidechain) / granting Tokens', (accounts) => {
  const [protocolOwner, minter, referrer, keyBuyer] = accounts
  let rate

  before(async () => {
    ;({ unlock, udt } = await deployContracts())
    // parse for truffle
    udt = await UnlockDiscountToken.at(udt.address)

    lock = await deployLock({ unlock })

    // Deploy the exchange
    ;({ oracle, weth } = await createUniswapV2Exchange({
      protocolOwner: await ethers.getSigner(protocolOwner),
      minter: await ethers.getSigner(minter),
      udtAddress: udt.address,
    }))

    // default config Unlock oracle
    await unlock.configUnlock(
      udt.address,
      weth.address,
      estimateGas,
      await unlock.globalTokenSymbol(),
      await unlock.globalBaseTokenURI(),
      1,
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

    rate = await oracle.consult(
      udt.address,
      ethers.utils.parseUnits('1', 'ether'),
      weth.address
    )

    // Mint another 1000000
    await udt.mint(
      unlock.address,
      ethers.utils.parseUnits('1000000', 'ether'),
      {
        from: minter,
      }
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

  it('unlock has some 0 UDT', async () => {
    assert.equal(
      new BigNumber(await udt.balanceOf(await unlock.address))
        .shiftedBy(-18)
        .toFixed(5),
      '1000000.00000'
    )
  })

  scenarios.forEach((chainId) => {
    let balanceReferrer, balanceUnlockOwner, unlockOwner

    describe(`behaviour on chain with ${chainId}`, () => {
      before(async () => {
        unlockOwner = await unlock.owner()
        await unlock.configUnlock(
          udt.address,
          weth.address,
          estimateGas,
          await unlock.globalTokenSymbol(),
          await unlock.globalBaseTokenURI(),
          chainId,
          { from: protocolOwner }
        )
      })

      describe('grant by gas price', () => {
        let gasSpent

        before(async () => {
          // Let's set GDP to be very low (1 wei) so that we know that growth of supply is cap by gas
          await unlock.resetTrackedValue(
            ethers.utils.parseUnits('1', 'wei'),
            0,
            {
              from: protocolOwner,
            }
          )

          const balanceReferrerBefore = await udt.balanceOf(referrer)
          const balanceUnlockOwnerBefore = await udt.balanceOf(unlockOwner)

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

          const { baseFeePerGas } = await ethers.provider.getBlock(blockNumber)
          // using estimatedGas instead of the actual gas used so this test does
          // not regress as other features are implemented
          gasSpent = new BigNumber(baseFeePerGas.toString()).times(estimateGas)

          balanceReferrer = new BigNumber(await udt.balanceOf(referrer)).minus(
            balanceReferrerBefore
          )
          balanceUnlockOwner = new BigNumber(
            await udt.balanceOf(unlockOwner)
          ).minus(balanceUnlockOwnerBefore)
        })

        it('referrer has received some UDT now', async () => {
          assert.notEqual(balanceReferrer.toString(), 0)
        })

        it('amount granted for referrer ~= gas spent', async () => {
          // 120 UDT granted * 0.000042 ETH/UDT == 0.005 ETH spent
          assert.equal(
            balanceReferrer
              .shiftedBy(-18) // shift UDT balance
              .times(rate.toString())
              .shiftedBy(-18) // shift the rate
              .toFixed(3),
            gasSpent.shiftedBy(-18).toFixed(3)
          )
        })

        it('amount granted for dev ~= gas spent * 20%', async () => {
          assert.equal(
            balanceUnlockOwner
              .shiftedBy(-18) // shift UDT balance
              .times(rate.toString())
              .shiftedBy(-18) // shift the rate
              .toFixed(3),
            gasSpent.times(0.25).shiftedBy(-18).toFixed(3)
          )
        })
      })

      describeOrSkip('grant capped by % growth', () => {
        before(async () => {
          // Goal: distribution is 10 UDT (8 for referrer, 2 for dev reward)
          // With 1,000,000 to distribute, that is 0.00001% supply
          // which translates in a gdp growth of 0.002%
          // So we need a GDP of 500 eth
          // Example: ETH = 2000 USD
          // Total value exchanged = 1M USD
          // Key purchase 0.01 ETH = 20 USD
          // user earns 10UDT or
          await unlock.resetTrackedValue(
            ethers.utils.parseUnits('500', 'ether'),
            0,
            {
              from: protocolOwner,
            }
          )

          const baseFeePerGas = 1000000000 // in gwei
          await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
            ethers.BigNumber.from(baseFeePerGas).toHexString(16),
          ])

          const balanceReferrerBefore = await udt.balanceOf(referrer)
          const balanceUnlockOwnerBefore = await udt.balanceOf(unlockOwner)

          await lock.purchase(
            [],
            [keyBuyer],
            [referrer],
            [ADDRESS_ZERO],
            [[]],
            {
              from: keyBuyer,
              value: await lock.keyPrice(),
              gasPrice: ethers.BigNumber.from(baseFeePerGas)
                .mul(2)
                .toHexString(16),
            }
          )

          balanceReferrer = new BigNumber(await udt.balanceOf(referrer)).minus(
            balanceReferrerBefore
          )
          balanceUnlockOwner = new BigNumber(
            await udt.balanceOf(unlockOwner)
          ).minus(balanceUnlockOwnerBefore)
        })

        it('referrer has some UDT now', async () => {
          assert.notEqual(balanceReferrer.toString(), 0)
        })

        it('amount granted for referrer ~= 8 UDT', async () => {
          assert.equal(balanceReferrer.shiftedBy(-18).toFixed(0), '8')
        })

        it('amount granted for dev ~= 2 UDT', async () => {
          assert.equal(balanceUnlockOwner.shiftedBy(-18).toFixed(0), '2')
        })
      })
    })
  })
})
