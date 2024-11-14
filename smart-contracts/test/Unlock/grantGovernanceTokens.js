const assert = require('assert')
const { ethers } = require('hardhat')
const {
  getBalance,
  deployContracts,
  deployLock,
  createMockOracle,
  compareBigNumbers,
  deployWETH,
  deployERC20,
  getUp,
} = require('../helpers')

const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

let unlock, up, udt, swap, lock, oracle, weth, token
let deployer, minter, protocolReferrer, keyBuyer, referrer, recipient
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

// check for both UDT and UP
const governanceTokenTestCases = ['UDT', 'UP']

// check if lock is ERC20 or native
const lockTestCases = [true, false]

describe('UnlockGovernanceToken / granting Tokens', () => {
  lockTestCases.forEach((isERC20) => {
    describe(`lock is priced in ${isERC20 ? 'erc20' : 'native'} tokens`, () => {
      before(async function () {
        // here the "protocolReferrer"
        ;[deployer, minter, keyBuyer, recipient, protocolReferrer, referrer] =
          await ethers.getSigners()
        ;({ unlock, up, udt, swap } = await deployContracts())
        weth = await deployWETH(deployer)

        if (isERC20) {
          token = await deployERC20(deployer)
        }

        // setup lock
        lock = await deployLock({
          unlock,
          tokenAddress: isERC20 ? await token.getAddress() : ADDRESS_ZERO,
        })
        keyPrice = await lock.keyPrice()

        if (isERC20) {
          // get buyer some tokens to purchase keys
          await token.mint(await keyBuyer.getAddress(), initialAmount)
          await token
            .connect(keyBuyer)
            .approve(await lock.getAddress(), initialAmount)
        }
      })

      governanceTokenTestCases.forEach((symbol) => {
        let governanceToken
        let governanceTokenRate

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

            // deploy the oracle with a fixed UDT <> WETH rate
            const rates = [
              {
                tokenIn: await governanceToken.getAddress(),
                rate: symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE,
                tokenOut: await weth.getAddress(),
              },
            ]
            // add ERC20 <> WETH rate id needed
            if (isERC20) {
              rates.push({
                tokenIn: await token.getAddress(),
                rate: ERC20_RATE,
                tokenOut: await weth.getAddress(),
              })
            }

            // setup oracle with rates
            oracle = await createMockOracle({
              rates,
            })

            // Purchase a valid key for the protocolReferrer
            await lock
              .connect(keyBuyer)
              .purchase(
                isERC20 ? [keyPrice] : [],
                [await protocolReferrer.getAddress()],
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
            if (isERC20) {
              await unlock.setOracle(
                await token.getAddress(),
                await oracle.getAddress()
              )
            }

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

          it(`protocolReferrer has 0 ${symbol} to start`, async () => {
            const actual = await governanceToken.balanceOf(
              await protocolReferrer.getAddress()
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
            if (isERC20) {
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
            }
          })

          describe(`grant rewards in ${symbol} based on protocol fee`, () => {
            let balanceReferrerBefore, unlockBalanceBefore
            before(async () => {
              // set protocol fee to 1%
              await unlock.setProtocolFee(PROTOCOL_FEE)

              balanceReferrerBefore = await governanceToken.balanceOf(
                await protocolReferrer.getAddress()
              )

              unlockBalanceBefore = await getBalance(
                await unlock.getAddress(),
                isERC20 ? await token.getAddress() : null
              )

              // purchase a key with refferer
              await lock.connect(keyBuyer).purchase(
                [
                  {
                    value: keyPrice,
                    recipient: await recipient.getAddress(),
                    referrer: await referrer.getAddress(),
                    protocolReferrer: await protocolReferrer.getAddress(),
                    keyManager: ADDRESS_ZERO,
                    data: '0x',
                    additionalPeriods: 0,
                  },
                ],
                {
                  value: isERC20 ? 0 : keyPrice,
                }
              )
            })

            it('unlock has received protocol fee in ERC20', async () => {
              const balance = await getBalance(
                await unlock.getAddress(),
                isERC20 ? await token.getAddress() : null
              )
              assert.equal(
                balance - unlockBalanceBefore,
                (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN
              )
            })

            it(`protocolReferrer has received ${symbol} based on protocol fee`, async () => {
              const amountEarned =
                (await governanceToken.balanceOf(
                  await protocolReferrer.getAddress()
                )) - balanceReferrerBefore
              assert.notEqual(amountEarned, 0n)

              const rate = symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE
              const protocolFee = (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN

              // fee in native tokens
              const fee = isERC20
                ? (protocolFee * ERC20_RATE) / 10n ** 18n
                : protocolFee

              assert.equal(amountEarned, ((fee / 2n) * rate) / 10n ** 18n)
            })
          })

          describe(`grant rewards in ${symbol} and referrer fee separately`, () => {
            let balanceProtocolReferrerBefore,
              balanceReferrerBefore,
              unlockBalanceBefore
            const REFERRER_FEE = 2000n
            before(async () => {
              // set protocol fee to 1%
              await unlock.setProtocolFee(PROTOCOL_FEE)

              // set referrer fee to 20% for all addresses
              await lock.setReferrerFee(ADDRESS_ZERO, REFERRER_FEE)

              balanceProtocolReferrerBefore = await governanceToken.balanceOf(
                await protocolReferrer.getAddress()
              )

              balanceReferrerBefore = await getBalance(
                await referrer.getAddress(),
                isERC20 ? await token.getAddress() : null
              )

              unlockBalanceBefore = await getBalance(
                await unlock.getAddress(),
                isERC20 ? await token.getAddress() : null
              )

              // purchase a key with refferer
              await lock.connect(keyBuyer).purchase(
                [
                  {
                    value: keyPrice,
                    recipient: await recipient.getAddress(),
                    referrer: await referrer.getAddress(),
                    protocolReferrer: await protocolReferrer.getAddress(),
                    keyManager: ADDRESS_ZERO,
                    data: '0x',
                    additionalPeriods: 0,
                  },
                ],
                {
                  value: isERC20 ? 0 : keyPrice,
                }
              )
            })

            it('unlock has received protocol fee', async () => {
              const balance = await getBalance(
                await unlock.getAddress(),
                isERC20 ? await token.getAddress() : null
              )
              assert.equal(
                balance - unlockBalanceBefore,
                (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN
              )
            })

            it('referrer has received referrer fee', async () => {
              const balance = await getBalance(
                await referrer.getAddress(),
                isERC20 ? await token.getAddress() : null
              )
              assert.equal(
                balance - balanceReferrerBefore,
                (keyPrice * REFERRER_FEE) / BASIS_POINTS_DEN
              )
            })

            it(`protocolReferrer has received ${symbol} based on protocol fee`, async () => {
              const amountEarned =
                balanceProtocolReferrerBefore -
                (await governanceToken.balanceOf(await referrer.getAddress()))

              assert.notEqual(amountEarned, 0n)

              const rate = symbol === 'UP' ? UP_WETH_RATE : UDT_WETH_RATE
              const protocolFee = (keyPrice * PROTOCOL_FEE) / BASIS_POINTS_DEN

              // fee in native tokens
              const fee = isERC20
                ? (protocolFee * ERC20_RATE) / 10n ** 18n
                : protocolFee

              assert.equal(amountEarned, ((fee / 2n) * rate) / 10n ** 18n)
            })
          })
        })
      })
    })
  })
})
