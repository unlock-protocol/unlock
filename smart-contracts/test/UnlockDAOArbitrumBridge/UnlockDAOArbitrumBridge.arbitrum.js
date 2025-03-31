const { ethers } = require('hardhat')
const { expect } = require('chai')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')
const { impersonate } = require('@unlock-protocol/hardhat-helpers')
const { reverts } = require('../helpers')

// Arbitrum contract addresses
const WETH = arbitrum.tokens.find((token) => token.symbol === 'WETH').address
const ARB_TOKEN = arbitrum.tokens.find(
  (token) => token.symbol === 'ARB'
).address

const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'
const L1_UDT = mainnet.unlockDaoToken.address
const GATEWAY_ROUTER = '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933'

describe('UnlockDAOArbitrumBridge', () => {
  let bridge
  let arbToken
  let l2TimelockAliasSigner
  let weth
  let gatewayRouter
  let l2UdtToken

  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // For testing purposes, using a signer as timelock
    l2TimelockAliasSigner = await impersonate(L2_TIMELOCK_ALIAS)

    // Get contract factories
    const UnlockDAOArbitrumBridge = await ethers.getContractFactory(
      'UnlockDAOArbitrumBridge'
    )

    // get some ARB tokens
    arbToken = await ethers.getContractAt('IERC20', ARB_TOKEN)

    // Get Gateway Router instance
    gatewayRouter = await ethers.getContractAt(
      'IL2GatewayRouter',
      GATEWAY_ROUTER
    )

    // Deploy bridge contract
    const deployArgs = [
      L1_TIMELOCK_CONTRACT, // l1Timelock
    ]
    bridge = await UnlockDAOArbitrumBridge.deploy(...deployArgs)

    // Get instances of existing contracts
    weth = await ethers.getContractAt('IWETH', WETH)

    // Get L2 UDT token address
    const l2UdtAddress = await gatewayRouter.calculateL2TokenAddress(L1_UDT)
    l2UdtToken = await ethers.getContractAt('IERC20', l2UdtAddress)
  })

  describe('swapAndBridgeArb', () => {
    it('should swap ARB tokens for ETH and bridge to L1', async () => {
      // Get initial balances
      const initialArbBalance = await arbToken.balanceOf(L2_TIMELOCK_ALIAS)
      expect(initialArbBalance.toString()).to.not.equal('0')

      // Transfer ARB tokens to the bridge
      await arbToken
        .connect(l2TimelockAliasSigner)
        .transfer(bridge.getAddress(), initialArbBalance)

      // Execute the swap and bridge
      // NB: we can not test the result of the function because the native bridge requires ArbSys
      // and this is not supported by local forks. If this does revents with native opcode, it means that swap
      // and bridge worked.
      // tested live https://arbiscan.io/address/0x86399725a83bB14C47bB5ce8311Ed25378BAa162#readContract
      // TODO: check final balances and that bridge event was emitted
      await reverts(bridge.swapAndBridgeArb(), 'invalid opcode')
    })
  })

  describe('bridgeUdt', () => {
    it('should bridge UDT tokens back to L1', async () => {
      const testAmount = ethers.parseEther('1000') // 1000 UDT tokens

      // First we need to simulate having some UDT tokens in the bridge contract
      // In a real scenario, these would be transferred from the L2 timelock
      // await addERC20(L1_UDT, testAmount, L2_TIMELOCK_ALIAS)

      await l2UdtToken
        .connect(l2TimelockAliasSigner)
        .transfer(bridge.getAddress(), testAmount)

      // Get initial balances
      const initialBridgeBalance = await l2UdtToken.balanceOf(
        bridge.getAddress()
      )
      expect(initialBridgeBalance).to.equal(testAmount)

      // Execute the bridge
      // NB: we can not test the result of the function because the native bridge requires ArbSys
      // and this is not supported by local forks. If this does revents with native opcode, it means that swap
      // and bridge worked.
      // tested live https://arbiscan.io/address/0x86399725a83bB14C47bB5ce8311Ed25378BAa162#readContract
      // TODO: check final balances and that bridge event was emitted
      await reverts(
        bridge.connect(l2TimelockAliasSigner).bridgeUdt(),
        'invalid opcode'
      )
    })
  })
})
