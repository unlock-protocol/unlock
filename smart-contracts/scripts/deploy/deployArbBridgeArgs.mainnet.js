// usage:
// yarn hardhat deploy:contract --contract contracts/utils/UnlockDAOArbitrumBridge.sol --constructor-args `pwd`/scripts/deployArbBridgeArgs.mainnet.js --network arbitrum

const { arbitrum, mainnet } = require('@unlock-protocol/networks')

const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const GATEWAY_ROUTER = '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933'

module.exports = [
  arbitrum.uniswapV3.universalRouterAddress, // uniswapUniversalRouter
  GATEWAY_ROUTER, // gatewayRouter
  arbitrum.tokens.find((token) => token.symbol === 'WETH').address, // l2Weth
  arbitrum.tokens.find((token) => token.symbol === 'ARB').address, // l2Arb
  mainnet.unlockDaoToken.address, // l1Udt
  L1_TIMELOCK_CONTRACT, // l1Timelock
]
