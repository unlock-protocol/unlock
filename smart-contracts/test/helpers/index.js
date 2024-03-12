const balance = require('./balance')
const lock = require('./lock')
const constants = require('./constants')
const errors = require('./errors')
const tokens = require('./tokens')
const multisig = require('./multisig')
const deployLocks = require('./deployLocks')
const deployContracts = require('../fixtures/deploy.js')
const time = require('./time')
const interface = require('./interface')
const uniswapV2 = require('./uniswapV2')
const math = require('./math')
const roles = require('./roles')
const upgrades = require('./upgrades')
const versions = require('./versions')
const bridge = require('./bridge')
const events = require('./events')
const bigNumber = require('./bigNumber')
const password = require('./password')

module.exports = {
  deployContracts,
  ...balance,
  ...lock,
  ...constants,
  ...deployLocks,
  ...tokens,
  ...errors,
  ...multisig,
  ...time,
  ...interface,
  ...uniswapV2,
  ...math,
  ...roles,
  ...upgrades,
  ...versions,
  ...bridge,
  ...events,
  ...bigNumber,
  ...password,
}
