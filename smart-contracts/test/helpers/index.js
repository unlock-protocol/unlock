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
const uniswap = require('./uniswap.js')
const math = require('./math')
const roles = require('./roles')
const upgrades = require('./upgrades')
const versions = require('./versions')
const bridge = require('./bridge')
const events = require('./events')
const bigNumber = require('./bigNumber')
const up = require('./up')

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
  ...uniswap,
  ...math,
  ...roles,
  ...upgrades,
  ...versions,
  ...bridge,
  ...events,
  ...bigNumber,
  ...up,
}
