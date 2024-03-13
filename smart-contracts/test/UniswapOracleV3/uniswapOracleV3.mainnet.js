const { expect } = require('chai')
const { ethers } = require('hardhat')
const { reverts } = require('../helpers')

const { getTokens, getNetwork } = require('@unlock-protocol/hardhat-helpers')

// very unprecise way to round up things...
const round = (bn) => Math.floor(parseInt(bn.toString().slice(0, 3)))

describe(`oracle`, () => {
  let oracle, pairs, DAI, WETH, USDC
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    ;({ DAI, WETH, USDC } = await getTokens())
    pairs = [
      [USDC, WETH],
      [DAI, WETH],
      [WETH, DAI],
      [USDC, DAI],
      // [ETH, USDC],
    ].map(([one, two]) => [
      // make sure we got correct checksum
      ethers.utils.getAddress(one),
      ethers.utils.getAddress(two),
    ])

    const {
      uniswapV3: { factoryAddress },
    } = await getNetwork()

    const UnlockUniswapOracle = await ethers.getContractFactory(
      'UniswapOracleV3'
    )
    oracle = await UnlockUniswapOracle.deploy(factoryAddress)
  })

  describe('consult', () => {
    it('returns prices correctly', async () => {
      // check all pairs
      await Promise.all(
        pairs.map(async ([token0, token1]) => {
          const converted = await oracle.consult(
            token0,
            ethers.utils.parseEther('1'),
            token1
          )
          expect(converted.constructor.name).to.equals('BigNumber')
          expect(
            round(
              await oracle.consult(
                token0,
                ethers.utils.parseEther('0.1'),
                token1
              )
            )
          ).to.be.equals(round(converted.div(10)))

          expect(
            round(
              await oracle.consult(
                token0,
                ethers.utils.parseEther('10'),
                token1
              )
            )
          ).to.be.equals(round(converted.mul(10)))
        })
      )
    })

    it('DAI and USDC has roughly the same value', async () => {
      expect(
        round(await oracle.consult(WETH, ethers.utils.parseEther('1'), USDC))
      ).to.be.equals(
        round(await oracle.consult(WETH, ethers.utils.parseEther('1'), DAI))
      )
    })
    it('throws if pair doesnt exist', async () => {
      const [{ address: one }, { address: two }] = await ethers.getSigners()
      reverts(
        oracle.consult(one, ethers.utils.parseEther('1'), two),
        `MISSING_POOL(${one},${two})`
      )
    })
  })
})
