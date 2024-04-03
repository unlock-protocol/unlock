const { mainnet, arbitrum } = require('@unlock-protocol/networks')

const L1_RPC = mainnet.provider // mainnet RPC
const L2_RPC = arbitrum.provider // Arbitrum RPC
const GRANTS_CONTRACT_ADDRESS = '0x00D5E0d31d37cc13C645D86410aB4cB7Cb428ccA' // Grants contract on Arbitrum
const TIMELOCK_L2_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c' // Timelock Alias Address on L2
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B' // Timelock Address mainnet
const ARB_TOKEN_ADRESS_ON_L2 = arbitrum.tokens.filter(
  (token) => token.symbol === 'ARB'
)[0].address // ARB TOKEN ADDRESS ON ARBITRUM ONE

module.exports = {
  L1_RPC,
  L2_RPC,
  ARB_TOKEN_ADRESS_ON_L2,
  GRANTS_CONTRACT_ADDRESS,
  TIMELOCK_L2_ALIAS,
  L1_TIMELOCK_CONTRACT,
}
