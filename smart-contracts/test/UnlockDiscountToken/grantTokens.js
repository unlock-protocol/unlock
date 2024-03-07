// TODO: cleanup this test
// ignoring that rule is needed when using the `describeOrskip` workaround

const { assert } = require('chai')
const { ethers, network } = require('hardhat')
const {
  deployContracts,
  deployLock,
  ADDRESS_ZERO,
  createUniswapV2Exchange,
  compareBigNumbers,
  increaseTime,
} = require('../helpers')

let unlock, udt, lock, oracle, weth
let protocolOwner, minter, referrer, keyBuyer

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrSkip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = 252166 * 2

// test with various chainIds
const scenarios = [
  1, // mainnet
  100, // xdai gnosis
  137, // polygon
]

const mintAmount = ethers.utils.parseUnits('1000000', 'ether')

const round = (bn) => {
  const [integral, decimals] = bn.split('.')
  const remainer = Math.round(`0.${decimals.slice(0, 4)}`).toString()
  return ethers.BigNumber.from(integral).add(remainer)
}

describe('UnlockDiscountToken (l2/sidechain) / granting Tokens', () => {
  let rate

  before(async function () {
    ;[protocolOwner, minter, referrer, keyBuyer] = await ethers.getSigners()
    ;({ unlock, udt } = await deployContracts())
    lock = await deployLock({ unlock })

    // Deploy the exchange
    ;({ oracle, weth } = await createUniswapV2Exchange({
      protocolOwner,
      minter,
      udtAddress: udt.address,
    }))

    // default config Unlock oracle
    await unlock.configUnlock(
      udt.address,
      weth.address,
      estimateGas,
      await unlock.globalTokenSymbol(),
      await unlock.globalBaseTokenURI(),
      1
    )

    await unlock.setOracle(udt.address, oracle.address)

    // Advance time so 1 full period has past and then update again so we have data point to read
    await increaseTime(30)
    await oracle.update(weth.address, udt.address)

    // Purchase a valid key for the referrer
    await lock.purchase(
      [],
      [referrer.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: await lock.keyPrice(),
      }
    )

    rate = await oracle.consult(
      udt.address,
      ethers.utils.parseUnits('1', 'ether'),
      weth.address
    )

    // Mint another 1000000
    await udt.connect(minter).mint(unlock.address, mintAmount)
  })

  it('exchange rate is > 0', async () => {
    assert.notEqual(ethers.utils.formatUnits(rate), 0)
    // 1 UDT is worth ~0.000042 ETH
    assert.equal(Math.floor(ethers.utils.formatUnits(rate, 12)), 42)
  })

  it('referrer has 0 UDT to start', async () => {
    const actual = await udt.balanceOf(referrer.address)
    compareBigNumbers(actual, '0')
  })

  it('owner starts with 0 UDT', async () => {
    compareBigNumbers(await udt.balanceOf(await unlock.owner()), '0')
  })

  it('unlock has some 0 UDT', async () => {
    compareBigNumbers(await udt.balanceOf(await unlock.address), mintAmount)
  })

  scenarios.forEach((chainId) => {
    let balanceReferrer

    describe(`behaviour on chain with ${chainId}`, () => {
      before(async () => {
        await unlock.configUnlock(
          udt.address,
          weth.address,
          estimateGas,
          await unlock.globalTokenSymbol(),
          await unlock.globalBaseTokenURI(),
          chainId
        )
      })

      describeOrSkip('grant by gas price', () => {
        let gasSpent

        before(async () => {
          // Let's set GDP to be very low (1 wei) so that we know that growth of supply is cap by gas
          await unlock.resetTrackedValue(ethers.utils.parseUnits('1', 'wei'), 0)

          const balanceReferrerBefore = await udt.balanceOf(referrer.address)
          const { blockNumber } = await lock
            .connect(keyBuyer)
            .purchase(
              [],
              [keyBuyer.address],
              [referrer.address],
              [ADDRESS_ZERO],
              [[]],
              {
                value: await lock.keyPrice(),
              }
            )

          const { baseFeePerGas } = await ethers.provider.getBlock(blockNumber)

          // using estimatedGas instead of the actual gas used so this test does
          // not regress as other features are implemented
          gasSpent = baseFeePerGas.mul(estimateGas)

          balanceReferrer = (await udt.balanceOf(referrer.address)).sub(
            balanceReferrerBefore
          )
        })

        it('referrer has received some UDT now', async () => {
          assert.notEqual(balanceReferrer.toString(), '0')
        })

        it('amount granted for referrer ~= gas spent', async () => {
          // 120 UDT granted * 0.000042 ETH/UDT == 0.005 ETH spent
          compareBigNumbers(
            gasSpent,
            round(ethers.utils.formatEther(balanceReferrer.mul(rate)))
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
            0
          )

          const baseFeePerGas = 1000000000 // in gwei
          await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
            ethers.BigNumber.from(baseFeePerGas).toHexString(16),
          ])

          const balanceReferrerBefore = await udt.balanceOf(referrer.address)
          await lock
            .connect(keyBuyer)
            .purchase(
              [],
              [keyBuyer.address],
              [referrer.address],
              [ADDRESS_ZERO],
              [[]],
              {
                value: await lock.keyPrice(),
                gasPrice: ethers.BigNumber.from(baseFeePerGas)
                  .mul(2)
                  .toHexString(16),
              }
            )

          balanceReferrer = (await udt.balanceOf(referrer.address)).sub(
            balanceReferrerBefore
          )
        })

        it('referrer has some UDT now', async () => {
          assert.notEqual(balanceReferrer.toString(), 0)
        })

        it('amount granted for referrer ~= 10 UDT', async () => {
          assert.equal(
            Math.round(ethers.utils.formatEther(balanceReferrer)),
            '10'
          )
        })
      })
    })
  })
})
