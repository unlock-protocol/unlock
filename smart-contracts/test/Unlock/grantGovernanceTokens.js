const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployContracts,
  deployLock,
  ADDRESS_ZERO,
  createMockOracle,
  compareBigNumbers,
  deployWETH,
  deployERC20,
  getUp,
} = require('../helpers')

let unlock, up, udt, swap, lock, oracle, weth, token
let deployer, minter, referrer, keyBuyer
let keyPrice

const estimateGas = BigInt(252166 * 2)
const initialAmount = ethers.parseUnits('100', 'ether')

// 1 UP is worth ~0.00000042 ETH
const UP_WETH_RATE = ethers.parseEther('0.00000042')
const UDT_WETH_RATE = UP_WETH_RATE / 1000n

// arbitrarly decided
const ERC20_RATE = ethers.parseEther('0.02')

// 1% in basis points
const PROTOCOL_FEE = 100n
const BASIS_POINTS_DEN = 10000n

//
const governanceTokenTestCases = ['UDT', 'UP']

describe('UnlockGovernanceToken / granting Tokens', () => {
  before(async function () {
    ;[deployer, minter, keyBuyer, referrer] = await ethers.getSigners()
    ;({ unlock, up, udt, swap } = await deployContracts())
    weth = await deployWETH(deployer)
    token = await deployERC20(deployer)

    // setup lock
    lock = await deployLock({ unlock, tokenAddress: await token.getAddress() })
    keyPrice = await lock.keyPrice()

    // get buyer some tokens to purchase keys
    await token.mint(await keyBuyer.getAddress(), initialAmount)
    await token
      .connect(keyBuyer)
      .approve(await lock.getAddress(), initialAmount)
  })

  governanceTokenTestCases.forEach((symbol) => {
    let governanceToken
    let governanceTokenRate
    let lockTokenRate

    describe(`behaviour with ${symbol}`, () => {
      before(async function () {
        // gov token settings
        governanceToken = symbol === 'UP' ? up : udt

        // config unlock
        await unlock.configUnlock(
          await governanceToken.getAddress(),
          await weth.getAddress(),
          estimateGas,
          await unlock.globalTokenSymbol(),
          await unlock.globalBaseTokenURI(),
          31337 // chainId
        )

        // deploy the oracle with a fixed rate
        oracle = await createMockOracle({
          rates: [
            // ERC20 <> WETH rate
            {
              tokenIn: await token.getAddress(),
              rate: ERC20_RATE,
              tokenOut: await weth.getAddress(),
            },
            // UDT <> WETH rate
            {
              tokenIn: await governanceToken.getAddress(),
              rate: symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE,
              tokenOut: await weth.getAddress(),
            },
          ],
        })

        // Purchase a valid key for the referrer
        await lock
          .connect(keyBuyer)
          .purchase(
            [keyPrice],
            [await referrer.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x'],
            {
              value: await lock.keyPrice(),
            }
          )

        // set oracles in Unlock
        await unlock.setOracle(
          await governanceToken.getAddress(),
          await oracle.getAddress()
        )
        await unlock.setOracle(
          await token.getAddress(),
          await oracle.getAddress()
        )

        // get rates from oracle
        governanceTokenRate = await oracle.consult(
          await governanceToken.getAddress(),
          ethers.parseUnits('1', 'ether'),
          await weth.getAddress()
        )

        // mint token
        if (symbol === 'UP') {
          await getUp({
            udt,
            swap,
            spender: minter,
            recipient: unlock,
            amount: initialAmount,
          })
        } else {
          await udt
            .connect(minter)
            .mint(await unlock.getAddress(), initialAmount)
        }
      })

      it(`referrer has 0 ${symbol} to start`, async () => {
        const actual = await governanceToken.balanceOf(
          await referrer.getAddress()
        )
        compareBigNumbers(actual, '0')
      })

      it(`owner starts with 0 ${symbol}`, async () => {
        compareBigNumbers(
          await governanceToken.balanceOf(await unlock.owner()),
          '0'
        )
      })

      it(`unlock has ${symbol}`, async () => {
        assert.equal(
          await governanceToken.balanceOf(await await unlock.getAddress()),
          symbol === 'UP' ? initialAmount * 1000n : initialAmount
        )
      })

      describe('rates', () => {
        it(`exchange rate for ${symbol} is set`, async () => {
          assert.equal(
            governanceTokenRate,
            symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE
          )
        })
        it(`exchange rate for ERC20 is set`, async () => {
          assert.equal(
            await oracle.consult(
              await token.getAddress(),
              ethers.parseUnits('1', 'ether'),
              await weth.getAddress()
            ),
            ERC20_RATE
          )
        })
      })

      describe(`grant rewards in ${symbol} based on protocol fee`, () => {
        let balanceReferrerBefore, unlockBalanceBefore
        before(async () => {
          // set protocol fee to 1%
          await unlock.setProtocolFee(PROTOCOL_FEE)

          balanceReferrerBefore = await governanceToken.balanceOf(
            await referrer.getAddress()
          )

          unlockBalanceBefore = await token.balanceOf(await unlock.getAddress())

          // purchase a key with refferer
          await lock
            .connect(keyBuyer)
            .purchase(
              [keyPrice],
              [await keyBuyer.getAddress()],
              [await referrer.getAddress()],
              [ADDRESS_ZERO],
              ['0x'],
              {
                value: keyPrice,
              }
            )
        })

        it('unlock has received protocol fee in ERC20', async () => {
          assert.equal(
            (await token.balanceOf(await unlock.getAddress())) -
              unlockBalanceBefore,
            (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN
          )
        })

        it(`referrer has received ${symbol} based on protocol fee`, async () => {
          const balanceReferrer =
            (await governanceToken.balanceOf(await referrer.getAddress())) -
            balanceReferrerBefore
          assert.notEqual(balanceReferrer, 0n)

          const protocolFee = (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN
          const protocolFeeInWETH = (protocolFee * ERC20_RATE) / 10n ** 18n
          const rate = symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE
          assert.equal(
            balanceReferrer,
            ((protocolFeeInWETH / 2n) * rate) / 10n ** 18n
          )
        })
      })
    })
  })
})
