// usage:
// yarn hardhat deploy:contract --contract contracts/utils/UnlockDAOArbitrumBridge.sol --constructor-args `pwd`/scripts/deployArbBridgeArgs.mainnet.js --network arbitrum

const { arbitrum } = require('@unlock-protocol/networks')

const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'

module.exports = [
  arbitrum.uniswapV3.universalRouterAddress, // uniswapUniversalRouter
  arbitrum.tokens.find((token) => token.symbol === 'WETH').address, // l2Weth
  arbitrum.tokens.find((token) => token.symbol === 'ARB').address, // l2Arb
  L1_TIMELOCK_CONTRACT, // l1Timelock
  L2_TIMELOCK_ALIAS, // l2TimelockAlias
]
