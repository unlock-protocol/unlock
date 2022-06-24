const getBalance = require('./getTokenBalance')
const lock = require('./lock')
const constants = require('./constants')
const errors = require('./errors')
const tokens = require('./tokens')
const uniswap = require('./uniswap')
const mainnet = require('./mainnet')
const multisig = require('./multisig')
const deployLocks = require('./deployLocks')
const deployContracts = require('../fixtures/deploy.js')

module.exports = {
  getBalance,
  deployContracts,
  ...lock,
  ...constants,
  ...uniswap,
  ...deployLocks,
  ...tokens,
  ...errors,
  ...mainnet,
  ...multisig,
}
