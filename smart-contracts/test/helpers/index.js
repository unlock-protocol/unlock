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
}
