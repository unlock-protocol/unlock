const getBalance = require('./getTokenBalance')
const lock = require('./lock')
const constants = require('./constants')
const errors = require('./errors')
const tokens = require('./tokens')
const mainnet = require('./mainnet')
const multisig = require('./multisig')
const deployLocks = require('./deployLocks')
const deployContracts = require('../fixtures/deploy.js')
const time = require('./time')
const interface = require('./interface')
const uniswapV2 = require('./uniswapV2')
const uniswapV3 = require('./uniswapV3')

module.exports = {
  getBalance,
  deployContracts,
  ...lock,
  ...constants,
  ...deployLocks,
  ...tokens,
  ...errors,
  ...mainnet,
  ...multisig,
  ...time,
  ...interface,
  ...uniswapV2,
  ...uniswapV3,
}
