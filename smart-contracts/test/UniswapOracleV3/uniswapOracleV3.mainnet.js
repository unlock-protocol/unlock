const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

const {
  getTokens,
  getNetwork,
  addSomeETH,
} = require('@unlock-protocol/hardhat-helpers')

// very unprecise way to round up things...
const round = (bn) => Math.floor(parseInt(bn.slice(0, 3)))

const FEE = 500
describe(`oracle`, () => {
  let oracle, pairs, DAI, WETH, USDC
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    const [signer] = await ethers.getSigners()
    await addSomeETH(await signer.getAddress())
    ;({ DAI, WETH, USDC } = await getTokens())
    pairs = [
      [USDC, WETH],
      [DAI, WETH],
      [WETH, DAI],
      [USDC, DAI],
      // [ETH, USDC],
    ].map(([one, two]) => [
      // make sure we got correct checksum
      ethers.getAddress(one),
      ethers.getAddress(two),
    ])

    const {
      uniswapV3: { factoryAddress },
    } = await getNetwork()

    const UnlockUniswapOracle =
      await ethers.getContractFactory('UniswapOracleV3')
    oracle = await UnlockUniswapOracle.deploy(factoryAddress, FEE)
  })

  describe('consult', () => {
    it('returns prices correctly', async () => {
      // check all pairs
      await Promise.all(
        pairs.map(async ([token0, token1]) => {
          const converted = await oracle.consult(
            token0,
            ethers.parseEther('1'),
            token1
          )
          assert.equal(converted.constructor.name, 'BigNumber')
          assert.equal(
            round(
              await oracle.consult(token0, ethers.parseEther('0.1'), token1)
            ),
            round(converted / 10)
          )

          assert.equal(
            round(
              await oracle.consult(token0, ethers.parseEther('10'), token1)
            ),
            round(converted * 10)
          )
        })
      )
    })

    it('DAI and USDC has roughly the same value', async () => {
      assert.equal(
        round(await oracle.consult(WETH, ethers.parseEther('1'), USDC)),
        round(await oracle.consult(WETH, ethers.parseEther('1'), DAI))
      )
    })
    it('throws if pair doesnt exist', async () => {
      const [{ address: one }, { address: two }] = await ethers.getSigners()
      reverts(
        oracle.consult(one, ethers.parseEther('1'), two),
        `MISSING_POOL(${one},${two})`
      )
    })
  })
})
