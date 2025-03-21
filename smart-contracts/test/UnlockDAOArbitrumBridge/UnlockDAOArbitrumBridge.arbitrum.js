const { ethers } = require('hardhat')
const { expect } = require('chai')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')
const { impersonate, getEvent } = require('@unlock-protocol/hardhat-helpers')

// Arbitrum contract addresses
const ARB_GATEWAY_ROUTER = '0x9fDD1C4E4AA24EEc1d913FABea925594a20d43C7'
const WETH = arbitrum.tokens.find((token) => token.symbol === 'WETH').address
const UNISWAP_UNIVERSAL_ROUTER = arbitrum.uniswapV3.universalRouterAddress
const ARB_TOKEN = arbitrum.tokens.find(
  (token) => token.symbol === 'ARB'
).address
const ARB_WHALE = '0xF3FC178157fb3c87548bAA86F9d24BA38E649B58'
// DAO addresses
const L1_UDT = mainnet.unlockDaoToken.address
const L2_UDT = arbitrum.unlockDaoToken.address
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
// const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'

describe('UnlockDAOArbitrumBridge', () => {
  let bridge
  let arbToken
  let owner
  let l2TimelockAlias
  let weth

  before(async () => {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[owner] = await ethers.getSigners()
    l2TimelockAlias = owner.getAddress() // For testing purposes, using owner as timelock

    // Get contract factories
    const UnlockDAOArbitrumBridge = await ethers.getContractFactory(
      'UnlockDAOArbitrumBridge'
    )

    // get some ARB tokens
    arbToken = await ethers.getContractAt('IERC20', ARB_TOKEN)
    const arbWhale = await impersonate(ARB_WHALE)
    await arbToken
      .connect(arbWhale)
      .transfer(l2TimelockAlias, ethers.parseEther('1000000'))

    // Deploy bridge contract
    const deployArgs = [
      ARB_GATEWAY_ROUTER, // routerGateway
      UNISWAP_UNIVERSAL_ROUTER, // uniswapUniversalRouter
      WETH, // l2Weth
      ARB_TOKEN, // l2Arb
      L1_UDT, // l1Udt
      L1_TIMELOCK_CONTRACT, // l1Timelock
      l2TimelockAlias, // l2TimelockAlias
    ]
    bridge = await UnlockDAOArbitrumBridge.deploy(...deployArgs)

    // Get instances of existing contracts
    weth = await ethers.getContractAt('IWETH', WETH)
  })

  describe('swapAndBridgeArb', () => {
    it('should swap ARB tokens for ETH and bridge to L1', async () => {
      // We need to get some ARB tokens first
      // This would typically involve getting tokens from a holder or minting them

      const amountOutMinimum = ethers.parseEther('0.1') // Minimum amount of ETH to receive

      // Get initial balances
      const initialArbBalance = await arbToken.balanceOf(l2TimelockAlias)
      expect(initialArbBalance.toString()).to.not.equal('0')

      // Approve ARB tokens for the bridge
      await arbToken.approve(bridge.getAddress(), initialArbBalance)

      // Execute the swap and bridge
      await bridge.swapAndBridgeArb(amountOutMinimum)

      // Check final balances
      const finalArbBalance = await arbToken.balanceOf(l2TimelockAlias)
      const finalEthBalance = await ethers.provider.getBalance(
        await bridge.getAddress()
      )

      expect(finalArbBalance).to.be.equal(0)
      expect(finalEthBalance).to.equal(0) // All ETH should be bridged

      // TODO: check that bridge event was emitted
    })
  })
})
